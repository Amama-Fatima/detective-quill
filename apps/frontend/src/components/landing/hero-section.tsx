"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ManuscriptIcon } from "@/components/icons/manuscript-icon";
import { MagnifyIcon } from "@/components/icons/magnify-icon";
import { CasePinIcon } from "@/components/icons/case-pin-icon";

export default function HeroSection() {
  const authorImgPaths = [
    "/images/avatar.jpg",
    "/images/author-2.jpg",
    "/images/author-3.jpg",
    "/images/author-4.jpg",
  ];

  return (
    <section
      className="
        noir-text
        grid grid-cols-1 lg:grid-cols-2 items-center
        gap-10 lg:gap-[60px]
        bg-background
        relative overflow-hidden
        min-h-[100svh]
        px-6 py-14 sm:px-10 sm:py-16 lg:px-24 lg:py-24
      "
    >
      <div
        className="
          absolute inset-0
          opacity-[0.03]
          pointer-events-none
          bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)]
          bg-[size:28px_28px]
        "
      />

      <div
        className="
          absolute top-[80px] right-0
          w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px]
          rounded-full
          bg-secondary
          opacity-50
          translate-x-[100px] -translate-y-[70px] lg:translate-x-[120px] lg:-translate-y-[80px]
          pointer-events-none
        "
      />

      {/* Small decorative circles — middle & bottom-right */}
      <div className="absolute top-[48%] left-[36%] w-[18px] h-[18px] rounded-full border border-border opacity-100 pointer-events-none" />
      <div className="absolute top-[58%] left-[48%] w-[18px] h-[18px] rounded-full border border-border opacity-100 pointer-events-none" />
      <div className="absolute top-[15%] left-[28%] w-[10px] h-[10px] rounded-full bg-primary opacity-50 pointer-events-none" />
        <div className="absolute top-[25%] right-[28%] w-[10px] h-[10px] rounded-full bg-primary opacity-50 pointer-events-none" />
      <div className="absolute bottom-[22%] right-[20%] w-[22px] h-[22px] rounded-full border border-border opacity-100 pointer-events-none" />
      <div className="absolute bottom-[14%] right-[32%] w-[12px] h-[12px] rounded-full bg-muted-foreground opacity-50 pointer-events-none" />
      <div className="absolute bottom-[30%] right-[12%] w-[16px] h-[16px] rounded-full border border-border opacity-100 pointer-events-none" />

      <div className="relative z-[2]">
        <div className="inline-flex items-center gap-2 bg-accent rounded-full px-[12px] py-[6px] mb-5 lg:mb-[28px]">
          <CasePinIcon />
          <span className="case-file font-bold text-[14px] tracking-tight uppercase tracking-[0.08em] text-primary">
            The Writer&apos;s Studio
          </span>
        </div>

        <h1 className="font-playfair-display text-[clamp(36px,10vw,72px)] font-bold leading-[1.08] tracking-[-0.03em] text-primary mb-4 lg:mb-[24px]">
          Where Every <br />
          <em className="italic text-muted-foreground">Clue</em> Becomes <br />a
          Chapter.
        </h1>

        <p className="noir-text text-base sm:text-[17px] lg:text-[18px] leading-[1.75] text-muted-foreground max-w-[460px] mb-8 lg:mb-[40px]">
          A writing platform built for detective fiction authors. Draft in the
          editor, map suspects on the canvas, trace connections in the graph —
          all in one focused space.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-[14px]">
          <Button
            className="
              bg-primary
              text-primary-foreground
              rounded-lg
              w-full sm:w-auto
              px-6 sm:px-8 py-5 sm:py-6
              mystery-title
              text-[16px]
              tracking-[0.02em]
              transition-all duration-200
              shadow-[0_4px_20px_oklch(24%_0.022_245/0.25)]
              hover:-translate-y-[2px]
              hover:bg-secondary-foreground
              cursor-pointer
            "
          >
            Open a New Case
          </Button>

          <Button
            className="
              bg-secondary
              text-primary
              border-[1.5px]
              mystery-title
              rounded-lg
              w-full sm:w-auto
              px-6 sm:px-8 py-5 sm:py-6
              font-[Georgia,serif]
              text-[16px]
              tracking-[0.02em]
              transition-all duration-200
              hover:border-muted-foreground
              hover:bg-primary-foreground
              cursor-pointer
            "
          >
            View Showcase
          </Button>
        </div>

        <div className="flex items-center gap-[14px] mt-8 lg:mt-[40px]">
          <div className="flex">
            {authorImgPaths.map((src, i) => (
              <div
                key={src}
                className={`relative h-[32px] w-[32px] overflow-hidden rounded-full border border-border ${
                  i === 0 ? "ml-0" : "-ml-2"
                }`}
              >
                <Image
                  src={src}
                  alt={`Author ${i + 1}`}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <span className="text-[15px] italic text-muted-foreground noir-text">
            Loved by <strong className="text-primary">1,200+</strong> crime
            fiction writers
          </span>
        </div>
      </div>

      <div className="relative hidden lg:flex justify-center items-center h-[520px]">
        <div className="relative z-[3] w-[280px] bg-card border rounded-xl px-[28px] py-[32px] shadow-xl">
          <div className="mystery-title text-[12px] uppercase tracking-[0.12em] text-muted-foreground mb-[12px]">
            Case File — Draft
          </div>

          <ManuscriptIcon />

          <div className="mt-[8px]">
            <div className="noir-text text-[13px] text-muted-foreground leading-[1.6]">
              The fog rolled in from the harbour as Inspector Marlowe turned the
              brass doorknob...
            </div>

            <div className="mt-[14px] flex items-center gap-[8px]">
              <div className="h-[2px] flex-1 rounded bg-accent">
                <div className="h-full w-[68%] rounded bg-accent-foreground" />
              </div>
              <span className="text-[11px] text-muted-foreground noir-text">
                68%
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-[30px] right-[10px] z-[4] w-[160px] bg-card border border-border/50 rounded-[10px] px-[16px] py-[14px] shadow-l animate-[float1_4s_ease-in-out_infinite]">
          <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-[10px] mystery-title">
            Suspects
          </div>

          {[
            ["Col. Ashford", "Alibi weak"],
            ["Lady Vane", "Motive ✓"],
            ["Dr. Simms", "Unknown"],
          ].map(([name, note]) => (
            <div
              key={name}
              className="flex justify-between items-center py-[5px] border-b border-border/20"
            >
              <span className="text-[11px] font-semibold text-primary noir-text">
                {name}
              </span>
              <span
                className={`text-[10px] ${
                  note.includes("✓")
                    ? "text-[oklch(52%_0.12_145)]"
                    : "text-muted-foreground"
                }`}
              >
                {note}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-[60px] left-0 z-[4] w-[140px] bg-primary rounded-[10px] px-[18px] py-[14px] shadow-[0_8px_30px_oklch(24%_0.022_245/0.25)] animate-[float2_5s_ease-in-out_infinite]">
          <div className="text-[10px] uppercase tracking-[0.1em] text-primary-foreground mb-[6px] noir-text">
            Today&apos;s Words
          </div>
          <div className="font-playfair-display text-[32px] font-bold text-primary-foreground leading-none">
            1,842
          </div>
          <div className="text-[11px] text-muted mt-[4px] noir-text">
            ↑ 340 from yesterday
          </div>
        </div>

        <div className="absolute top-[160px] left-[-20px] z-[4] bg-accent border rounded-lg px-[14px] py-[10px] shadow-[0_4px_16px_oklch(24%_0.022_245/0.08)] animate-[float3_6s_ease-in-out_infinite]">
          <div className="flex items-center gap-[8px]">
            <MagnifyIcon size={20} />
            <span className="text-[14px] font-semibold text-primary noir-text">
              Deep Search
            </span>
          </div>
          <div className="text-[12px] text-muted-foreground mt-[4px] noir-text">
            "poison + 1920s London"
          </div>
        </div>
      </div>

      {/* Floating animations */}
      <style>{`
        @keyframes float1 {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes float2 {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes float3 {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      `}</style>
    </section>
  );
}
