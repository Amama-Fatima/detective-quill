"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function BookLoadingAnimation() {
  return (
    <DotLottieReact
      src="/lottie/book.lottie"
      autoplay
      loop
      style={{ width: "100%", height: "100%" }}
    />
  );
}
