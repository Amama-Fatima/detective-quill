import {Search} from "lucide-react"

const SearchWidget = () => (
  <div
    className="w-full rounded-lg border overflow-hidden bg-card"
 
  >
    <div
      className="flex items-center gap-2 px-2.5 py-2 text-background bg-primary"
    
    >
      <Search className="w-4 h-4 mr-2 "/>
      <span
        className="text-[13px]"
      >
        &ldquo;Sherlock in London&rdquo;
      </span>
    </div>
    {[
      { ch: "Ch. 3", text: "…found the vial of Sherlock near…", hi: "Sherlock" },
      { ch: "Ch. 7", text: "…London in the autumn of 1921…", hi: "London" },
      { ch: "Ch. 11", text: "…the Sherlock had been", hi: "Sherlock" },
      { ch: "Ch. 11", text: "…the Sherlock investigated…", hi: "Sherlock" },


    ].map((r, i) => (
      <div
        key={i}
        className="flex gap-2 items-center px-2.5 py-1.5 border-b last:border-0"
      >
        <span
          className="text-[13px] mt-0.5 shrink-0 px-1 py-0.5 rounded bg-accent noir-text text-muted-foreground"
        
        >
          {r.ch}
        </span>
        <span
          className="text-[13px] leading-relaxed noir-text text-foreground"
          
        >
          {r.text.split(r.hi).map((part, j, arr) => (
            <span key={j}>
              {part}
              {j < arr.length - 1 && (
                <mark
                  
                  className="p-[2px] bg-chart-3 text-background"
                >
                  {r.hi}
                </mark>
              )}
            </span>
          ))}
        </span>
      </div>
    ))}
  </div>
);

export default SearchWidget;
