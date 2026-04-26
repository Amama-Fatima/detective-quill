"use client";

import { useState } from "react";
import { testimonials } from "./shared";
import { OrnamentDivider } from "@/components/icons/ornament-divider";
import { StarIcon } from "@/components/icons/star-icon";
import Image from "next/image";

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1,
    );
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="bg-background px-6 py-[100px] md:px-12 relative overflow-hidden">

      {/* Linear gradient — stronger bottom-left accent */}
      <div
        className="absolute -bottom-24 -left-90 pointer-events-none h-107.5 w-160 rounded-full"
        style={{
          background:
            "linear-gradient(315deg, oklch(88% 0.035 235 / 0.58) 0%, oklch(92% 0.018 240 / 0.34) 42%, transparent 80%)",
        }}
      />

      {/* Broad directional wash to tie both corners together */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, oklch(97% 0.007 245 / 0) 0%, oklch(93% 0.012 245 / 0.36) 52%, oklch(97% 0.007 245 / 0) 100%)",
        }}
      />

      {/* Small circles — top-left cluster */}
      <div className="absolute top-[12%] left-[6%] w-[14px] h-[14px] rounded-full border border-border opacity-100 pointer-events-none" />
      <div className="absolute top-[18%] left-[10%] w-[8px] h-[8px] rounded-full bg-muted-foreground opacity-50 pointer-events-none" />
      <div className="absolute top-[8%] left-[14%] w-[10px] h-[10px] rounded-full border border-border opacity-100 pointer-events-none" />

      {/* Small circles — bottom-right cluster */}
      <div className="absolute bottom-[16%] right-[7%] w-[16px] h-[16px] rounded-full border border-border opacity-100 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[13%] w-[9px] h-[9px] rounded-full bg-muted-foreground opacity-50 pointer-events-none" />
      <div className="absolute bottom-[22%] right-[11%] w-[11px] h-[11px] rounded-full border border-border opacity-100 pointer-events-none" />

      {/* Dot grid — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(oklch(24% 0.022 245) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="mx-auto max-w-[1100px] relative z-[2]">
        <div className="mb-16 text-center">
          <div className="mb-4 font-serif text-md uppercase tracking-[0.14em] text-muted-foreground">
            Testimonials
          </div>
          <h2 className="mb-4 font-playfair-display text-[clamp(32px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.025em] text-popover-foreground">
            Writers Who&apos;ve
            <br />
            <em className="italic text-muted-foreground">Solved</em> the Case
          </h2>
          <div className="flex justify-center text-muted-foreground">
            <OrnamentDivider />
          </div>
        </div>

        <div className="mx-auto max-w-[760px]">
          <div className="rounded-xl border bg-card px-8 pb-7 pt-8 shadow-lg">
            <div className="mb-[18px] flex gap-[2px]">
              {Array(activeTestimonial.stars)
                .fill(0)
                .map((_, index) => (
                  <StarIcon key={index} />
                ))}
            </div>
            <p className="m-0 mb-6 font-['Lora',Georgia,serif] text-base italic leading-[1.75] text-secondary-foreground">
              &ldquo;{activeTestimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-[14px] border-t pt-5">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={activeTestimonial.imgPath}
                  alt={activeTestimonial.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-playfair-display text-[1rem] font-bold text-primary">
                  {activeTestimonial.name}
                </div>
                <div className="mt-0.5 font-serif text-sm text-muted-foreground">
                  {activeTestimonial.role}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous testimonial"
              className="rounded-full border bg-card px-4 py-2 font-serif text-sm text-primary transition-colors hover:bg-background cursor-pointer"
            >
              Prev
            </button>

            <div className="flex items-center gap-2" aria-hidden>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`size-2.5 rounded-full transition-colors ${
                    index === activeIndex ? "bg-primary" : "bg-accent"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="rounded-full border bg-card px-4 py-2 font-serif text-sm text-primary transition-colors hover:bg-background cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
