"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { respondToInvitation } from "@/lib/backend-calls/invitations";
import { useAuth } from "@/context/auth-context";

interface AcceptRejectProjectProps {
  projectTitle: string;
  projectId: string;
  inviteCode: string;
}

const AcceptRejectProject = ({
  projectId,
  projectTitle,
  inviteCode,
}: AcceptRejectProjectProps) => {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const handleResponse = async (accepted: boolean) => {
    setLoading(true);
    try {
      // Call your API to accept or reject the invite
      await respondToInvitation(
        inviteCode,
        projectId,
        accepted ? "accept" : "reject",
        accessToken
      );

      toast.success(
        `You have ${
          accepted ? "accepted" : "rejected"
        } the invitation to join ${projectTitle}.`
      );
    } catch (error) {
      console.error("Error handling invite response:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h1 className="mystery-title">Accept or Reject Invitation</h1>
      <p>
        You have been invited as a{" "}
        <span className="case-file">Beta Reader</span> to the project{" "}
        <span className="case-file">{projectTitle}</span>
      </p>

      <div>
        <Button
          className="shadow-lg bg-primary hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
          onClick={() => handleResponse(true)}
        >
          Accept
        </Button>
        <Button
          className="shadow-lg bg-secondary hover:bg-secondary/90 cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
          onClick={() => handleResponse(false)}
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

export default AcceptRejectProject;
