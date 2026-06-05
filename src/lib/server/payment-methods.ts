import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";
import type { Status } from "#/generated/prisma/enums";
import { join } from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "payment-methods");

const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
};

export const getPaymentMethodsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const methods = await prisma.paymentMethod.findMany({
        orderBy: { name: "asc" },
      });
      return methods;
    }),
);

const PaymentMethodScheme = z.object({
  name: z.string().min(1, "Nama metode pembayaran harus diisi"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  image: z
    .object({
      base64: z.string(),
      filename: z.string(),
    })
    .partial()
    .optional()
    .nullable(),
});

export const createPaymentMethodFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(PaymentMethodScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      let imagePath = null;
      if (data.image) {
        await ensureUploadDir();
        const extension = data.image.filename!.split(".").pop();
        const uniqueFilename = `${randomUUID()}.${extension}`;
        const filePath = join(UPLOAD_DIR, uniqueFilename);
        imagePath = `/uploads/payment-methods/${uniqueFilename}`;

        let base64Data = data.image.base64 as string;
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,").pop() || base64Data;
        }

        const buffer = Buffer.from(base64Data, "base64");
        await writeFile(filePath, buffer);
      }

      const method = await prisma.paymentMethod.create({
        data: {
          name: data.name,
          description: data.description,
          status: data.status as Status,
          image_path: imagePath,
        },
      });
      return method;
    }),
  );

const GetPaymentMethodScheme = z.object({
  id: z.string().min(1),
});

export const getPaymentMethodFn = createServerFn({ method: "GET" })
  .inputValidator(parseZod(GetPaymentMethodScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const method = await prisma.paymentMethod.findUnique({
        where: { id: data.id },
      });

      if (!method) {
        throw new ResponseError("Metode pembayaran tidak ditemukan");
      }

      return method;
    }),
  );

const UpdatePaymentMethodScheme = z.object({
  id: z.string().min(1),
  data: PaymentMethodScheme,
});

export const updatePaymentMethodFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(UpdatePaymentMethodScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingMethod = await prisma.paymentMethod.findUnique({
        where: { id: data.id },
      });

      if (!existingMethod) {
        throw new ResponseError("Metode pembayaran tidak ditemukan");
      }

      let imagePath = null;
      const createNewImage =
        data.data.image?.base64 && data.data.image?.filename;
      if (createNewImage) {
        if (existingMethod.image_path) {
          const fullPath = join(
            process.cwd(),
            "public",
            existingMethod.image_path,
          );
          try {
            await unlink(fullPath);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        }

        await ensureUploadDir();
        const extension = data.data.image!.filename!.split(".").pop();
        const uniqueFilename = `${randomUUID()}.${extension}`;
        const filePath = join(UPLOAD_DIR, uniqueFilename);
        imagePath = `/uploads/payment-methods/${uniqueFilename}`;

        let base64Data = data.data.image!.base64 as string;
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,").pop() || base64Data;
        }

        const buffer = Buffer.from(base64Data, "base64");
        await writeFile(filePath, buffer);
      } else {
        if (!data.data.image?.base64) {
          if (existingMethod.image_path) {
            const fullPath = join(
              process.cwd(),
              "public",
              existingMethod.image_path,
            );
            try {
              await unlink(fullPath);
            } catch (error) {
              console.error("Error deleting file:", error);
            }
          }

          imagePath = null;
        } else {
          imagePath = undefined;
        }
      }

      const method = await prisma.paymentMethod.update({
        data: {
          name: data.data.name,
          description: data.data.description,
          status: data.data.status as Status,
          image_path: imagePath,
        },
        where: {
          id: data.id,
        },
      });
      return method;
    }),
  );

const DeletePaymentMethodScheme = z.object({
  id: z.string().min(1),
});

export const deletePaymentMethodFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(DeletePaymentMethodScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingMethod = await prisma.paymentMethod.findUnique({
        where: { id: data.id },
      });

      if (!existingMethod) {
        throw new ResponseError("Metode pembayaran tidak ditemukan");
      }

      await prisma.paymentMethod.delete({
        where: { id: data.id },
      });

      return null;
    }),
  );
