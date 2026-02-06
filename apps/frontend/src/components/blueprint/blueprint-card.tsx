"use client";

import { Blueprint } from "@detective-quill/shared-types/api";
import Link from "next/dist/client/link";
import React, { useState, useRef, useEffect } from "react";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
    <div ref={cardRef}>
      {isVisible ? (
        <Card className="group hover:shadow-lg hover:-translate-y-2 transition-all duration-200 relative">
          <CardHeader className="pb-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center ">
                  <Link
                    href={`/workspace/${projectId}/blueprint/${blueprint.id}?type=${blueprint.type}`}
                    className="block w-full"
                  >
                    <CardTitle className="text-lg font-semibold transition-colors line-clamp-1">
                      {blueprint.title}
                    </CardTitle>
                  </Link>
                  {isOwner && isActive && (
                    <DeleteBlueprintButton
                      blueprintId={blueprint.id}
                      onDelete={onDelete}
                      loading={loading}
                    />
                  )}{" "}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`${getBlueprintTypeColor(
                blueprint.type,
              )} flex justify-items-center align-middle gap-2 items-center`}
            >
              <>
                <Tag />
                <p className="case-file text-lg font-medium">
                  {blueprint.type}
                </p>
              </>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="h-[180px] bg-muted/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
};

export default BlueprintCard;
