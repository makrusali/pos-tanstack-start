import z, { string, success, ZodError } from "zod";

export class ResponseError extends Error {
  errors: ErrorItem[];

  constructor(errors: ErrorItem[] | string) {
    super("Response Error");

    this.name = "ResponseError";

    this.errors =
      typeof errors === "string"
        ? [
          {
            key: "global",
            message: errors,
          },
        ]
        : errors;
  }
}

type ErrorItem = {
  key: string;
  message: string;
};


export type Response<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ErrorItem[];
};

export const wrap = async <T>(
  func: () => Promise<T>
): Promise<Response<T>> => {
  try {
    const data = await func();

    return {
      success: true,
      data,
      message: "Berhasil.",
    };
  } catch (error) {
    console.log("[SERVER ERROR]: ", error);


    if (error instanceof ZodError) {
      throw {
        success: false,
        errors: error.issues.map((err) => ({
          key:
            err.path.reduce((acc, part) => {
              if (typeof part === "number") {
                return `${acc.toString()}[${part}]`;
              }

              return acc ? `${acc.toString()}.${part.toString()}` : part;
            }, "") || "global",
          message: err.message,
        })),
      };
    }

    if (error instanceof ResponseError) {
      throw {
        success: false,
        errors: error.errors,
      };
    }


    throw {
      success: false,
      errors: [
        {
          key: "global",
          message: "Terjadi kesalahan pada server.",
        },
      ]
    };
  }
};

export function parseZod<Schema extends z.ZodSchema>(
  schema: Schema
): (input: z.input<Schema>) => z.output<Schema> {
  return (input: z.input<Schema>) => {
    const res = schema.safeParse(input);

    if (res.success) return res.data;

    throw {
      success: false,
      errors: res.error.issues.map((err) => ({
        key:
          err.path.reduce((acc, part) => {
            if (typeof part === "number") {
              return `${acc.toString()}[${part}]`;
            }

            return acc ? `${acc.toString()}.${part.toString()}` : part;
          }, "") || "global",
        message: err.message,
      })),
    };
  };
}