import { createServerFn } from "@tanstack/react-start";
import { parseZod, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { GuardStatus } from "#/generated/prisma/enums";

export const getSettingsFn = createServerFn({ method: "GET" })
    .handler(async () => wrap(async () => {
        let settings = await prisma.setting.findFirst();

        if (!settings) {
            settings = await prisma.setting.create({
                data: {
                    store_name: "Toko Saya",
                    store_phone: "",
                    store_email: "",
                    store_description: "",
                    store_address: "",
                    stock_guard: "inactive",
                    receipent_thanks_text: "",
                }
            });
        }

        return settings;
    }));

const SettingsScheme = z.object({
    store_name: z.string().min(1, "Nama toko harus diisi"),
    store_phone: z.string(),
    store_email: z.email({ message: "Email tidak valid" }),
    store_description: z.string().optional(),
    store_address: z.string().optional(),
    stock_guard: z.enum(['active', 'inactive']),
    receipent_thanks_text: z.string().optional(),
})

export const updateSettingsFn = createServerFn({ method: 'POST' })
    .inputValidator(parseZod(SettingsScheme))
    .handler(async ({ data }) => wrap(async () => {
        const existingSettings = await prisma.setting.findFirst();

        if (!existingSettings) {
            const settings = await prisma.setting.create({
                data: {
                    store_name: data.store_name,
                    store_phone: data.store_phone,
                    store_email: data.store_email,
                    store_description: data.store_description,
                    store_address: data.store_address,
                    stock_guard: data.stock_guard as GuardStatus,
                    receipent_thanks_text: data.receipent_thanks_text,
                },
            });
            return settings;
        }

        const settings = await prisma.setting.update({
            where: { id: existingSettings.id },
            data: {
                store_name: data.store_name,
                store_phone: data.store_phone,
                store_email: data.store_email,
                store_description: data.store_description,
                store_address: data.store_address,
                stock_guard: data.stock_guard as GuardStatus,
                receipent_thanks_text: data.receipent_thanks_text,
            },
        });

        return settings;
    }));