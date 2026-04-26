import React from "react";

const NoMembers = () => {
  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
        <h4 className="font-playfair-display italic text-xl text-foreground">
          Members
        </h4>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border/60 py-16 text-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect
            x="1"
            y="7"
            width="17"
            height="26"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-muted-foreground/30"
          />
          <rect
            x="22"
            y="7"
            width="17"
            height="26"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-muted-foreground/30"
          />
          <line
            x1="20"
            y1="7"
            x2="20"
            y2="33"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-muted-foreground/30"
          />
        </svg>
        <p className="mystery-title text-xl text-muted-foreground">
          No persons on file
        </p>
        <p className="noir-text text-sm text-muted-foreground max-w-xs">
          No beta readers have been added yet. Invite collaborators to open
          their dossiers.
        </p>
      </div>
    </div>
  );
};

export default NoMembers;
