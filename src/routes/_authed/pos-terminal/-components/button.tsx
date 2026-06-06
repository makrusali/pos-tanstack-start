import { cn } from "#/lib/utils";
import type { MouseEventHandler, ReactNode } from "react";

const buttonVariants = {
  primary:
    "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900",
  accent:
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5",
  danger:
    "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5",
  ghost: "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80",
  outlined:
    "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300 hover:bg-slate-50",
  surfaceCard: "bg-white rounded-2xl shadow-sm ring-1 ring-slate-100",
  surfaceElevated:
    "bg-white rounded-2xl shadow-lg shadow-slate-200/50 ring-1 ring-slate-100",
  inputClean:
    "bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-400",
};

type Props = {
  variant: Extract<keyof typeof buttonVariants, string>;
  className: string | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  disabled?: boolean;
};

const CustomButton = (props: Props) => {
  return (
    <button
      disabled={props.disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[props.variant],
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export { CustomButton };
