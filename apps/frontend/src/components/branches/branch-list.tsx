"use client";

import { BranchWithParent } from "@/lib/supabase-calls/branches";
import { useBranch } from "@/hooks/use-branch";
import BranchNode from "./branch-node";

type TreeNode = BranchWithParent & { children: TreeNode[] };

interface BranchListProps {
  projectId: string;
  branches: BranchWithParent[];
}

function buildTree(branches: BranchWithParent[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const b of branches) {
    map.set(b.id, { ...b, children: [] });
  }

  for (const b of branches) {
    const node = map.get(b.id)!;
    if (b.parent_branch_id && map.has(b.parent_branch_id)) {
      map.get(b.parent_branch_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function BranchTree({
  nodes,
  projectId,
  isSwitching,
  onSwitch,
  depth = 0,
  isLastSiblings = [],
}: {
  nodes: TreeNode[];
  projectId: string;
  isSwitching: boolean;
  onSwitch: (id: string) => void;
  depth?: number;
  isLastSiblings?: boolean[];
}) {
  return (
    <>
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        return (
          <div key={node.id} className="flex">
            {/* Ancestor continuation guides */}
            {isLastSiblings.map((ancestorIsLast, i) => (
              <div key={i} className="w-10 shrink-0 flex justify-center">
                {!ancestorIsLast && (
                  <div className="w-px h-full bg-border/40" />
                )}
              </div>
            ))}

            <div className="flex-1 min-w-0">
              <BranchNode
                branch={node}
                projectId={projectId}
                index={index}
                isLast={isLast && node.children.length === 0}
                isSwitching={isSwitching}
                onSwitch={onSwitch}
                depth={depth}
                hasChildren={node.children.length > 0}
              />
              {node.children.length > 0 && (
                <BranchTree
                  nodes={node.children}
                  projectId={projectId}
                  isSwitching={isSwitching}
                  onSwitch={onSwitch}
                  depth={depth + 1}
                  isLastSiblings={[...isLastSiblings, isLast]}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function BranchList({ projectId, branches }: BranchListProps) {
  const { switchBranchMutation } = useBranch({ projectId });
  const tree = buildTree(branches);

  return (
    <div className="pt-8">
      <div className="max-w-3xl">
        <BranchTree
          nodes={tree}
          projectId={projectId}
          isSwitching={switchBranchMutation.isPending}
          onSwitch={(id) => switchBranchMutation.mutate(id)}
        />
      </div>
    </div>
  );
}