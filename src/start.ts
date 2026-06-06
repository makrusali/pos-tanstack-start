import { createStart } from "@tanstack/react-start";
import { createSerializationAdapter } from "@tanstack/react-router";
import Decimal from "decimal.js";

export const decimalAdapter = createSerializationAdapter({
  key: "decimal",
  test: (value: unknown): value is Decimal => Decimal.isDecimal(value),
  toSerializable: (decimal) => decimal.toNumber(),
  fromSerializable: (value) => new Decimal(value),
});

export const startInstance = createStart(() => {
  return {
    serializationAdapters: [decimalAdapter],
  };
});
