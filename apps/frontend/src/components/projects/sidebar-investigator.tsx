import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SidebarInvestigator() {
  return (
    <aside className="hidden lg:flex flex-col items-center gap-4 w-50 shrink-0 sticky top-10 self-start">
      <div className="w-45 h-45">
        <DotLottieReact src="/Mr Detective.lottie" loop autoplay />
      </div>
      <div className="w-full border-t border-border pt-4">
        <p className="case-file text-[10px] text-muted-foreground tracking-[0.12em] text-center leading-relaxed">
          ACTIVE INVESTIGATOR
        </p>
        <p className="noir-text text-xs text-center text-muted-foreground mt-1 italic">
          &ldquo;Every story starts
          <br />
          with a single clue.&rdquo;
        </p>
      </div>
    </aside>
  );
}