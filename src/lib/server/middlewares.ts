import { createMiddleware } from "@tanstack/react-start";
import { isCanDo, useAppSession } from "../session";
import { redirect } from "@tanstack/react-router";
import { prisma } from "#/db";
import { ResponseError } from "./utils";

export const authMiddleware = (
  module: string,
  action: string,
  withRedirect: boolean = false,
) => {
  return createMiddleware().server(async ({ next }) => {
    const session = await useAppSession();
    if (!session.data.email) {
      throw redirect({
        to: "/auth/login",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: session.data.email,
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

    if (!user) {
      throw redirect({
        to: "/auth/login",
      });
    }

    if (!isCanDo(user.role, module, action)) {
      if (withRedirect) {
        throw redirect({
          to: "/error-authorization",
        });
      } else {
        throw {
          success: false,
          errors: [
            {
              key: "global",
              message: "Anda tidak diperbolehkan melakukan aksi ini.",
            },
          ],
        };
      }
    }

    return next({
      context: {
        user_id: user.id,
      },
    });
  });
};
