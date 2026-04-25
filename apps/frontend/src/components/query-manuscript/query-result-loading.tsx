import React from 'react'
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


const QueryResultLoading = () => {
    return (
      <div className="flex min-h-55 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 px-4 py-8 text-center bg-primary">
        <div className="h-36 w-36">
          <DotLottieReact
            src="/lottie/search.lottie"
            autoplay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <p className="text-md tracking-wider text-background font-playfair-display">Searching...</p>
      </div>
    );
}

export default QueryResultLoading