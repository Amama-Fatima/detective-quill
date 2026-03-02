export const OilLampIcon = () => (
  <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
    {/* Flame glow */}
    <ellipse
      cx="32"
      cy="14"
      rx="6"
      ry="8"
      fill="oklch(68% 0.10 78)"
      opacity="0.25"
    />
    {/* Flame */}
    <path
      d="M32 6C32 6 27 12 28 17C28.8 20.5 32 21 32 21C32 21 35.2 20.5 36 17C37 12 32 6 32 6Z"
      fill="oklch(68% 0.10 78)"
      opacity="0.85"
    />
    <path
      d="M32 10C32 10 30 14 30.5 17C31 19.5 32 20 32 20C32 20 33 19.5 33.5 17C34 14 32 10 32 10Z"
      fill="oklch(85% 0.08 78)"
      opacity="0.9"
    />
    {/* Wick */}
    <rect
      x="31"
      y="20"
      width="2"
      height="4"
      rx="1"
      fill="oklch(40% 0.018 240)"
    />
    {/* Lamp neck */}
    <path d="M27 24H37V26H27V24Z" fill="oklch(60% 0.018 240)" />
    {/* Lamp body */}
    <path
      d="M22 26C22 26 20 28 20 34C20 42 24 46 28 48H36C40 46 44 42 44 34C44 28 42 26 42 26H22Z"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.5"
      fill="oklch(88% 0.022 245)"
    />
    {/* Oil fill line */}
    <path
      d="M22 36C22 36 24 38 32 38C40 38 42 36 42 36"
      stroke="oklch(68% 0.10 78)"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
    {/* Base */}
    <path
      d="M25 48H39V50C39 51.1 38.1 52 37 52H27C25.9 52 25 51.1 25 50V48Z"
      fill="oklch(60% 0.018 240)"
    />
    <rect
      x="22"
      y="52"
      width="20"
      height="3"
      rx="1.5"
      fill="oklch(50% 0.018 240)"
    />
    <rect
      x="19"
      y="55"
      width="26"
      height="3"
      rx="1.5"
      fill="oklch(40% 0.018 240)"
    />
    {/* Handle */}
    <path
      d="M44 32C44 32 50 32 50 38C50 44 44 44 44 44"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
