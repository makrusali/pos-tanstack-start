import { createServerFn } from "@tanstack/react-start";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { wrap, parseZod } from "./utils";
import z from "zod";
import { prisma } from "#/db";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "products");

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
};

const UploadImageScheme = z.object({
  image: z.string().min(1, "Image data is required"),
  filename: z.string().min(1, "Filename is required"),
  skuId: z.string().optional(),
});

export const uploadProductImageFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(UploadImageScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      await ensureUploadDir();

      const extension = data.filename.split(".").pop();
      const uniqueFilename = `${randomUUID()}.${extension}`;
      const filePath = join(UPLOAD_DIR, uniqueFilename);
      const relativePath = `/uploads/products/${uniqueFilename}`;

      let base64Data = data.image;
      if (base64Data.includes(";base64,")) {
        base64Data = base64Data.split(";base64,").pop() || base64Data;
      }

      const buffer = Buffer.from(base64Data, "base64");
      await writeFile(filePath, buffer);

      if (data.skuId) {
        const image = await prisma.productSkuImage.create({
          data: {
            product_sku_id: data.skuId,
            path: relativePath,
          },
        });

        return {
          id: image.id,
          path: relativePath,
          url: relativePath,
        };
      }

      return {
        path: relativePath,
        url: relativePath,
      };
    }),
  );

const DeleteImageScheme = z.object({
  imageId: z.string(),
  imagePath: z.string(),
});

export const deleteProductImageFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(DeleteImageScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      // Delete from database
      await prisma.productSkuImage.delete({
        where: { id: data.imageId },
      });

      // Delete physical file
      const fullPath = join(process.cwd(), "public", data.imagePath);
      try {
        await unlink(fullPath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }

      return null;
    }),
  );

const UpdateImageScheme = z.object({
  imageId: z.string(),
  image: z.string().min(1, "Image data is required"),
  filename: z.string().min(1, "Filename is required"),
  oldPath: z.string(),
});

export const updateProductImageFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(UpdateImageScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      await ensureUploadDir();

      // Generate unique filename for new image
      const extension = data.filename.split(".").pop();
      const uniqueFilename = `${randomUUID()}.${extension}`;
      const filePath = join(UPLOAD_DIR, uniqueFilename);
      const relativePath = `/uploads/products/${uniqueFilename}`;

      // Remove base64 prefix if exists
      let base64Data = data.image;
      if (base64Data.includes(";base64,")) {
        base64Data = base64Data.split(";base64,").pop() || base64Data;
      }

      // Save new file
      const buffer = Buffer.from(base64Data, "base64");
      await writeFile(filePath, buffer);

      // Update database
      await prisma.productSkuImage.update({
        where: { id: data.imageId },
        data: { path: relativePath },
      });

      // Delete old physical file
      const oldFullPath = join(process.cwd(), "public", data.oldPath);
      try {
        await unlink(oldFullPath);
      } catch (error) {
        console.error("Error deleting old file:", error);
      }

      return {
        id: data.imageId,
        path: relativePath,
        url: relativePath,
      };
    }),
  );
