import { createServerFn } from "@tanstack/react-start";
import { ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import { generateReceipt } from "./services";

export type Transaction = {
  id: string;
  code: string;
  customer_name?: string;
  cashier_name: string;
  date: Date;
  discount_total: number;
  price_total_before_discount: number;
  other_cost_total: number;
  grand_total: number;
  items_count: number;
  status: string;
  payment_status: string;
};

export const getTransactionsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const transactions = await prisma.transaction.findMany({
        include: {
          maker: true,
          customer: true,
          transactionItems: true,
          payments: true,
        },
        orderBy: {
          transaction_date: "desc",
        },
      });
      return transactions.map<Transaction>((t) => ({
        id: t.id,
        code: t.code,
        cashier_name: t.maker!.name ?? " - ",
        customer_name: t.customer?.name,
        items_count: t.transactionItems.length,
        price_total_before_discount: t.price_before_discount_total,
        date: t.transaction_date,
        discount_total: t.discount_total,
        other_cost_total: t.other_cost_total,
        grand_total: t.grand_total,
        status: t.status,
        payment_status: t.payment_status,
      }));
    }),
);

const GetTransactionScheme = z.object({
  id: z.string().min(1),
});

export const getTransactionFn = createServerFn({ method: "GET" })
  .inputValidator(GetTransactionScheme)
  .handler(async ({ data }) =>
    wrap(async () => {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: data.id,
        },
        include: {
          maker: true,
          customer: true,
          discount: true,
          promotion: true,
          anotherFees: true,
          transactionItems: {
            include: {
              discount: true,
              stockBatch: {
                include: {
                  stockLocation: true,
                },
              },
              productSku: {
                include: {
                  product: true,
                  images: true,
                  unit: true,
                },
              },
            },
          },
          payments: {
            include: {
              paymentMethod: true,
            },
          },
        },
      });

      return transaction;
    }),
  );

export const generateTransactionReceiptFn = createServerFn({ method: "POST" })
  .inputValidator(GetTransactionScheme)
  .handler(async ({ data }) =>
    wrap(async () => {
      const setting = await prisma.setting.findFirst();
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: data.id,
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

      const result = await generateReceipt({
        setting: setting!,
        transaction: transaction!,
      });

      return result;
    }),
  );

const SavePaymentScheme = z.object({
  transaction_id: z.uuid(),
  payment_method_id: z.uuid(),
  customer_pay_amount: z.number(),
});

// @note: @todo: this not supported for partial payment right now
export const savePaymentFn = createServerFn({ method: "POST" })
  .inputValidator(SavePaymentScheme)
  .handler(async ({ data }) =>
    wrap(async () => {
      const result = prisma.$transaction(async (tx) => {
        const transaction = await prisma.transaction.findUnique({
          where: {
            id: data.transaction_id,
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

        if (!transaction) {
          throw new ResponseError("Transaksi tidak valid");
        }

        const remaining = transaction.remaining_payment;
        const change = data.customer_pay_amount - remaining;
        const newRemaining = Math.max(remaining - data.customer_pay_amount, 0);
        const finalStatus =
          data.customer_pay_amount >= remaining ? "paid" : "partial";

        if (change < 0) {
          throw new ResponseError(
            "Tidak mendukung Pembayaran Partial untuk saat ini",
          );
        }

        await tx.payment.create({
          data: {
            transaction_id: transaction.id,
            balance: data.customer_pay_amount,
            change: change,
            status: "paid",
            total: remaining,
            payment_method_id: data.payment_method_id,
          },
        });

        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            payment_status: finalStatus,
            remaining_payment: newRemaining,
          },
        });

        const setting = await prisma.setting.findFirst();
        const receipt = await generateReceipt({
          setting: setting!,
          transaction: transaction,
        });
        return receipt;
      });

      return result;
    }),
  );
