import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getErrorMessage(err, fallback = "Something went wrong.") {
  const backendMessage = err?.response?.data?.message;
  if (backendMessage) return backendMessage;

  const status = err?.response?.status;
  if (status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (status === 401) {
    return "Invalid credentials.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again shortly.";
  }

  return err?.message || fallback;
}