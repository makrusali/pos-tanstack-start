import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { Status } from "#/generated/prisma/enums";

export const getCategoriesFn = createServerFn({ method: "GET" })
    .handler(async () => wrap(async () => {
        const categories = await prisma.category.findMany();
        return categories;
    }));

const CategoryScheme = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']),
})

export const createCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(CategoryScheme))
    .handler(async ({ data }) => wrap(async () => {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                status: data.status satisfies Status,
                description: data.description,
            },
        });
        return category;
    }));

const GetCategoryScheme = z.object({
    id: z.string().min(1),
})

export const getCategoryFn = createServerFn({ method: 'GET' })
    .inputValidator(parseZod(GetCategoryScheme))
    .handler(async ({ data }) => wrap(async () => {
        const category = await prisma.category.findUnique({
            where: { id: data.id },
        });

        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }

        return category;
    }));

const UpdateCategoryScheme = z.object({
    id: z.string().min(1),
    data: CategoryScheme.partial(),
})

export const updateCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(UpdateCategoryScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingCategory = await prisma.category.findUnique({
            where: { id: data.id },
        });

        if (!existingCategory) {
            throw new ResponseError('Kategori tidak ditemukan');
        }

        const category = await prisma.category.update({
            where: { id: data.id },
            data: {
                name: data.data.name,
                status: data.data.status as Status | undefined,
                description: data.data.description,
            },
        });

        return category;
    }));

const DeleteCategoryScheme = z.object({
    id: z.string().min(1),
})

export const deleteCategoryFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(DeleteCategoryScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingCategory = await prisma.category.findUnique({
            where: { id: data.id },
        });

        if (!existingCategory) {
            throw new ResponseError('Kategori tidak ditemukan');
        }

        await prisma.category.delete({
            where: { id: data.id },
        });

        return null;
    }));