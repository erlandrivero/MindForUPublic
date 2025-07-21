import * as React from "react";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, ...props }, ref) => (
    <span
      ref={ref}
      {...props}
      className={`inline-block rounded-full bg-[#e0f7fa] text-[#17796d] px-3 py-1 font-medium text-sm ${props.className ?? ''}`}
    >
      {children}
    </span>
  )
);
Badge.displayName = "Badge";
