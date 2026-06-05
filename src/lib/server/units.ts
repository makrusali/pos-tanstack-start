import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { Status, UnitType } from "#/generated/prisma/enums";

export const getUnitsFn = createServerFn({ method: "GET" })
    .handler(async () => wrap(async () => {
        const units = await prisma.unit.findMany({
            orderBy: { created_at: 'desc' }
        });
        return units;
    }));

const UnitScheme = z.object({
    name: z.string().min(1, "Nama unit harus diisi"),
    type: z.enum(['integer', 'decimal']),
    status: z.enum(['active', 'inactive']),
})

export const createUnitFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(UnitScheme))
    .handler(async ({ data }) => wrap(async () => {
        const unit = await prisma.unit.create({
            data: {
                name: data.name,
                type: data.type as UnitType,
                status: data.status as Status,
            },
        });
        return unit;
    }));

const GetUnitScheme = z.object({
    id: z.string().min(1),
})

export const getUnitFn = createServerFn({ method: 'GET' })
    .inputValidator(parseZod(GetUnitScheme))
    .handler(async ({ data }) => wrap(async () => {
        const unit = await prisma.unit.findUnique({
            where: { id: data.id },
            // include: {
            //     productSkus: {
            //         include: {
            //             product: true
            //         },
            //         take: 10
            //     }
            // }
        });

        if (!unit) {
            throw new ResponseError('Unit tidak ditemukan');
        }

        return unit;
    }));

const UpdateUnitScheme = z.object({
    id: z.string().min(1),
    data: UnitScheme.partial(),
})

export const updateUnitFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(UpdateUnitScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingUnit = await prisma.unit.findUnique({
            where: { id: data.id },
        });

        if (!existingUnit) {
            throw new ResponseError('Unit tidak ditemukan');
        }

        const unit = await prisma.unit.update({
            where: { id: data.id },
            data: {
                name: data.data.name,
                type: data.data.type as UnitType | undefined,
                status: data.data.status as Status | undefined,
            },
        });

        return unit;
    }));

const DeleteUnitScheme = z.object({
    id: z.string().min(1),
})

export const deleteUnitFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(DeleteUnitScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingUnit = await prisma.unit.findUnique({
            where: { id: data.id },
            include: {
                productSkus: {
                    take: 1
                }
            }
        });

        if (!existingUnit) {
            throw new ResponseError('Unit tidak ditemukan');
        }

        if (existingUnit.productSkus.length > 0) {
            throw new ResponseError('Unit tidak dapat dihapus karena masih digunakan oleh produk');
        }

        await prisma.unit.delete({
            where: { id: data.id },
        });

        return null;
    }));