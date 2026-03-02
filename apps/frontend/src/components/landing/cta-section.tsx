"use client";

import Image from "next/image";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-primary px-12 py-[100px]">
      <div
        className="absolute inset-0 opacity-[0.04] 
        bg-[radial-gradient(oklch(96%_0.010_80)_1px,transparent_1px)]
        bg-[length:24px_24px]"
      />

      <div className="pointer-events-none absolute -top-[100px] -right-[100px] h-[400px] w-[400px] rounded-full border " />

      <div className="pointer-events-none absolute -top-[60px] -right-[60px] h-[280px] w-[280px] rounded-full border " />

      <div className="relative z-10 mx-auto max-w-[700px] text-center">
        {/* icon */}
        <div className=" flex justify-center">
          <div className="relative h-[120px] w-[130px] overflow-hidden">
            <Image
              src="/quill-1.png"
              alt="Detective's Quill Logo"
              fill
              sizes="180px"
              className="object-cover object-center"
            />
          </div>
        </div>

        <h2
          className="mb-5 font-playfair-display
          text-[clamp(36px,5vw,60px)]
          font-bold leading-[1.08]
          tracking-[-0.03em]
          text-background"
        >
          Your Next Case
          <br />
          <em className="italic text-accent">Awaits.</em>
        </h2>

        {/* description */}
        <p
          className="mx-auto mb-11 max-w-[520px]
          font-[Georgia,serif]
          text-[17px]
          leading-[1.75]
          text-drag-card"
        >
          Join thousands of crime fiction writers who&apos;ve found their
          method. Free to start — no credit card required.
        </p>

        {/* buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* primary button */}
          <button
            className="
              rounded-lg
              bg-primary-foreground
              px-10 py-4
              noir-text
              text-[17px]
              font-bold
              text-primary
              shadow-[0_4px_24px_oklch(10%_0.010_245/0.4)]
              transition-all duration-200
              hover:-translate-y-[2px]
              hover:shadow-lg
              cursor-pointer
            "
          >
            Start Writing Free
          </button>

          {/* secondary button */}
          <button
            className="
              rounded-lg
              border-[1.5px]
              bg-transparent
              px-8 py-[15px]
              noir-text
              text-[16px]
              text-secondary
              transition-all duration-200
              hover:border-secondary
              hover:text-background
              cursor-pointer
              font-semibold
            "
          >
            View Features
          </button>
        </div>

        {/* footer note */}
        <p className="mt-6 noir-text text-[15px] text-muted-foreground">
          Free plan includes 3 active cases · No credit card required
        </p>
      </div>
    </section>
  );
}
