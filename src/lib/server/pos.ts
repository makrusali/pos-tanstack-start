import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap, type ErrorItem } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import Decimal from "decimal.js";
import { randomUUID } from "crypto";
import {
  generateReceipt,
  generateTransactionCode,
  saveMovementOut,
} from "./services";
import { authMiddleware } from "./middlewares";

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
        code: p.code,
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
  customer_id: z.string().nullable().optional(),
  promotion_id: z.string().optional(),
  note: z.string().optional(),
  discount_value: z.number().optional(),
  discount_type: z.enum(["percent", "fixed"]).optional(),
  other_fees: z
    .array(
      z.object({
        note: z.string(),
        amount: z.number().min(0),
      }),
    )
    .optional(),
  items: z
    .array(
      z.object({
        sku_id: z.string(),
        quantity: z.number(),
        price: z.number().min(0),
        note: z.string().nullable().optional(),
        discount_id: z.string().nullable().optional(),
        discount_value: z.number().optional(),
        discount_type: z.enum(["percent", "fixed"]).nullable().optional(),
        selected_stock_location_id: z.uuid(),
      }),
    )
    .min(1, "Minimal 1 item"),
  payment_method_id: z.uuid(),
  customer_pay_amount: z.number().optional().nullable(),
});

export const saveTransactionFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(SaveTransactionScheme))
  .middleware([authMiddleware("pos", "create", false)])
  .handler(async ({ data, context }) =>
    wrap(async () => {
      const user_id = context.user_id;

      const result = await prisma.$transaction(async (tx) => {
        if (data.status === "done") {
          let transactionDiscountAmount = 0;
          let transactionItemsDiscountAmount = 0;
          let transactionDiscountTotal = 0;
          let transactionPriceTotal = 0;
          let transactionOtherCostTotal = 0;
          let transactionGrandTotal = 0;
          let transactionPriceBeforeDiscountTotal = 0;

          const transactionID = randomUUID();
          const code = generateTransactionCode();

          const errorItems: ErrorItem[] = [];
          await tx.transaction.create({
            data: {
              code: code,
              id: transactionID,
              maker_id: user_id,
              customer_id: data.customer_id,
              discount_total: 0,
              grand_total: 0,
              items_discount_amount: 0,
              other_cost_total: 0,
              price_total: 0,
              status: "done",
              transaction_discount_amount: 0,
              price_before_discount_total: 0,
              payment_status: "paid",
            },
          });

          for (let itemIndex = 0; itemIndex < data.items.length; itemIndex++) {
            const item = data.items[itemIndex];

            const findedProductSku = await tx.productSku.findUnique({
              where: {
                id: item.sku_id,
              },
              include: {
                stockProductSkus: {
                  include: {
                    stockLocation: true,
                  },
                },
              },
            });

            if (!findedProductSku) {
              errorItems.push({
                key: `item.${itemIndex}.product_sku_id`,
                message: "Produk tidak valid",
              });
              continue;
            }

            if (findedProductSku.stock_quantity.lessThan(item.quantity)) {
              errorItems.push({
                key: `item.${itemIndex}.product_sku_id`,
                message: "Stock produk tidak mencukupi",
              });
              continue;
            }

            let discountAmount = 0;
            const discountValue = item.discount_value || 0;
            if (item.discount_type === "fixed") {
              discountAmount = findedProductSku.price - discountValue;
            } else if (item.discount_type === "percent") {
              discountAmount = findedProductSku.price * (discountValue / 100);
            }

            const priceBeforeDiscountTotal = new Decimal(item.quantity)
              .mul(findedProductSku.price)
              .toNumber();
            const discountedPrice = findedProductSku.price - discountAmount;
            const subtotal = new Decimal(item.quantity)
              .mul(new Decimal(discountedPrice))
              .toNumber();
            const discountTotal = new Decimal(item.quantity)
              .mul(new Decimal(discountAmount))
              .toNumber();

            const selectedStockPerLocation =
              findedProductSku.stockProductSkus.find(
                (l) => l.stock_location_id === item.selected_stock_location_id,
              );
            const enough =
              selectedStockPerLocation?.quantity?.greaterThan(item.quantity) ||
              false;

            console.log(enough, selectedStockPerLocation);

            // @note: @todo: Some units may not be splittable across different locations.
            // For example, for a cable, if the user wants to buy 5 meters,
            // they must receive a continuous 5-meter length, not split into
            // multiple pieces.
            if (enough && selectedStockPerLocation) {
              const stockBatches = await tx.stockBatches.findMany({
                where: {
                  stock_product_sku_id: selectedStockPerLocation.id,
                  product_sku_id: selectedStockPerLocation.product_sku_id,
                  remaining_quantity: {
                    gt: 0,
                  },
                },
                orderBy: {
                  date: "asc",
                },
              });

              if (stockBatches.length === 0) {
                throw new ResponseError("Produk tida memiliki stock.");
              }

              const qty = new Decimal(item.quantity);
              let consumedQuantity = new Decimal(0);
              for (
                let stockBatchIndex = 0;
                stockBatchIndex < stockBatches.length;
                stockBatchIndex++
              ) {
                const batch = stockBatches[stockBatchIndex];
                const feedQty = qty.sub(consumedQuantity);
                if (batch.quantity.sub(feedQty).isNeg()) {
                  continue;
                }

                const createdItem = await tx.transactionItem.create({
                  data: {
                    transaction_id: transactionID,
                    buy_price: batch.buy_price,
                    product_sku_id: item.sku_id,
                    quantity: feedQty,
                    price: findedProductSku.price,
                    discounted_price: discountedPrice,
                    subtotal: subtotal,
                    discount_value: discountValue,
                    discount_type: item.discount_type,
                    discount_amount: discountAmount,
                    discount_total: discountTotal,
                    note: item.note,
                    stock_batches_id: batch.id,
                  },
                });

                transactionItemsDiscountAmount =
                  transactionItemsDiscountAmount + createdItem.discount_total;
                transactionPriceTotal =
                  transactionPriceTotal + createdItem.subtotal;
                transactionPriceBeforeDiscountTotal =
                  transactionPriceBeforeDiscountTotal +
                  priceBeforeDiscountTotal;

                await saveMovementOut(tx, {
                  location_id: selectedStockPerLocation.stockLocation.id,
                  note: "",
                  product_sku_id: item.sku_id,
                  quantity: feedQty,
                  reference_id: transactionID,
                  reference_type: "sales",
                  stock_batch_id: batch.id,
                });

                consumedQuantity = consumedQuantity.add(feedQty);

                if (consumedQuantity.eq(qty)) {
                  break;
                }
              }
            } else {
              for (
                let stockLocationIndex = 0;
                stockLocationIndex < findedProductSku.stockProductSkus.length;
                stockLocationIndex++
              ) {
                // @todo: multiple loation stocks
              }
            }
          }

          if (data.other_fees) {
            for (
              let otherCostIndex = 0;
              otherCostIndex < data.other_fees?.length;
              otherCostIndex++
            ) {
              const item = data.other_fees[otherCostIndex];
              const created = await tx.otherCost.create({
                data: {
                  transaction_id: transactionID,
                  price: item.amount,
                  note: item.note,
                },
              });

              transactionOtherCostTotal =
                transactionOtherCostTotal + created.price;
            }
          }

          transactionDiscountTotal =
            transactionDiscountAmount + transactionItemsDiscountAmount;
          transactionGrandTotal =
            transactionOtherCostTotal + transactionPriceTotal;

          const createdTransaction = await tx.transaction.update({
            where: {
              id: transactionID,
            },
            data: {
              other_cost_total: transactionOtherCostTotal,
              grand_total: transactionGrandTotal,
              price_before_discount_total: transactionPriceBeforeDiscountTotal,
              price_total: transactionPriceTotal,
              // discount
              items_discount_amount: transactionItemsDiscountAmount,
              transaction_discount_amount: transactionDiscountAmount,
              discount_total: transactionDiscountTotal,
            },
          });

          const balance =
            data.customer_pay_amount || createdTransaction.grand_total;
          await tx.payment.create({
            data: {
              transaction_id: transactionID,
              balance: balance,
              change: balance - createdTransaction.grand_total,
              payment_method_id: data.payment_method_id,
              status: "paid",
              total: createdTransaction.grand_total,
            },
          });

          if (errorItems.length > 0) {
            throw new ResponseError(errorItems);
          }

          {
            const setting = await tx.setting.findFirst();
            const transaction = await tx.transaction.findUnique({
              where: {
                id: transactionID,
              },
              include: {
                anotherFees: true,
                customer: true,
                discount: true,
                maker: true,
                payments: {
                  include: {
                    paymentMethod: true,
                  },
                },
                promotion: true,
                transactionItems: {
                  include: {
                    productSku: {
                      include: {
                        product: true,
                        unit: true,
                      },
                    },
                  },
                },
              },
            });

            const result = generateReceipt({
              setting: setting!,
              transaction: transaction!,
            });

            return result;
          }
        } else {
          // @todo: safe as a draft
        }
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
        await tx.otherCost.deleteMany({
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
