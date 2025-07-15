import * as React from "react";

export function Card({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} style={{ border: "1px solid #eee", borderRadius: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", background: "#fff", padding: "1.5rem", ...props.style }}>
      {children}
    </div>
  );
}

export function CardContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function CardHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} style={{ marginBottom: "1rem", ...props.style }}>{children}</div>;
}

export function CardTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={`font-bold text-lg mb-1 ${props.className ?? ''}`}>{children}</h3>;
}

export function CardDescription({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={`text-gray-600 text-sm ${props.className ?? ''}`}>{children}</p>;
}
