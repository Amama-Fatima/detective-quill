import {CaseFileIcon} from "@/components/icons/case-file-icon"

const BlueprintWidget = () => {
  return (
    <div className="space-y-2 noirt-text">
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Character
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          Location
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
          Item
        </span>
      </div>

      <div className="relative min-h-50 w-full overflow-hidden rounded-lg border border-border bg-card">
        <svg className="absolute inset-0 h-full w-full opacity-20 text-border">
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i}>
              <line
                x1={`${i * 12.5}%`}
                y1="0"
                x2={`${i * 12.5}%`}
                y2="100%"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1={`${i * 12.5}%`}
                x2="100%"
                y2={`${i * 12.5}%`}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center p-3">
          <div className="group relative w-full max-w-50 h-40 rounded-xl border-2 border-muted-foreground bg-drag-card shadow-sm">
            <div className="flex items-center justify-between p-3 pb-2">
              <div className="flex items-center gap-2">
                <CaseFileIcon className="h-5 w-5" />
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[14px] font-medium text-secondary-foreground">
                  Inspector Marlowe
                </span>
              </div>
            </div>

            <div className="px-3 pb-3">
              <div className="min-h-25 rounded-lg border border-border bg-muted p-2 text-[12px] text-muted-foreground">
                Motive notes, personality, and other character details.
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default BlueprintWidget;
