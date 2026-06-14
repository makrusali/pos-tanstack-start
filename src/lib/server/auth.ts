import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import bcrypt from "bcrypt";
import { useAppSession } from "../session";

const LoginScheme = z.object({
  email: z.string().min(1),
  password: z.string().min(8),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(LoginScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const user = await prisma.user.findFirst({
        where: {
          email: data.email,
        },
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (user === null) {
        throw new ResponseError([
          {
            key: "global",
            message: "User tidak ditemukan.",
          },
        ]);
      }

      if (!bcrypt.compareSync(data.password, user.password)) {
        throw new ResponseError([
          {
            key: "global",
            message: "Email atau password tidak cocok.",
          },
        ]);
      }

      const session = await useAppSession();
      await session.update({
        email: user.email,
      });

      const mapped = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.role_permissions.map((rhp) => rhp.permission),
          created_at: user.role.created_at,
          updated_at: user.role.updated_at,
        },
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return mapped;
    }),
  );
