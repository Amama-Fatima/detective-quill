"use client";

interface GraphErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function GraphLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background rounded-lg p-8 text-center">
      <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-serif">
        Loading graph visualization...
      </p>
    </div>
  );
}

export function GraphErrorFallback({ error, reset }: GraphErrorFallbackProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background rounded-lg p-8">
      <p className="text-sm tracking-widest uppercase mb-2 text-destructive font-serif">
        Failed to load graph
      </p>
      <p className="text-xs text-center max-w-sm text-muted-foreground font-mono mb-4">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-xs uppercase tracking-wider border border-border rounded hover:bg-muted transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
