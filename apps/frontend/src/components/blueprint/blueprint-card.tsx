// blueprint-card.tsx
"use client";

import { Blueprint } from "@detective-quill/shared-types/api";
import Link from "next/dist/client/link";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { getBlueprintTypeColor } from "@/lib/utils/blueprint-utils";
import { DeleteBlueprintButton } from "./btns/delete-blueprint-btn";

interface BlueprintCardProps {
  blueprint: Blueprint;
  projectId: string;
  isOwner: boolean;
  isActive: boolean;
  onDelete: (blueprintId: string) => Promise<void>;
  loading: boolean;
}

const BlueprintCard = ({
  blueprint,
  projectId,
  isOwner,
  isActive,
  onDelete,
  loading,
}: BlueprintCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Special+Elite&display=swap');

        .polaroid-card-wrap {
          position: relative;
          width: 150px;
          flex-shrink: 0;
        }

        .polaroid-card-inner {
          width: 150px;
          background: #f8f4ec;
          padding: 10px 10px 34px;
          border: 0.5px solid #d4c9a8;
          cursor: default;
          transform-origin: bottom center;
          box-shadow: 2px 4px 12px rgba(0,0,0,0.15);
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
          background: #3b2d29;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .polaroid-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.35;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E");
        }

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
          font-size: 13px;
          color: #2a2318;
          text-align: center;
          margin-top: 7px;
          line-height: 1.3;
          word-break: break-word;
        }

        .polaroid-label-title {
          font-weight: 600;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .polaroid-label-type {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Special Elite', monospace;
        }

        .polaroid-delete-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          z-index: 20;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .polaroid-card-wrap:hover .polaroid-delete-btn {
          opacity: 1;
        }
      `}</style>

      <div ref={cardRef} className="polaroid-card-wrap">
        {isVisible ? (
          <motion.div
            className="polaroid-card-inner"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              rotate: 0,
              y: -10,
              scale: 1.05,
              boxShadow: "4px 10px 24px rgba(0,0,0,0.30)",
              transition: { duration: 0.22, ease: "easeOut" },
            }}
            style={{ rotate: blueprint.id.charCodeAt(0) % 2 === 0 ? 2 : -2 }}
          >
            {/* Evidence strip — shows blueprint type */}
            <div className="polaroid-evidence-strip">{blueprint.type}</div>

            {/* Photo area with silhouette */}
            <Link
              href={`/workspace/${projectId}/blueprint/${blueprint.id}?type=${blueprint.type}`}
              className="block"
            >
              <div className="polaroid-photo">
                <div className="polaroid-silhouette">
                  <div className="sil-head" />
                  <div className="sil-body" />
                </div>
              </div>
            </Link>

            {/* Label area */}
            <div className="polaroid-label">
              <div className="polaroid-label-title">{blueprint.title}</div>
            </div>

            {/* Delete button — top-right, appears on hover */}
            {isOwner && isActive && (
              <div className="polaroid-delete-btn">
                <DeleteBlueprintButton
                  blueprintId={blueprint.id}
                  onDelete={onDelete}
                  loading={loading}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <div className="w-37.5 h-55 bg-muted/20 rounded animate-pulse" />
        )}
      </div>
    </>
  );
};

export default BlueprintCard;
