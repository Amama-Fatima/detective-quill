"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Blueprint } from "@detective-quill/shared-types/api";
import { DeleteBlueprintButton } from "./btns/delete-blueprint-btn";
import PolaroidStyles from "./polaroid/polaroid-styles";
import PolaroidPhoto from "./polaroid/polaroid-photo";

interface BlueprintCardProps {
  blueprint: Blueprint;
  projectId: string;
  isOwner: boolean;
  isActive: boolean;
  onDelete: (blueprintId: string) => Promise<void>;
  loading: boolean;
}

export default function BlueprintCard({
  blueprint,
  projectId,
  isOwner,
  isActive,
  onDelete,
  loading,
}: BlueprintCardProps) {
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
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const rotate = blueprint.id.charCodeAt(0) % 2 === 0 ? 2 : -2;

  return (
    <>
      <PolaroidStyles />
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
            style={{ rotate }}
          >
            <div className="polaroid-evidence-strip">{blueprint.type}</div>

            <PolaroidPhoto
              type={blueprint.type}
              projectId={projectId}
              blueprintId={blueprint.id}
            />

            <div className="polaroid-label">
              <div className="polaroid-label-title">{blueprint.title}</div>
            </div>

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
          <div className="w-37.5 h-55 bg-muted/20 animate-pulse" />
        )}
      </div>
    </>
  );
}