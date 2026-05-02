"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="
        flex flex-col items-center gap-4 md:flex-row md:justify-between
        px-5 py-5 sm:px-8 lg:px-16
        bg-foreground
        border-t
      "
    >
      <div className="flex items-center gap-[10px]">
        <div className="relative h-[46px] w-[148px] overflow-hidden sm:h-[52px] sm:w-[168px] lg:h-[56px] lg:w-[180px]">
          <Image
            src="/png/inverted-logo.png"
            alt="Detective's Quill Logo"
            fill
            sizes="180px"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="noir-text text-center text-[0.95rem] text-secondary md:px-4 md:text-[1rem]">
        Detective&apos;s Quill · Built for the obsessive craft of crime fiction.
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {["Privacy", "Terms", "Contact"].map((l) => (
          <a
            key={l}
            href="#"
            className="
              noir-text
              text-[0.95rem] sm:text-[1rem]
              text-secondary
              no-underline
              transition-colors duration-200
              hover:underline
            "
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
