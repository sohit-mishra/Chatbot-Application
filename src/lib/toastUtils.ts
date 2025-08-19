import { toast } from "sonner";

export const showSuccessToast = (message: string) =>
  toast("", {
    description: message,
    className: "bg-green-500 text-white border-none shadow-md",
    icon: "✅",
  });

export const showErrorToast = (message: string) =>
  toast("", {
    description: message,
    className: "bg-red-600 text-white border-none shadow-md",
    icon: "❌",
  });

export const showWarningToast = (message: string) =>
  toast("", {
    description: message,
    className: "bg-yellow-400 text-black border-none shadow-md",
    icon: "⚠️",
  });