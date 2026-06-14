import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "#/db";

async function main() {
  console.log("🌱 Seeding database...");

  const initRole = {
    id: randomUUID(),
    name: "Superadmin",
  };

  const initPermissions = [
    {
      id: randomUUID(),
      module: "dashboard",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "dashboard",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "dashboard",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "dashboard",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "products",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "products",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "products",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "products",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "categories",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "categories",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "categories",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "categories",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "units",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "units",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "units",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "units",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "stock-movements",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "stock-movements",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "stock-movements",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "stock-movements",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "purchase-stocks",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "purchase-stocks",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "purchase-stocks",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "purchase-stocks",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "stock-adjustments",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "stock-adjustments",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "stock-adjustments",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "stock-adjustments",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "expenses",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "expenses",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "expenses",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "expenses",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "users",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "users",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "users",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "users",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "roles-permissions",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "roles-permissions",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "roles-permissions",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "roles-permissions",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "settings",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "settings",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "settings",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "settings",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "payment-methods",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "payment-methods",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "payment-methods",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "payment-methods",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "transactions",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "transactions",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "transactions",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "transactions",
      action: "update",
    },

    {
      id: randomUUID(),
      module: "promotions",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "promotions",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "promotions",
      action: "create",
    },
    {
      id: randomUUID(),
      module: "promotions",
      action: "update",
    },
    {
      id: randomUUID(),
      module: "pos",
      action: "index",
    },
    {
      id: randomUUID(),
      module: "pos",
      action: "show",
    },
    {
      id: randomUUID(),
      module: "pos",
      action: "create",
    },
  ];

  const initRoleHasPermissions = initPermissions.map((p) => ({
    role_id: initRole.id,
    permission_id: p.id,
  }));

  const initUser = {
    id: randomUUID(),
    name: "Superadmin",
    email: "super@gmail.com",
    password: await bcrypt.hash("12345678", 12),
    role_id: initRole.id,
  };

  await prisma.user.deleteMany();
  await prisma.roleHasPermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  await prisma.role.create({ data: initRole });
  await prisma.permission.createMany({ data: initPermissions });
  await prisma.roleHasPermission.createMany({ data: initRoleHasPermissions });
  await prisma.user.create({ data: initUser });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
