import type { RoleGetPayload } from "#/generated/prisma/models";
import { useSession } from "@tanstack/react-start/server";

type SessionData = {
  email?: string;
};

export const useAppSession = () => {
  return useSession<SessionData>({
    name: "app-session",
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  });
};

export const isCanDo = (
  role:
    | RoleGetPayload<{
        include: {
          role_permissions: {
            include: {
              permission: true;
            };
          };
        };
      }>
    | undefined,
  module: string,
  action: string,
): boolean => {
  if (!role) {
    return false;
  }

  if (role.role_permissions.length === 0) {
    return false;
  }

  const can = role.role_permissions.some(
    (v) => v.permission.module === module && v.permission.action === action,
  );

  return can;
};
