"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="
        flex items-center justify-between
        px-16 py-5
        bg-foreground
        
        border-t
      "
    >
      <div className="flex items-center gap-[10px]">
        <div className="relative h-[56px] w-[180px] overflow-hidden">
          <Image
            src="/inverted-logo.png"
            alt="Detective's Quill Logo"
            fill
            sizes="180px"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="noir-text text-[1rem] text-secondary">
        Detective&apos;s Quill · Built for the obsessive craft of crime fiction.
      </div>

      <div className="flex gap-[24px]">
        {["Privacy", "Terms", "Contact"].map((l) => (
          <a
            key={l}
            href="#"
            className="
              noir-text
              text-[1rem]
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
