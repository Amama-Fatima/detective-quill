"use client";

import { motion } from "framer-motion";

const POLAROIDS = [
  {
    rotate: -6,
    y: 4,
    z: 1,
    // label: "Unknown Subject",
    evidence: "Suspect #002",
    delay: 0.1,
  },
  {
    rotate: 3,
    y: 2,
    z: 2,
    // label: "Unknown Subject",
    evidence: "Suspect #001",
    delay: 0.25,
  },
  {
    rotate: -1,
    y: 0,
    z: 3,
    // label: "Unknown Subject",
    evidence: "Suspect #003",
    delay: 0.4,
  },
];

export default function PolaroidStack({ Charname = "Suspect" }: { Charname?: string } = {}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Special+Elite&display=swap');

        .polaroid-wrap {
          position: relative;
          width: 150px;
          height: 195px;
          flex-shrink: 0;
        }

        .polaroid-card {
          position: absolute;
          inset: 0;
          width: 150px;
          background: #f8f4ec;
          padding: 10px 10px 34px;
          border: 0.5px solid #d4c9a8;
          cursor: default;
          transform-origin: bottom center;
        }

        .polaroid-evidence-strip {
          background: #1a1a1a;
          color: #f5f0e4;
          font-family: 'Special Elite', monospace;
          font-size: 7px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-align: center;
          padding: 3px 6px;
          margin-bottom: 8px;
        }

        .polaroid-photo {
          width: 100%;
          aspect-ratio: 1;
          background: #2a2318;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        /* Film grain texture overlay */
        .polaroid-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.35;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E");
        }

        /* CSS silhouette figure */
        .polaroid-silhouette {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .sil-head {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #1a1512;
          margin: 0 auto;
        }
        .sil-body {
          width: 58px;
          height: 44px;
          background: #1a1512;
          border-radius: 29px 29px 0 0;
          margin-top: -5px;
        }

        .polaroid-label {
          font-family: 'Caveat', cursive;
          font-size: 14px;
          color: #2a2318;
          text-align: center;
          margin-top: 7px;
          line-height: 1.2;
        }
      `}</style>

      <div className="polaroid-wrap" aria-hidden>
        {POLAROIDS.map((p, i) => (
          <motion.div
            key={i}
            className="polaroid-card"
            style={{ zIndex: p.z }}
            // Mount: fan in from a collapsed stack
            initial={{ opacity: 0, rotate: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, rotate: p.rotate, y: p.y, scale: 1 }}
            transition={{
              delay: p.delay,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            // Hover: lift forward, level out, cast deeper shadow
            whileHover={{
              rotate: 0,
              y: -14,
              scale: 1.05,
              zIndex: 10,
              boxShadow: "4px 10px 24px rgba(0,0,0,0.30)",
              transition: { duration: 0.22, ease: "easeOut" },
            }}
          >
            <div className="polaroid-evidence-strip">{p.evidence}</div>

            <div className="polaroid-photo">
              <div className="polaroid-silhouette">
                <div className="sil-head" />
                <div className="sil-body" />
              </div>
            </div>

            <div className="polaroid-label">{Charname}</div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
