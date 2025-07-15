import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={`block w-full rounded-md border border-gray-300 px-4 py-2 text-base text-gray-900 shadow-sm min-h-[3em] focus:border-[#18C5C2] focus:ring-2 focus:ring-[#18C5C2] focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${props.className ?? ''}`}
    />
  )
);
Textarea.displayName = "Textarea";
