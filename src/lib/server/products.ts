import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { Status, ProductType } from "#/generated/prisma/enums";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import Decimal from "decimal.js";
import { saveMovementIn } from "./services";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "products");

const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
};

const StockLocationProductScheme = z.object({
  id: z.string().optional(),
  stock_location_id: z.string().min(1, "Lokasi stok harus dipilih"),
  quantity: z.number().min(0, "Jumlah stok tidak boleh negatif"),
  is_primary: z.boolean().default(false),
});

const CreateProductImageScheme = z.object({
  base64: z.string(),
  filename: z.string(),
});

const CreateProductSkuScheme = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .length(12, "Kode SKU harus 12 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode SKU hanya boleh huruf kapital dan angka"),
  name: z.string().optional(),
  price: z.number().min(0, "Harga harus lebih besar dari 0"),
  buy_price: z.number().min(0, "Harga beli harus lebih besar dari 0"),
  status: z.enum(["active", "inactive"]),
  unit_id: z.string().min(1, "Unit harus dipilih"),
  images: z.array(CreateProductImageScheme).optional(),
  stock_locations: z.array(StockLocationProductScheme).optional(),
});

const CreateProductScheme = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  description: z.string().optional(),
  type: z.enum(["item", "service"]),
  is_variant: z.boolean().default(false),
  category_ids: z.array(z.string()).optional(),
  skus: z.array(CreateProductSkuScheme).min(1, "Minimal 1 SKU harus diisi"),
});

const UpdateProductImageScheme = z.object({
  id: z.string().optional(),
  base64: z.string().optional(),
  filename: z.string().optional(),
});

const UpdateProductSkuScheme = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .length(12, "Kode SKU harus 12 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode SKU hanya boleh huruf kapital dan angka"),
  name: z.string().optional().nullable(),
  price: z.number().min(0, "Harga harus lebih besar dari 0"),
  buy_price: z.number().min(0, "Harga beli harus lebih besar dari 0"),
  status: z.enum(["active", "inactive"]),
  unit_id: z.string().min(1, "Unit harus dipilih"),
  images: z.array(UpdateProductImageScheme).optional(),
  stock_locations: z.array(StockLocationProductScheme).optional(),
});

const UpdateProductScheme = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama produk harus diisi"),
  description: z.string().optional().nullable(),
  type: z.enum(["item", "service"]),
  is_variant: z.boolean().default(false),
  category_ids: z.array(z.string()).optional(),
  skus: z.array(UpdateProductSkuScheme).min(1, "Minimal 1 SKU harus diisi"),
});

const generateRandom12Digits = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export const getProductsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const products = await prisma.productSku.findMany({
        include: {
          images: true,
          product: true,
          stockProductSkus: {
            include: {
              stockLocation: true,
            },
          },
          unit: true,
        },
        orderBy: {
          product: {
            created_at: "desc",
          },
        },
      });

      return products.map((p) => ({
        id: p.product.id,
        sku_id: p.id,
        display_name: p.product.name + (p.name ? ` - ${p.name}` : ""),
        sku_name: p.name,
        product_name: p.product.name,
        sku_image_path: p.images.length > 0 ? p.images[0].path : "",
        stock_quantity: p.stock_quantity,
        price: p.price,
        type: p.product.type,
        stock_locations: p.stockProductSkus.map((sl) => ({
          id: sl.stockLocation.id,
          quantity: sl.quantity,
          name: sl.stockLocation.name,
          is_primary: sl.is_primary,
        })),
      }));
    }),
);

export const getProductFn = createServerFn({ method: "GET" })
  .inputValidator(parseZod(z.object({ id: z.string().min(1) })))
  .handler(async ({ data }) =>
    wrap(async () => {
      const product = await prisma.product.findUnique({
        where: { id: data.id },
        include: {
          productSkus: {
            include: {
              unit: true,
              images: true,
              stockProductSkus: {
                include: {
                  stockLocation: true,
                },
              },
            },
          },
          productCategories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!product) {
        throw new ResponseError("Produk tidak ditemukan");
      }

      return product;
    }),
  );

export const getCreateProductFormInitFn = createServerFn({
  method: "GET",
}).handler(async () =>
  wrap(async () => {
    const [categories, units, stockLocations] = await Promise.all([
      await prisma.category.findMany({
        where: {
          status: "active",
        },
      }),
      await prisma.unit.findMany({
        where: {
          status: "active",
        },
      }),
      await prisma.stockLocation.findMany({
        where: {
          status: "active",
        },
      }),
    ]);

    const placeholderSkuCodes = Array(20)
      .fill("")
      .map(() => generateRandom12Digits());

    return {
      categories,
      units,
      stockLocations,
      placeholderSkuCodes,
    };
  }),
);

export const createProductFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(CreateProductScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const skuCodes = data.skus.map((sku) => sku.code);
      if (skuCodes.length !== new Set(skuCodes).size) {
        throw new ResponseError("Kode SKU tidak boleh duplikat");
      }

      const existingSkus = await prisma.productSku.findMany({
        where: {
          code: {
            in: skuCodes,
          },
        },
      });

      if (existingSkus.length > 0) {
        throw new ResponseError(
          `Kode SKU sudah digunakan: ${existingSkus.map((s) => s.code).join(", ")}`,
        );
      }

      const product = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            id: randomUUID(),
            name: data.name,
            description: data.description,
            type: data.type as ProductType,
            is_variant: data.is_variant,
          },
        });

        if (data.category_ids && data.category_ids.length > 0) {
          await tx.productCategory.createMany({
            data: data.category_ids.map((categoryId) => ({
              product_id: product.id,
              category_id: categoryId,
            })),
          });
        }

        for (const sku of data.skus) {
          const createdSku = await tx.productSku.create({
            data: {
              id: randomUUID(),
              code: sku.code,
              product_id: product.id,
              name: sku.name,
              price: sku.price,
              buy_price: sku.buy_price,
              stock_quantity: 0,
              status: sku.status as Status,
              unit_id: sku.unit_id,
            },
          });

          if (sku.stock_locations && sku.stock_locations.length > 0) {
            const primaryCount = sku.stock_locations.filter(
              (loc) => loc.is_primary,
            ).length;
            if (primaryCount > 1) {
              throw new ResponseError(
                `SKU ${sku.code} hanya boleh memiliki satu lokasi stok utama`,
              );
            }

            for (const stockLoc of sku.stock_locations) {
              await saveMovementIn(tx, {
                is_primary: stockLoc.is_primary,
                location_id: stockLoc.stock_location_id,
                product_sku_id: createdSku.id,
                quantity: new Decimal(stockLoc.quantity),
                buy_price: sku.buy_price,
                note: "Tambah Stock Awal Produk",
                reference_id: createdSku.id,
                reference_type: "product_skus",
              });
            }
          }

          if (sku.images && sku.images.length > 0) {
            await ensureUploadDir();

            const skuImages = await Promise.all(
              sku.images.map(async (image) => {
                const extension = image.filename.split(".").pop();
                const uniqueFilename = `${randomUUID()}.${extension}`;
                const filePath = join(UPLOAD_DIR, uniqueFilename);
                const relativePath = `/uploads/products/${uniqueFilename}`;

                let base64Data = image.base64 as string;
                if (base64Data.includes(";base64,")) {
                  base64Data = base64Data.split(";base64,").pop() || base64Data;
                }

                const buffer = Buffer.from(base64Data, "base64");
                await writeFile(filePath, buffer);

                return {
                  id: randomUUID(),
                  product_sku_id: createdSku.id,
                  path: relativePath,
                };
              }),
            );

            await tx.productSkuImage.createMany({
              data: skuImages,
            });
          }
        }

        return product;
      });

      return product;
    }),
  );

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(UpdateProductScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
        include: {
          productSkus: {
            include: {
              stockProductSkus: true,
              images: true,
            },
          },
        },
      });

      if (!existingProduct) {
        throw new ResponseError("Produk tidak ditemukan");
      }

      const existingSkus = await prisma.productSku.findMany({
        where: {
          product_id: data.id,
        },
        include: {
          images: true,
        },
      });

      const deletedSkus = existingSkus.filter(
        (es) => data.skus.filter((se) => se.id == es.id).length == 0,
      );
      const updatedSkus = existingSkus.filter(
        (es) => data.skus.filter((se) => se.id == es.id).length > 0,
      );
      const newSkus = data.skus.filter(
        (rs) => existingSkus.filter((se) => se.id == rs.id).length == 0,
      );

      const result = await prisma.$transaction(async (tx) => {
        for (const sku of deletedSkus) {
          const existingSku = existingSkus.find((es) => es.id == sku.id);
          if (existingSku!.stock_quantity.toNumber() > 0) {
            throw new ResponseError(
              `SKU ${existingSku?.name} masih memiliki stock`,
            );
          }

          await tx.stockMovement.deleteMany({
            where: {
              stockProductSku: {
                product_sku_id: sku.id,
              },
            },
          });

          await tx.stockProductSku.deleteMany({
            where: {
              product_sku_id: sku.id,
            },
          });

          const existingImage = await tx.productSkuImage.findMany({
            where: {
              product_sku_id: sku.id,
            },
          });

          if (existingImage.length > 0) {
            for (const image of existingImage) {
              const fullPath = join(process.cwd(), "public", image.path);
              try {
                await unlink(fullPath);
              } catch (error) {
                console.error("Error deleting file:", error);
              }
            }

            await tx.productSkuImage.deleteMany({
              where: {
                product_sku_id: sku.id,
              },
            });
          }

          await tx.productSku.delete({
            where: {
              id: sku.id,
            },
          });
        }

        for (const existingSku of updatedSkus) {
          const updateSku = data.skus.find((es) => es.id == existingSku.id)!;

          const deletedImage = existingSku.images.filter(
            (image) =>
              (updateSku.images || []).filter((ni) => ni.id == image.id)
                .length == 0,
          );
          const newImage = updateSku.images?.filter(
            (ni) =>
              existingSku.images.filter((ei) => ei.id == ni.id).length == 0,
          );

          if (deletedImage && deletedImage.length > 0) {
            for (const image of deletedImage) {
              const fullPath = join(process.cwd(), "public", image.path);
              try {
                await unlink(fullPath);
              } catch (error) {
                console.error("Error deleting file:", error);
              }
            }

            await tx.productSkuImage.deleteMany({
              where: {
                product_sku_id: existingSku.id,
              },
            });
          }

          if (newImage && newImage.length > 0) {
            await ensureUploadDir();

            const skuImages = await Promise.all(
              newImage.map(async (image) => {
                const extension = image.filename!.split(".").pop();
                const uniqueFilename = `${randomUUID()}.${extension}`;
                const filePath = join(UPLOAD_DIR, uniqueFilename);
                const relativePath = `/uploads/products/${uniqueFilename}`;

                let base64Data = image.base64 as string;
                if (base64Data.includes(";base64,")) {
                  base64Data = base64Data.split(";base64,").pop() || base64Data;
                }

                const buffer = Buffer.from(base64Data, "base64");
                await writeFile(filePath, buffer);

                return {
                  id: randomUUID(),
                  product_sku_id: existingSku.id,
                  path: relativePath,
                };
              }),
            );

            await tx.productSkuImage.createMany({
              data: skuImages,
            });
          }

          await tx.productSku.update({
            data: {
              name: updateSku.name,
              code: updateSku.code,
              unit_id: updateSku.unit_id,
              buy_price: updateSku.buy_price,
              price: updateSku.price,
              status: updateSku.status,
            },
            where: {
              id: updateSku.id,
            },
          });
        }

        for (const sku of newSkus) {
          const createdSku = await tx.productSku.create({
            data: {
              id: randomUUID(),
              code: sku.code,
              product_id: existingProduct.id,
              name: sku.name,
              price: sku.price,
              buy_price: sku.buy_price,
              stock_quantity: 0,
              status: sku.status as Status,
              unit_id: sku.unit_id,
            },
          });

          if (sku.stock_locations && sku.stock_locations.length > 0) {
            const primaryCount = sku.stock_locations.filter(
              (loc) => loc.is_primary,
            ).length;
            if (primaryCount > 1) {
              throw new ResponseError(
                `SKU ${sku.code} hanya boleh memiliki satu lokasi stok utama`,
              );
            }

            for (const stockLoc of sku.stock_locations) {
              await saveMovementIn(tx, {
                is_primary: stockLoc.is_primary,
                location_id: stockLoc.stock_location_id,
                product_sku_id: createdSku.id,
                quantity: new Decimal(stockLoc.quantity),
                buy_price: sku.buy_price,
                note: "Tambah Stock Awal Produk",
                reference_id: createdSku.id,
                reference_type: "product_skus",
              });
            }
          }

          if (sku.images && sku.images.length > 0) {
            await ensureUploadDir();

            const skuImages = await Promise.all(
              sku.images.map(async (image) => {
                const extension = image.filename!.split(".").pop();
                const uniqueFilename = `${randomUUID()}.${extension}`;
                const filePath = join(UPLOAD_DIR, uniqueFilename);
                const relativePath = `/uploads/products/${uniqueFilename}`;

                let base64Data = image.base64 as string;
                if (base64Data.includes(";base64,")) {
                  base64Data = base64Data.split(";base64,").pop() || base64Data;
                }

                const buffer = Buffer.from(base64Data, "base64");
                await writeFile(filePath, buffer);

                return {
                  id: randomUUID(),
                  product_sku_id: createdSku.id,
                  path: relativePath,
                };
              }),
            );

            await tx.productSkuImage.createMany({
              data: skuImages,
            });
          }
        }
      });

      return result;
    }),
  );

const DeleteProductScheme = z.object({
  id: z.string().min(1),
});

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(DeleteProductScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
        include: {
          productSkus: {
            include: {
              images: true,
              stockProductSkus: {
                take: 1,
              },
              transactionItems: {
                take: 1,
              },
              purchaseItems: {
                take: 1,
              },
              adjustmentItems: {
                take: 1,
              },
              promotionItems: {
                take: 1,
              },
            },
          },
        },
      });

      if (!existingProduct) {
        throw new ResponseError("Produk tidak ditemukan");
      }

      // Check if product has any transactions or stock movements
      const hasTransactions = existingProduct.productSkus.some(
        (sku) =>
          sku.transactionItems.length > 0 ||
          sku.purchaseItems.length > 0 ||
          sku.adjustmentItems.length > 0 ||
          sku.promotionItems.length > 0,
      );
      const hasStockMovements = existingProduct.productSkus.some(
        (sku) => sku.stockProductSkus.length > 0,
      );

      if (hasTransactions || hasStockMovements) {
        throw new ResponseError(
          "Produk tidak dapat dihapus karena sudah memiliki transaksi atau pergerakan stok",
        );
      }

      await prisma.$transaction(async (tx) => {
        // Delete all SKU stock locations
        for (const sku of existingProduct.productSkus) {
          await tx.stockProductSku.deleteMany({
            where: { product_sku_id: sku.id },
          });
        }

        // Delete all SKU images
        for (const sku of existingProduct.productSkus) {
          await tx.productSkuImage.deleteMany({
            where: { product_sku_id: sku.id },
          });
        }

        // Delete all SKUs
        await tx.productSku.deleteMany({
          where: { product_id: data.id },
        });

        // Delete product categories
        await tx.productCategory.deleteMany({
          where: { product_id: data.id },
        });

        // Delete product
        await tx.product.delete({
          where: { id: data.id },
        });
      });

      return null;
    }),
  );

const DeleteSkuScheme = z.object({
  skuId: z.string().min(1),
  productId: z.string().min(1),
});

export const deleteSkuFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(DeleteSkuScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingSku = await prisma.productSku.findUnique({
        where: { id: data.skuId },
        include: {
          product: true,
          images: true,
          stockProductSkus: {
            include: {
              stockLocation: true,
            },
          },
          transactionItems: {
            take: 1,
          },
          purchaseItems: {
            take: 1,
          },
          adjustmentItems: {
            take: 1,
          },
          promotionItems: {
            take: 1,
          },
        },
      });

      if (!existingSku) {
        throw new ResponseError("SKU tidak ditemukan");
      }

      if (existingSku.product_id !== data.productId) {
        throw new ResponseError("SKU tidak terhubung dengan produk ini");
      }

      // Check if SKU has any transactions
      if (
        existingSku.transactionItems.length > 0 ||
        existingSku.purchaseItems.length > 0 ||
        existingSku.adjustmentItems.length > 0 ||
        existingSku.promotionItems.length > 0
      ) {
        throw new ResponseError(
          "SKU tidak dapat dihapus karena sudah memiliki transaksi",
        );
      }

      // Check if SKU has stock in any location
      if (existingSku.stockProductSkus.length > 0) {
        const hasStock = existingSku.stockProductSkus.some(
          (stock) => !stock.quantity.isZero(),
        );
        if (hasStock) {
          throw new ResponseError(
            "SKU tidak dapat dihapus karena masih memiliki stok",
          );
        }
      }

      await prisma.$transaction(async (tx) => {
        // Delete stock locations
        await tx.stockProductSku.deleteMany({
          where: { product_sku_id: data.skuId },
        });

        // Delete images
        await tx.productSkuImage.deleteMany({
          where: { product_sku_id: data.skuId },
        });

        // Delete SKU
        await tx.productSku.delete({
          where: { id: data.skuId },
        });
      });

      return null;
    }),
  );
