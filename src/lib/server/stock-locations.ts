import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { Status } from "#/generated/prisma/enums";

export const getStockLocationsFn = createServerFn({ method: "GET" })
    .handler(async () => wrap(async () => {
        const locations = await prisma.stockLocation.findMany({
            orderBy: { name: 'asc' }
        });
        return locations;
    }));

const StockLocationScheme = z.object({
    name: z.string().min(1, "Nama lokasi harus diisi"),
    note: z.string().optional(),
    status: z.enum(['active', 'inactive']),
})

export const createStockLocationFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(StockLocationScheme))
    .handler(async ({ data }) => wrap(async () => {
        const location = await prisma.stockLocation.create({
            data: {
                name: data.name,
                note: data.note,
                status: data.status as Status,
            },
        });
        return location;
    }));

const GetStockLocationScheme = z.object({
    id: z.string().min(1),
})

export const getStockLocationFn = createServerFn({ method: 'GET' })
    .inputValidator(parseZod(GetStockLocationScheme))
    .handler(async ({ data }) => wrap(async () => {
        const location = await prisma.stockLocation.findUnique({
            where: { id: data.id },
            include: {
                stockProductSkus: {
                    include: {
                        productSku: {
                            include: {
                                product: true,
                                unit: true
                            }
                        }
                    },
                    take: 10
                }
            }
        });

        if (!location) {
            throw new ResponseError('Lokasi stok tidak ditemukan');
        }

        return location;
    }));

const UpdateStockLocationScheme = z.object({
    id: z.string().min(1),
    data: StockLocationScheme.partial(),
})

export const updateStockLocationFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(UpdateStockLocationScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingLocation = await prisma.stockLocation.findUnique({
            where: { id: data.id },
        });

        if (!existingLocation) {
            throw new ResponseError('Lokasi stok tidak ditemukan');
        }

        const location = await prisma.stockLocation.update({
            where: { id: data.id },
            data: {
                name: data.data.name,
                note: data.data.note,
                status: data.data.status as Status | undefined,
            },
        });

        return location;
    }));

const DeleteStockLocationScheme = z.object({
    id: z.string().min(1),
})

export const deleteStockLocationFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(DeleteStockLocationScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingLocation = await prisma.stockLocation.findUnique({
            where: { id: data.id },
            include: {
                stockProductSkus: {
                    take: 1
                }
            }
        });

        if (!existingLocation) {
            throw new ResponseError('Lokasi stok tidak ditemukan');
        }

        if (existingLocation.stockProductSkus.length > 0) {
            throw new ResponseError('Lokasi stok tidak dapat dihapus karena masih memiliki stok produk');
        }

        await prisma.stockLocation.delete({
            where: { id: data.id },
        });

        return null;
    }));