import { createServerFn } from "@tanstack/react-start";
import { wrap } from "./utils";
import { prisma } from "#/db";

export const getStockMovementsFn = createServerFn({ method: "GET" })
    .handler(async () => wrap(async () => {
        const movements = await prisma.stockMovement.findMany({
            orderBy: { transaction_date: 'desc' },
            include: {
                stockProductSku: {
                    include: {
                        productSku: {
                            include: {
                                product: true,
                                unit: true
                            }
                        },
                        stockLocation: true
                    }
                }
            }
        });

        return movements;
    }));