import NodeDetails from "@/components/knowledge-graph/node-details";
import { DetailsContent } from "@/hooks/use-graph-interaction";

interface GraphDetailsPanelProps {
  content: DetailsContent;
  onClose: () => void;
}

export function GraphDetailsPanel({
  content,
  onClose,
}: GraphDetailsPanelProps) {
  return (
    <div className="absolute bottom-15 right-4 max-w-xs rounded-md bg-card/95 border border-border backdrop-blur-sm shadow-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-serif text-foreground">
          {content.type === "node" ? "Node Details" : "Relationship Details"}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {content.type === "node" ? (
        <div className="space-y-2">
          <NodeDetails
            content={{
              data: content.data,
              properties: content.properties ?? {},
              labels: content.labels,
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground">Type:</span> {content.relType}
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground">From:</span> {content.data.from}
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground">To:</span> {content.data.to}
          </p>
          {content.properties?.when != null && (
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground">When:</span>{" "}
              {String(content.properties.when)}
            </p>
          )}
          {/* <div className="pt-2 border-t border-border">
            {Object.entries(content.properties || {}).map(
              ([key, value]) =>
                key !== "when" && (
                  <p
                    key={key}
                    className="text-xs font-mono text-muted-foreground break-all"
                  >
                    <span className="text-foreground">{key}:</span>{" "}
                    {String(value)}
                  </p>
                ),
            )}
          </div> */}
        </div>
      )}
    </div>
  );
}
