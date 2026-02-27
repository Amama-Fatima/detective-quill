import React from "react";
import { OilLampIcon } from "@/components/icons/oil-lamp-icon";
import { PaperStackIcon } from "@/components/icons/paper-stack-icon";
import { CornerOrnamentIcon } from "@/components/icons/corner-ornament-icon";

const NoProjectCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="relative bg-card flex flex-col items-center justify-center py-20 px-8 rounded-xl border overflow-hidden">
     

      {/* Corner ornaments */}
      <div className="pointer-events-none absolute left-0 top-2 text-border/70">
        <CornerOrnamentIcon className="h-14 w-14 translate-x-0.5 -translate-y-0.5" />
      </div>
      <div className="pointer-events-none absolute bottom-2 right-0 text-border/70">
        <CornerOrnamentIcon className="h-14 w-14 -translate-x-0.5 translate-y-0.5 rotate-180" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-sm text-center">
        {/* Icons stacked */}
        <div className="relative">
          <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
            <OilLampIcon />
          </div>
          <div className="absolute bg-background -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center ">
            <PaperStackIcon />
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="text-md noir-text tracking-[0.16em] uppercase text-muted-foreground/60 mb-2">
            — No records found —
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2 font-playfair-display">
            No {title}
          </h3>
          <p className="text-lg noir-text text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div
          className="w-full border-t border-dashed"
        />
        <p className="text-md text-muted-foreground italic noir-text">
          &ldquo;Every great case starts with a blank page.&rdquo;
        </p>
      </div>
    </div>
  );
};

export default NoProjectCard;
