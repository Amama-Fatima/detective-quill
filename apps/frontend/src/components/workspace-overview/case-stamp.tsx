"use client";

import {
  Branch,
  Project,
  ProjectMember,
  Invitation,
} from "@detective-quill/shared-types";
import { formatDate } from "date-fns";

interface CaseStampProps {
  project: Project;
  members: ProjectMember[] | [];
  invitations: Invitation[] | [];
  numBranches: number;
  activeBranch: Branch | null;
  className?: string;
}

export default function CaseStamp({
  project,
  members,
  invitations,
  numBranches,
  activeBranch,
  className,
}: CaseStampProps) {
  const statusLabel =
    project.status.charAt(0).toUpperCase() + project.status.slice(1);

  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "N/A";

  const currentBranchLabel = activeBranch?.name ?? "No active branch";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

        .case-stamp {
          position: relative;
          width: 230px;
          flex-shrink: 0;
          align-self: flex-start;
          font-family: 'Courier Prime', 'Courier New', monospace;
          color: #8B1A1A;
          border: 2.5px solid #8B1A1A;
          padding: 16px 18px;
          transform: rotate(-3deg);
          opacity: 0.9;
          background: transparent;
        }
        .case-stamp::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1.5px solid #8B1A1A;
          pointer-events: none;
        }
        .case-stamp::after {
          content: '';
          position: absolute;
          inset: 7px;
          border: 0.5px solid #8B1A1A;
          opacity: 0.35;
          pointer-events: none;
        }
        .case-stamp__header {
          font-size: 8px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          text-align: center;
          border-bottom: 1px solid #8B1A1A;
          padding-bottom: 7px;
          margin-bottom: 10px;
          opacity: 0.65;
        }
        .case-stamp__status {
          font-family: 'Special Elite', serif;
          font-size: 22px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          line-height: 1;
          margin-bottom: 11px;
        }
        .case-stamp__divider {
          border: none;
          border-top: 1px solid #8B1A1A;
          margin: 8px 0;
          opacity: 0.35;
        }
        .case-stamp__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 2.5px 0;
        }
        .case-stamp__label {
          font-size: 8px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.58;
        }
        .case-stamp__value {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .case-stamp__branch {
          text-align: center;
          font-size: 8px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #8B1A1A;
          opacity: 0.72;
          word-break: break-all;
          line-height: 1.5;
        }
        .case-stamp__branch-label {
          display: block;
          font-size: 7px;
          letter-spacing: 0.22em;
          opacity: 0.55;
          margin-bottom: 2px;
        }
        .case-stamp__footer {
          text-align: center;
          font-size: 7px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-top: 10px;
          opacity: 0.4;
          border-top: 1px solid #8B1A1A;
          padding-top: 7px;
        }
        .case-stamp__corner {
          position: absolute;
          font-size: 6px;
          opacity: 0.35;
        }
        .case-stamp__corner--tl { top: 12px; left: 12px; }
        .case-stamp__corner--tr { top: 12px; right: 12px; }
        .case-stamp__corner--bl { bottom: 12px; left: 12px; }
        .case-stamp__corner--br { bottom: 12px; right: 12px; }
      `}</style>

      <div
        className={`case-stamp ${className ?? ""}`}
        aria-label="Case file stamp"
      >
        <span className="case-stamp__corner case-stamp__corner--tl">★</span>
        <span className="case-stamp__corner case-stamp__corner--tr">★</span>
        <span className="case-stamp__corner case-stamp__corner--bl">★</span>
        <span className="case-stamp__corner case-stamp__corner--br">★</span>

        <div className="case-stamp__header">Detective Quill — Case File</div>
        <div className="case-stamp__status">{statusLabel}</div>

        <hr className="case-stamp__divider" />

        <div className="case-stamp__row">
          <span className="case-stamp__label">Members</span>
          <span className="case-stamp__value">{members.length}</span>
        </div>
        <div className="case-stamp__row">
          <span className="case-stamp__label">Pending Invites</span>
          <span className="case-stamp__value">{invitations.length}</span>
        </div>
        <div className="case-stamp__row">
          <span className="case-stamp__label">Branches</span>
          <span className="case-stamp__value">{numBranches}</span>
        </div>
        <div className="case-stamp__row">
          <span className="case-stamp__label">Updated</span>
          <span className="case-stamp__value">{formattedUpdatedAt}</span>
        </div>

        <div className="case-stamp__branch">
          <span className="case-stamp__branch-label">Current Branch</span>
          {currentBranchLabel}
        </div>

        <div className="case-stamp__footer">Classified — Author Eyes Only</div>
      </div>
    </>
  );
}
