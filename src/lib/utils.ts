import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const applyFormErrors = (form: any, err: any) => {
  const errors = err?.errors ?? [];
  errors.forEach((e: any) => {
    if (e.key === "global") {
      toast.error(e.message, {
        position: "top-center",
      });
      return;
    }

    if (form) {
      form.setFieldMeta(e.key, (meta: any) => ({
        ...meta,
        errorMap: {
          onSubmit: e.message,
        },
      }));
    }
  });
};

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5; // Maximum number of page buttons to show
  const rangeWithDots = [];

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i);
    }
  } else {
    // Always show first page
    rangeWithDots.push(1);

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push("...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push("...", totalPages);
    }
  }

  return rangeWithDots;
}

/**
 * Initials from a display name: first character of the first word + first
 * character of the last word. One word only: first two characters. Empty: `?`.
 */
export function getDisplayNameInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

/**
 * Format a date into a localized string
 * @param date - Date object, timestamp, or date string
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date provided");
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(
    dateObj,
  );
};

/**
 * Format a date with time
 * @param date - Date object, timestamp, or date string
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date | string | number,
  locale: string = "en-US",
): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return formatDate(date, locale, options);
};

/**
 * Format a date to relative time (e.g., "2 days ago")
 * @param date - Date object, timestamp, or date string
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date provided");
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const diff = Math.floor(diffInSeconds / seconds);
    if (diff >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(-diff, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return "just now";
};

export const formatCurrencyIDR = (amount: number) => {
  return formatCurrencyNoDecimal(amount, "IDR", "id");
};

/**
 * Format a number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Invalid amount provided");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}; /**
 * Format currency without decimal places
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string with no decimals
 */
export const formatCurrencyNoDecimal = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Invalid amount provided");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string (e.g., "$1,234.56")
 * @returns Number value
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbol, commas, and convert to number
  const numericString = currencyString.replace(/[^0-9.-]/g, "");
  const amount = parseFloat(numericString);

  if (isNaN(amount)) {
    throw new Error("Invalid currency string provided");
  }

  return amount;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function inputFormatRP(value?: number | string): string {
  if (value === undefined) {
    return "";
  }

  const number = typeof value === "string" ? Number(value) : value;

  if (isNaN(number)) return "0";

  return number.toLocaleString("id-ID");
}

export function inputParseRP(value: string): number {
  return Number(value.replace(/\./g, "").replace(/,/g, "."));
}

export async function wrapFn<T>(
  promise: Promise<{ data?: T }>,
  fallback: T,
): Promise<T> {
  const result = await promise;
  return result?.data ?? fallback;
}
