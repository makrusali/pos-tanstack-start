import { createServerFn } from "@tanstack/react-start";
import { parseZod, ResponseError, wrap } from "./utils";
import { prisma } from "#/db";
import z from "zod";

export const getCustomersFn = createServerFn({ method: "GET" }).handler(
  async () =>
    wrap(async () => {
      const customers = await prisma.customer.findMany({
        orderBy: { created_at: "desc" },
      });
      return customers;
    }),
);

const CustomerScheme = z.object({
  name: z.string().min(1, "Nama customer harus diisi"),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export const createCustomerFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(CustomerScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          address: data.address,
          email: data.email,
          phone: data.phone,
        },
      });
      return customer;
    }),
  );

const GetCustomerScheme = z.object({
  id: z.string().min(1),
});

export const getCustomerFn = createServerFn({ method: "GET" })
  .inputValidator(parseZod(GetCustomerScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const customer = await prisma.customer.findUnique({
        where: { id: data.id },
        include: {
          transactions: {
            orderBy: { transaction_date: "desc" },
            take: 10,
          },
        },
      });

      if (!customer) {
        throw new ResponseError("Customer tidak ditemukan");
      }

      return customer;
    }),
  );

const UpdateCustomerScheme = z.object({
  id: z.string().min(1),
  data: CustomerScheme.partial(),
});

export const updateCustomerFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(UpdateCustomerScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: data.id },
      });

      if (!existingCustomer) {
        throw new ResponseError("Customer tidak ditemukan");
      }

      const customer = await prisma.customer.update({
        where: { id: data.id },
        data: {
          name: data.data.name,
          address: data.data.address,
          email: data.data.email,
          phone: data.data.phone,
        },
      });

      return customer;
    }),
  );

const DeleteCustomerScheme = z.object({
  id: z.string().min(1),
});

export const deleteCustomerFn = createServerFn({ method: "POST" })
  .inputValidator(parseZod(DeleteCustomerScheme))
  .handler(async ({ data }) =>
    wrap(async () => {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: data.id },
        include: {
          transactions: {
            take: 1,
          },
        },
      });

      if (!existingCustomer) {
        throw new ResponseError("Customer tidak ditemukan");
      }

      if (existingCustomer.transactions.length > 0) {
        throw new ResponseError(
          "Customer tidak dapat dihapus karena sudah memiliki transaksi",
        );
      }

      await prisma.customer.delete({
        where: { id: data.id },
      });

      return null;
    }),
  );
