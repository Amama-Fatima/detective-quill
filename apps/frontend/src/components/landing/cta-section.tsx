"use client";

import Image from "next/image";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-primary px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-[100px]">
      <div
        className="absolute inset-0 opacity-[0.04] 
        bg-[radial-gradient(oklch(96%_0.010_80)_2px,transparent_2px)]
        bg-[length:24px_24px]"
      />

      <div className="pointer-events-none absolute -top-[80px] -right-[80px] hidden h-[280px] w-[280px] rounded-full border md:block lg:-top-[100px] lg:-right-[100px] lg:h-[400px] lg:w-[400px]" />

      <div className="pointer-events-none absolute -top-[40px] -right-[40px] hidden h-[180px] w-[180px] rounded-full border sm:block lg:-top-[60px] lg:-right-[60px] lg:h-[280px] lg:w-[280px]" />

      <div className="relative z-10 mx-auto max-w-[700px] text-center">
        {/* icon */}
        <div className="flex justify-center">
          <div className="relative h-[96px] w-[104px] overflow-hidden sm:h-[110px] sm:w-[120px] lg:h-[120px] lg:w-[130px]">
            <Image
              src="/png/quill-1.png"
              alt="Detective's Quill Logo"
              fill
              sizes="180px"
              className="object-cover object-center"
            />
          </div>
        </div>

        <h2
          className="mb-4 font-playfair-display
          text-[clamp(30px,9vw,60px)]
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
          className="mx-auto mb-8 max-w-[520px] px-1 sm:mb-11
          font-[Georgia,serif]
          text-[16px] sm:text-[17px]
          leading-[1.75]
          text-drag-card"
        >
          Join thousands of crime fiction writers who&apos;ve found their
          method. Free to start — no credit card required.
        </p>

        {/* buttons */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          {/* primary button */}
          <button
            className="
              rounded-lg
              bg-primary-foreground
              w-full sm:w-auto
              px-7 py-3.5 sm:px-10 sm:py-4
              noir-text
              text-[16px] sm:text-[17px]
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
              w-full sm:w-auto
              px-7 py-3.5 sm:px-8 sm:py-[15px]
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
        <p className="mt-5 px-2 noir-text text-[14px] text-muted-foreground sm:mt-6 sm:text-[15px]">
          Free plan includes 3 active cases · No credit card required
        </p>
      </div>
    </section>
  );
}
