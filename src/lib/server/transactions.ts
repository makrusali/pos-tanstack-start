import { createServerFn } from "@tanstack/react-start";
import { wrap } from "./utils";
import { prisma } from "#/db";

const getTransactionsFn = createServerFn({ method: "GET" }).handler(async () =>
  wrap(async () => {
    const transactions = await prisma.transaction.findMany({
      include: {
        maker: true,
        customer: true,
        transactionItems: true,
        payments: true,
      },
    });
  }),
);
