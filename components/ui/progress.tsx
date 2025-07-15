import * as React from "react";

export type ProgressProps = React.ProgressHTMLAttributes<HTMLProgressElement> & { value: number, max: number };

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ value, max, ...props }, ref) => (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="bg-[#18C5C2] h-3 rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%` }}
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
        role="progressbar"
      />
    </div>
  )
);
Progress.displayName = "Progress";
