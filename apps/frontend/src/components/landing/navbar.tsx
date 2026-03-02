import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-[100] border-b border-secondary-foreground/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <div className="relative h-[56px] w-[180px] overflow-hidden">
          <Image
            src="/logo.png"
            alt="Detective's Quill Logo"
            fill
            sizes="180px"
            className="object-cover object-center"
          />
        </div>

        <div className="flex items-center gap-9">
          {["Features", "Pricing"].map((item) => (
            <a
              key={item}
              href="#"
              className="
              noir-text
              text-[1.1rem]
              text-muted-foreground
              no-underline
              tracking-[0.01em]
              transition-colors duration-200
              hover:text-secondary-foreground
            "
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          href="/cases"
          className="
          bg-foreground
          text-secondary
          border-0
          rounded-md
           px-8 py-2
           cursor-pointer
          noir-text
          text-[1rem]
          tracking-[0.02em]
          transition-all duration-200
          hover:-translate-y-[1px]
        "
        >
          Begin Writing
        </Link>
      </div>
    </nav>
  );
}
