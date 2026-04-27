"use client";

import React, { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { respondToInvitation } from "@/lib/backend-calls/invitations";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface AcceptRejectProjectProps {
  projectTitle: string;
  projectId: string;
  code: string;
}

export default function AcceptRejectProject({
  projectId,
  projectTitle,
  code,
}: AcceptRejectProjectProps) {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const router = useRouter();

  useEffect(() => {
    console.log("AcceptRejectProject mounted with props:");
  }, []);

  const handleResponse = async (accepted: boolean) => {
    setLoading(true);
    try {
      await respondToInvitation(
        code,
        projectId,
        accepted ? "accept" : "reject",
        accessToken,
      );

      toast.success(
        `You have ${
          accepted ? "accepted" : "rejected"
        } the invitation to join ${projectTitle}.`,
      );
      if (accepted) {
        // Redirect to project workspace
        router.push(`/workspace/${projectId}`);
      }
    } catch (error) {
      console.error("Error handling invite response:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-[75vh] p-4">
      <div>
        <div className="flex justify-center mb-4">
          <div className="h-36 w-36">
            <DotLottieReact
              src="/lottie/invite.lottie"
              autoplay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
        <h1 className="mystery-title text-center mb-3">
          Respond To Invitation
        </h1>
        <p className="text-[1.4rem] text-primary">
          You have been invited as a{" "}
          <span className="font-playfair-display italic">Beta Reader</span> to
          the project{" "}
          <span className="font-playfair-display italic">{projectTitle}</span>
        </p>
        <div className="flex justify-around mt-6 gap-4">
          <Button
            className="shadow-lg bg-primary hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed hover:scale-105 transition-transform disabled:hover:scale-100"
            disabled={loading}
            onClick={() => handleResponse(true)}
          >
            Accept
          </Button>
          <Button
            className="shadow-lg text-primary bg-accent hover:bg-accent cursor-pointer disabled:cursor-not-allowed hover:scale-105 transition-transform disabled:hover:scale-100"
            disabled={loading}
            onClick={() => handleResponse(false)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
