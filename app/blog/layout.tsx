import { Suspense } from "react";
import HeaderBlog from "./_assets/components/HeaderBlog";
import Footer from "@/components/Footer";

import type { ReactNode } from "react";

export default async function LayoutBlog({ children }: { children: ReactNode }) {
  return (
    <div>
      <Suspense>
        <HeaderBlog />
      </Suspense>

      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>

      <div className="h-24" />

      <Footer />
    </div>
  );
}
