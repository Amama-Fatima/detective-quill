"use client";

import { features } from "./shared";
import { OrnamentDivider } from "@/components/icons/ornament-divider";

export default function FeaturesSection() {
  return (
    <section className="bg-muted px-6 py-[100px] md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-16 text-center">
          <div className="mb-4 font-serif text-md uppercase tracking-[0.14em] text-muted-foreground">
            The Investigator&apos;s Toolkit
          </div>
          <h2 className="mb-4 font-playfair-display text-[clamp(32px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.025em] text-primary">
            Every Tool a<br />
            <em className="italic text-muted-foreground">Crime Writer</em> Needs
          </h2>
          <div className="flex justify-center text-muted-foreground">
            <OrnamentDivider />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="relative cursor-default overflow-hidden rounded-xl border  bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-muted-foreground hover:shadow-xl"
            >
              <div className="absolute right-5 top-5 rounded-full bg-accent px-2.5 py-[3px] font-serif text-[12px] uppercase tracking-[0.1em] text-muted-foreground case-file">
                {f.tag}
              </div>
              <div className="mb-[18px] text-primary">{f.icon}</div>
              <h3 className="mb-3 font-playfair-display text-[22px] font-bold tracking-[-0.02em] text-primary">
                {f.title}
              </h3>
              <p className="m-0 font-serif text-[1rem] leading-[1.7] text-muted-foreground noir-text">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
