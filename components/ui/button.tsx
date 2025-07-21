import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={`inline-flex items-center justify-center rounded-md bg-[#18C5C2] px-5 py-2 text-base font-semibold text-white shadow transition-colors hover:bg-[#1A7F6B] focus:outline-none focus:ring-2 focus:ring-[#18C5C2] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
