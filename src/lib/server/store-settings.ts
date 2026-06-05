import { prisma } from "#/db";
import type { Setting } from "#/generated/prisma/client";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { randomUUID } from "crypto";

export const getStoreSettings = createServerFn({ method: "POST" }).handler(async () => {
    const defaultSetting = {
        id: randomUUID(),
        stock_guard: 'inactive',
        store_email: 'storemail@mail.com',
        store_name: 'Store Name',
        store_phone: 'Store Phone',
        receipent_thanks_text: "Receipent Thanks text",
        store_address: "Address",
        store_description: "Store Description",
    } satisfies Setting;

    let setting = await prisma.setting.findFirst();
    if (setting === null) {
        setting = await prisma.setting.create({
            data: defaultSetting,
        })
    }

    return setting;
})