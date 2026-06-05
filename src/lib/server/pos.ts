import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";

export const getPosProductsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const products = await prisma.productSku.findMany({
        include: {
          images: true,
          product: {
            include: {
              productCategories: {
                include: {
                  category: true,
                },
              },
            },
          },
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
        unit: {
          id: p.unit.id,
          name: p.unit.name,
          type: p.unit.type,
        },
        productCategories: p.product.productCategories,
        stock_locations: p.stockProductSkus.map((sl) => ({
          id: sl.stockLocation.id,
          quantity: sl.quantity,
          name: sl.stockLocation.name,
          is_primary: sl.is_primary,
        })),
      }));
    }),
);

export const getActivePromotionsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const now = new Date();
      const promotions = await prisma.promotion.findMany({
        where: {
          start_date: { lte: now },
          end_date: { gte: now },
        },
        include: {
          promotionItems: {
            include: {
              productSku: {
                include: {
                  product: true,
                  unit: true,
                },
              },
            },
          },
          promotionTransactions: true,
        },
      });
      return promotions;
    }),
);

export const getCustomersFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const customers = await prisma.customer.findMany({
        orderBy: { name: "asc" },
      });
      return customers;
    }),
);

export const getPaymentMethodsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const methods = await prisma.paymentMethod.findMany({
        orderBy: { name: "asc" },
      });
      return methods;
    }),
);

const SaveTransactionScheme = z.object({
  id: z.string().optional(),
  status: z.enum(["draft", "done"]),
  customer_id: z.string().optional(),
  promotion_id: z.string().optional(),
  note: z.string().optional(),
  discount_value: z.number().optional(),
  discount_type: z.enum(["percent", "fixed"]).optional(),
  another_fees: z
    .array(
      z.object({
        note: z.string().optional(),
        price: z.number().min(0),
      }),
    )
    .optional(),
  items: z
    .array(
      z.object({
        sku_id: z.string(),
        quantity: z.number().min(0.01),
        price: z.number().min(0),
        note: z.string().optional(),
        discount_id: z.string().optional(),
        discount_value: z.number().optional(),
        discount_type: z.enum(["percent", "fixed"]).optional(),
      }),
    )
    .min(1, "Minimal 1 item"),
  payments: z
    .array(
      z.object({
        payment_method_id: z.string(),
        total: z.number().min(0),
      }),
    )
    .optional(),
});

export const saveTransactionFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(SaveTransactionScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const result = await prisma.$transaction(async (tx) => {
        let priceTotal = 0;
        let discountTotal = 0;
        let anotherTotal = 0;
        let grandTotal = 0;

        // Calculate totals
        for (const item of data.items) {
          const subtotal = item.price * item.quantity;
          priceTotal = priceTotal + subtotal;

          let itemDiscount = 0;
          if (item.discount_value && item.discount_value > 0) {
            if (item.discount_type === "percent") {
              itemDiscount = (subtotal * item.discount_value) / 100;
            } else {
              itemDiscount = item.discount_value;
            }
          }
          discountTotal = discountTotal + itemDiscount;
        }

        // Calculate another fees total
        if (data.another_fees) {
          for (const fee of data.another_fees) {
            anotherTotal = anotherTotal + fee.price;
          }
        }

        // Calculate discount from promotion
        let promotionDiscount = 0;
        if (data.discount_value && data.discount_value > 0) {
          if (data.discount_type === "percent") {
            promotionDiscount = (priceTotal * data.discount_value) / 100;
          } else {
            promotionDiscount = data.discount_value;
          }
        }

        const totalDiscount = discountTotal + promotionDiscount;
        grandTotal = Math.round(priceTotal + anotherTotal - totalDiscount);

        // Create or update transaction
        let transaction;
        if (data.id) {
          // Update existing draft
          transaction = await tx.transaction.update({
            where: { id: data.id },
            data: {
              status: data.status,
              customer_id: data.customer_id,
              promotion_id: data.promotion_id,
              note: data.note,
              discount_value: data.discount_value ?? null,
              discount_type: data.discount_type,
              discount_total: Math.round(totalDiscount),
              price_total: Math.round(priceTotal),
              another_total: Math.round(anotherTotal),
              grand_total: grandTotal,
              transaction_date: data.status === "done" ? new Date() : undefined,
            },
          });

          // Delete existing items
          await tx.transactionItem.deleteMany({
            where: { transaction_id: transaction.id },
          });

          // Delete existing another fees
          await tx.anotherFee.deleteMany({
            where: { transaction_id: transaction.id },
          });

          // Delete existing payments if status is draft
          if (data.status === "draft") {
            await tx.payment.deleteMany({
              where: { transaction_id: transaction.id },
            });
          }
        } else {
          // Create new transaction
          transaction = await tx.transaction.create({
            data: {
              status: data.status,
              customer_id: data.customer_id,
              promotion_id: data.promotion_id,
              note: data.note,
              discount_value: data.discount_value ?? null,
              discount_type: data.discount_type,
              discount_total: Math.round(totalDiscount),
              price_total: Math.round(priceTotal),
              another_total: Math.round(anotherTotal),
              grand_total: grandTotal,
            },
          });
        }

        // Create transaction items
        for (const item of data.items) {
          const sku = await tx.productSku.findUnique({
            where: { id: item.sku_id },
            include: { product: true },
          });

          if (!sku) {
            throw new ResponseError("SKU tidak ditemukan");
          }

          const subtotal = item.price * item.quantity;
          let itemDiscountTotal = 0;

          if (item.discount_value && item.discount_value > 0) {
            if (item.discount_type === "percent") {
              itemDiscountTotal = (subtotal * item.discount_value) / 100;
            } else {
              itemDiscountTotal = item.discount_value;
            }
          }

          const itemTotal = Math.round(subtotal - itemDiscountTotal);

          await tx.transactionItem.create({
            data: {
              transaction_id: transaction.id,
              product_sku_id: item.sku_id,
              quantity: item.quantity,
              price: item.price,
              subtotal: Math.round(subtotal),
              discount_value: item.discount_value ?? null,
              discount_type: item.discount_type,
              discount_total: Math.round(itemDiscountTotal),
              total: itemTotal,
              note: item.note,
            },
          });

          // Update stock if status is done
          if (data.status === "done") {
            const stockProduct = await tx.stockProductSku.findFirst({
              where: {
                product_sku_id: item.sku_id,
                is_primary: true,
              },
            });

            if (stockProduct) {
              const newQuantity = stockProduct.quantity - item.quantity;
              if (newQuantity < 0) {
                throw new ResponseError(
                  `Stok ${sku.product.name} tidak mencukupi`,
                );
              }

              await tx.stockProductSku.update({
                where: { id: stockProduct.id },
                data: { quantity: newQuantity },
              });

              // Create stock movement
              await tx.stockMovement.create({
                data: {
                  reference_type: "sale",
                  reference_id: transaction.id,
                  stock_product_sku_id: stockProduct.id,
                  prev_quantity: stockProduct.quantity,
                  quantity: -item.quantity,
                  current_quantity: newQuantity,
                  type: "out",
                  note: `Penjualan - ${sku.product.name}`,
                },
              });
            }
          }
        }

        // Create another fees
        if (data.another_fees && data.another_fees.length > 0) {
          for (const fee of data.another_fees) {
            await tx.anotherFee.create({
              data: {
                transaction_id: transaction.id,
                note: fee.note,
                price: Math.round(fee.price),
              },
            });
          }
        }

        // Create payments if status is done
        if (
          data.status === "done" &&
          data.payments &&
          data.payments.length > 0
        ) {
          let totalPaid = 0;
          for (const payment of data.payments) {
            totalPaid = totalPaid + payment.total;
            await tx.payment.create({
              data: {
                transaction_id: transaction.id,
                payment_method_id: payment.payment_method_id,
                total: payment.total,
                status: "paid",
                change: 0,
                balance: 0,
              },
            });
          }

          const change = totalPaid - grandTotal;
          if (change < 0) {
            throw new ResponseError("Pembayaran kurang");
          }

          // Update payment with change
          const lastPayment = await tx.payment.findFirst({
            where: { transaction_id: transaction.id },
            orderBy: { created_at: "desc" },
          });

          if (lastPayment) {
            await tx.payment.update({
              where: { id: lastPayment.id },
              data: {
                change: change,
                balance: change,
              },
            });
          }
        }

        return transaction;
      });

      return result;
    }),
  );

export const getDraftTransactionsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const drafts = await prisma.transaction.findMany({
        where: { status: "draft" },
        include: {
          customer: true,
          transactionItems: {
            include: {
              productSku: {
                include: {
                  product: true,
                  unit: true,
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
          anotherFees: true,
        },
        orderBy: { updated_at: "desc" },
      });
      return drafts;
    }),
);

export const getTransactionFn = createServerFn({ method: "GET" })
  .inputValidator(parseZod(z.object({ id: z.string().min(1) })))
  .handler(async ({ data }) =>
    wrap(async () => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: data.id },
        include: {
          customer: true,
          promotion: true,
          transactionItems: {
            include: {
              productSku: {
                include: {
                  product: true,
                  unit: true,
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
          anotherFees: true,
          payments: {
            include: {
              paymentMethod: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new ResponseError("Transaksi tidak ditemukan");
      }

      return transaction;
    }),
  );

export const deleteDraftTransactionFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(z.object({ id: z.string().min(1) })))
  .handler(async ({ data }) =>
    wrap(async () => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: data.id },
      });

      if (!transaction) {
        throw new ResponseError("Transaksi tidak ditemukan");
      }

      if (transaction.status !== "draft") {
        throw new ResponseError("Hanya transaksi draft yang dapat dihapus");
      }

      await prisma.$transaction(async (tx) => {
        await tx.transactionItem.deleteMany({
          where: { transaction_id: data.id },
        });
        await tx.anotherFee.deleteMany({
          where: { transaction_id: data.id },
        });
        await tx.payment.deleteMany({
          where: { transaction_id: data.id },
        });
        await tx.transaction.delete({
          where: { id: data.id },
        });
      });

      return null;
    }),
  );
