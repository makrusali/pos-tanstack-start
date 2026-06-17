import type {
  OtherCost,
  Customer,
  Payment,
  PaymentMethod,
  Prisma,
  Product,
  ProductSku,
  Setting,
  Transaction,
  TransactionItem,
  Unit,
  User,
} from "#/generated/prisma/browser";
import { Decimal } from "decimal.js";
import { ResponseError } from "./utils";
import { randomUUID } from "crypto";
// @ts-ignore
import PDFDocument from "pdfkit";

export const saveMovementOut = async (
  db: Prisma.TransactionClient,
  {
    stock_batch_id,
    location_id,
    product_sku_id,
    quantity,
    reference_id,
    reference_type,
    note,
  }: {
    stock_batch_id: string;
    location_id: string;
    product_sku_id: string;
    quantity: Decimal;
    reference_id: string;
    reference_type: string;
    note: string;
  },
) => {
  let stockBatch = await db.stockBatches.findUnique({
    where: {
      id: stock_batch_id,
    },
  });

  if (!stockBatch) {
    throw new ResponseError("stock batch id is invalid.");
  }

  let stock = await db.stockProductSku.findFirst({
    where: {
      stock_location_id: location_id,
      product_sku_id: product_sku_id,
    },
  });
  if (!stock) {
    throw new ResponseError("stock batch id is invalid.");
  }

  const newRemainingQty = new Decimal(stockBatch.remaining_quantity).sub(
    quantity,
  );
  await db.stockBatchUsage.create({
    data: {
      prev_quantity: stockBatch.remaining_quantity,
      current_quantity: newRemainingQty,
      quantity: quantity,
      stock_batches_id: stock_batch_id,
    },
  });

  await db.stockBatches.update({
    where: {
      id: stock_batch_id,
    },
    data: {
      remaining_quantity: newRemainingQty,
    },
  });

  const newQuantity = stock.quantity.sub(quantity);
  await db.stockProductSku.update({
    where: {
      id: stock.id,
    },
    data: {
      quantity: newQuantity,
    },
  });

  await db.stockMovement.create({
    data: {
      id: randomUUID(),
      stock_product_sku_id: stock.id,
      prev_quantity: stock.quantity,
      current_quantity: newQuantity,
      quantity: quantity.neg(),
      reference_id: reference_id,
      reference_type: reference_type,
      type: "out",
      note: note,
      transaction_date: new Date(),
      stock_batches_id: stock_batch_id,
    },
  });

  const stockProductsPerLocations = await db.stockProductSku.findMany({
    where: {
      product_sku_id: product_sku_id,
    },
  });
  const updatedTotal = stockProductsPerLocations.reduce(
    (c, p) => c.add(p.quantity),
    new Decimal(0),
  );
  await db.productSku.update({
    where: {
      id: product_sku_id,
    },
    data: {
      stock_quantity: updatedTotal,
    },
  });
};

// @note: when the option? gived undefined, it will create a new one, stock product skus
export const saveMovementIn = async (
  db: Prisma.TransactionClient,
  {
    stock_product_sku_id,
    location_id,
    product_sku_id,
    quantity,
    reference_id,
    reference_type,
    note,
    buy_price,
    is_primary = false,
  }: {
    stock_product_sku_id?: string;
    is_primary: boolean;
    buy_price: number;
    location_id: string;
    product_sku_id: string;
    quantity: Decimal;
    reference_id: string;
    reference_type: string;
    note: string;
  },
) => {
  const stock = stock_product_sku_id
    ? await db.stockProductSku.findFirst({
        where: {
          stock_location_id: location_id,
          product_sku_id: product_sku_id,
        },
      })
    : await db.stockProductSku.create({
        data: {
          product_sku_id: product_sku_id,
          is_primary: is_primary,
          quantity: 0,
          stock_location_id: location_id,
        },
      });

  if (!stock) {
    throw new ResponseError("stock is invalid.");
  }

  const date = new Date();
  const stockBatch = await db.stockBatches.create({
    data: {
      buy_price: buy_price,
      product_sku_id: product_sku_id,
      date: date,
      quantity: quantity,
      remaining_quantity: quantity,
      source_id: reference_id,
      source_reference: reference_type,
      stock_product_sku_id: stock.id,
      stock_location_id: location_id,
    },
  });

  const newQuantity = stock.quantity.add(quantity);
  await db.stockProductSku.update({
    where: {
      id: stock.id,
    },
    data: {
      quantity: newQuantity,
    },
  });

  await db.stockMovement.create({
    data: {
      id: randomUUID(),
      stock_product_sku_id: stock.id,
      prev_quantity: stock.quantity,
      current_quantity: newQuantity,
      quantity: quantity,
      reference_id: reference_id,
      reference_type: reference_type,
      type: "in",
      note: note,
      transaction_date: date,
      stock_batches_id: stockBatch.id,
    },
  });

  const stockProductsPerLocations = await db.stockProductSku.findMany({
    where: {
      product_sku_id: product_sku_id,
    },
  });

  const updatedTotal = stockProductsPerLocations.reduce(
    (c, p) => c.add(p.quantity),
    new Decimal(0),
  );
  await db.productSku.update({
    where: {
      id: product_sku_id,
    },
    data: {
      stock_quantity: updatedTotal,
    },
  });
};
export async function generateReceipt(data: {
  setting: Setting;
  transaction: Transaction & {
    maker?: User | null;
    customer?: Customer | null;
    payments: (Payment & {
      paymentMethod: PaymentMethod;
    })[];
    anotherFees: OtherCost[];
    transactionItems: (TransactionItem & {
      productSku: ProductSku & {
        product: Product;
        unit: Unit;
      };
    })[];
  };
}): Promise<{
  filename: string;
  bytes: Uint8Array;
}> {
  const { setting, transaction } = data;

  const calculateHeight = () => {
    let lineCount = 0;

    // Header
    lineCount += 6;
    lineCount += 2;
    lineCount += 4;
    if (transaction.customer) lineCount += 1;
    lineCount += 2;

    // Table header
    lineCount += 2;

    // Items
    for (const item of transaction.transactionItems) {
      const productName =
        item.productSku.product.name +
        (item.productSku.name ? ` - ${item.productSku.name}` : "");
      const nameLines = Math.ceil(productName.length / 32) || 1;
      lineCount += nameLines;
      lineCount += 1; // price line
      if (item.discount_total > 0) lineCount += 1;
    }

    lineCount += 2;
    lineCount += 2;
    if (transaction.discount_total > 0) lineCount += 1;
    lineCount += transaction.anotherFees.length;
    lineCount += 2;
    lineCount += 2;
    lineCount += transaction.payments.length * 2;
    if (transaction.payments.some((p) => p.change > 0)) {
      lineCount += transaction.payments.filter((p) => p.change > 0).length;
    }
    lineCount += 3;
    if (setting.receipent_thanks_text) lineCount += 2;

    return Math.max(450, 80 + Math.ceil(lineCount * 11));
  };

  const doc = new PDFDocument({
    size: [226, calculateHeight()],
    margin: 8,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk: any) => {
    chunks.push(chunk);
  });

  const pdfPromise = new Promise<Uint8Array>((resolve) => {
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(new Uint8Array(buffer));
    });
  });

  const money = (v: number) => {
    const formatted = new Intl.NumberFormat("id-ID").format(v);
    return formatted;
  };

  const fullLine = () =>
    doc.text("=".repeat(32), {
      align: "center",
    });

  const thinLine = () =>
    doc.text("-".repeat(32), {
      align: "center",
    });

  const dottedLine = () =>
    doc.text(".".repeat(32), {
      align: "center",
    });

  // Header - Alfamart style
  doc.font("Courier").fontSize(11);

  doc.text(setting.store_name.toUpperCase(), {
    align: "center",
    width: 200,
  });

  doc.fontSize(8);

  if (setting.store_address) {
    const addressLines = setting.store_address.split(",");
    addressLines.forEach((line) => {
      doc.text(line.trim(), {
        align: "center",
        width: 200,
      });
    });
  }

  doc.text(`TELP. ${setting.store_phone}`, {
    align: "center",
  });

  if (setting.store_email) {
    doc.text(setting.store_email, {
      align: "center",
    });
  }

  doc.moveDown(0.3);
  dottedLine();

  // Transaction info
  doc.fontSize(8);
  doc.text(`#${transaction.code}`, { width: 200 });
  doc.text(
    `${transaction.transaction_date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`,
    { width: 200 },
  );

  if (transaction.maker) {
    doc.text(`KASIR: ${transaction.maker.name.toUpperCase()}`, { width: 200 });
  }

  if (transaction.customer) {
    doc.text(`PELANGGAN: ${transaction.customer.name.toUpperCase()}`, {
      width: 200,
    });
  }

  dottedLine();

  // Table header - Alfamart style
  doc.fontSize(8);
  doc.text("Item", { continued: true, width: 110 });
  doc.text("Qty", { continued: true, width: 25, align: "center" });
  doc.text("Price", { continued: true, width: 40, align: "right" });
  doc.text("Total", { align: "right", width: 35 });

  thinLine();

  // Items - Table format like Alfamart
  for (const item of transaction.transactionItems) {
    const productName =
      item.productSku.product.name +
      (item.productSku.name ? ` - ${item.productSku.name}` : "");

    // Product name (may wrap)
    const nameLines = Math.ceil(productName.length / 32);
    if (nameLines > 1) {
      let remainingName = productName;
      for (let i = 0; i < nameLines; i++) {
        const lineText = remainingName.substring(0, 31);
        doc.text(lineText, { width: 200 });
        remainingName = remainingName.substring(31);
      }
    } else {
      doc.text(productName, { width: 200 });
    }

    // Price line: Qty x Price = Total
    const qty = item.quantity;
    const price = money(item.discounted_price);
    const subtotal = money(item.subtotal);

    const qtyStr = `${qty}`;
    const priceStr = `@${price}`;

    // Format: "2 x @5,000 = 10,000"
    const line1 = `${qtyStr} x ${priceStr}`;
    const line2 = `= ${subtotal}`;

    doc.text(line1, { continued: true, width: 150 });
    doc.text(line2, { align: "right", width: 50 });

    if (item.discount_total > 0) {
      doc.fontSize(7);
      doc.text(`  DISKON: -${money(item.discount_total)}`, { width: 190 });
      doc.fontSize(8);
    }

    doc.moveDown(0.2);
  }

  thinLine();

  // Totals section
  doc.fontSize(8);

  const totalItems = transaction.transactionItems.reduce(
    (sum, item) => sum.add(item.quantity),
    new Decimal(0),
  );
  doc.text(`TOTAL ITEM`, { continued: true, width: 120 });
  doc.text(`${totalItems}`, { align: "right", width: 70 });
  doc.moveDown(0.2);

  doc.text(`TOTAL BELANJA`, { continued: true, width: 120 });
  doc.text(money(transaction.price_total), { align: "right", width: 70 });
  doc.moveDown(0.2);

  if (transaction.discount_total > 0) {
    doc.text(`DISKON`, { continued: true, width: 120 });
    doc.text(`-${money(transaction.discount_total)}`, {
      align: "right",
      width: 70,
    });
    doc.moveDown(0.2);
  }

  for (const fee of transaction.anotherFees) {
    const feeName = (fee.note ?? "BIAYA TAMBAHAN").toUpperCase();
    doc.text(feeName, { continued: true, width: 120 });
    doc.text(money(fee.price), { align: "right", width: 70 });
    doc.moveDown(0.2);
  }

  fullLine();

  // Grand Total - Bold style
  doc.fontSize(10);
  doc.text("TOTAL BAYAR", { continued: true, width: 120, bold: true });
  doc.text(money(transaction.grand_total), {
    align: "right",
    width: 70,
    bold: true,
  });
  doc.moveDown(0.3);

  // Payments
  doc.fontSize(8);
  for (const payment of transaction.payments) {
    doc.text(payment.paymentMethod.name.toUpperCase(), {
      continued: true,
      width: 120,
    });
    doc.text(money(payment.total), { align: "right", width: 70 });
    doc.moveDown(0.2);

    if (payment.change > 0) {
      doc.text("KEMBALI", { continued: true, width: 120 });
      doc.text(money(payment.change), { align: "right", width: 70 });
      doc.moveDown(0.2);
    }
  }

  fullLine();

  // Footer - Alfamart style
  if (setting.receipent_thanks_text) {
    doc.fontSize(7);
    doc.text(setting.receipent_thanks_text.toUpperCase(), {
      align: "center",
      width: 200,
    });
    doc.moveDown(0.3);
  }

  doc.fontSize(7);
  doc.text("TERIMA KASIH", { align: "center" });
  doc.text("ATAS KUNJUNGAN ANDA", { align: "center" });
  doc.moveDown(0.2);
  doc.text("=== STRUK BUKTI PEMBAYARAN ===", { align: "center" });
  doc.text(`CETAK: ${new Date().toLocaleString("id-ID")}`, { align: "center" });

  // Add barcode-like line (just for visual)
  doc.moveDown(0.2);
  doc.text("||||||||||||||||||||||||||||||||", {
    align: "center",
    fontSize: 6,
  });

  doc.end();

  const bytes = await pdfPromise;

  return {
    filename: `struk-${transaction.id}.pdf`,
    bytes,
  };
}

export const generateTransactionCode = () => {
  const PREFIX = "SO";
  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateString = `${day}${month}${year}`;

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${PREFIX}-${dateString}-${random}`;
};
