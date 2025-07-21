"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";

import favicon from "@/app/favicon.png";
import config from "@/config";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#testimonials",
    label: "Testimonials",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-white border-b shadow-sm">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title="MindForU.com homepage"
          >
            <Image src="/Icon_Small-removebg-preview.png" alt="MindForU logo" className="w-10 h-10" priority={true} width={40} height={40} />
            <span className="font-extrabold text-xl">
  <span style={{
    color: '#18C5C2',
    fontWeight: 700
  }}>MindForU</span><span style={{ color: '#18C5C2', fontWeight: 700 }}>.com</span>
</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex items-center gap-6 lg:flex-1 lg:justify-end">
          {/* Navigation Links */}
          <Link
            href="#features"
            className="mx-4 text-[#222831] font-medium hover:border-b-2 hover:border-[#19c37d] hover:text-[#19c37d] transition-all duration-200"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="mx-4 text-[#222831] font-medium hover:border-b-2 hover:border-[#19c37d] hover:text-[#19c37d] transition-all duration-200"
          >
            Testimonials
          </Link>
          <Link
            href="#faq"
            className="mx-4 text-[#222831] font-medium hover:border-b-2 hover:border-[#19c37d] hover:text-[#19c37d] transition-all duration-200"
          >
            FAQ
          </Link>
          {/* CTA Button */}
          <ButtonSignin
  text="Sign In"
  extraStyle="ml-6 bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300"
/>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0 "
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image src={favicon} alt="MindForU icon" width={32} height={32} className="mr-2" />
              <span className="font-extrabold text-lg" style={{ color: '#222831' }}>{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
  {links.map((link) => (
    <Link
      href={link.href}
      key={link.href}
      className="text-[#222831] font-medium transition-all duration-150 border-b-2 border-transparent hover:border-[#222831] hover:text-[#222831] focus:outline-none"
      title={link.label}
    >
      {link.label}
    </Link>
  ))}
</div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            <div className="flex flex-col">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
