// hooks/useNeo4jGraphData.ts
import { useState, useEffect } from "react";
import neo4j from "neo4j-driver";

interface Node {
  id: string;
  labels: string[];
  properties: Record<string, any>;
  caption?: string;
  color?: string;
  size?: number;
}

interface Relationship {
  id: string;
  type: string;
  from: string;
  to: string;
  properties: Record<string, any>;
  caption?: string;
}

export function useNeo4jGraphData(sceneId?: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGraphData() {
      const targetSceneId = sceneId || "test-graph-001";

      const driver = neo4j.driver(
        process.env.NEXT_PUBLIC_NEO4J_BOLT_URL!,
        neo4j.auth.basic(
          process.env.NEXT_PUBLIC_NEO4J_USER!,
          process.env.NEXT_PUBLIC_NEO4J_PASSWORD!,
        ),
      );

      const session = driver.session();

      try {
        const sceneResult = await session.run(
          `
          MATCH (s:Scene {scene_id: $sceneId})
          RETURN s
        `,
          { sceneId: targetSceneId },
        );

        if (sceneResult.records.length === 0) {
          setError(`No scene found with ID: ${targetSceneId}`);
          setLoading(false);
          return;
        }
        const result = await session.run(
          `
MATCH (s:Scene {scene_id: $sceneId})
OPTIONAL MATCH (s)<-[:APPEARS_IN]-(entity)
OPTIONAL MATCH (entity)-[r]-(otherEntity)
WHERE (otherEntity)-[:APPEARS_IN]->(s)
RETURN s, entity, otherEntity, r
`,
          { sceneId: targetSceneId },
        );

        const nodeMap = new Map();
        const relMap = new Map();

        result.records.forEach((record) => {
          const s = record.get("s");
          const entity = record.get("entity");
          const otherEntity = record.get("otherEntity");
          const r = record.get("r");

          if (s) {
            const nodeId = s.identity.toString();
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId,
                labels: s.labels,
                properties: s.properties,
                caption: s.properties.name || s.properties.scene_id || nodeId,
              });
            }
          }

          if (entity) {
            const nodeId = entity.identity.toString();
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId,
                labels: entity.labels,
                properties: entity.properties,
                caption: entity.properties.name || entity.properties.scene_id || nodeId,
              });
            }
          }

          if (otherEntity) {
            const nodeId = otherEntity.identity.toString();
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId,
                labels: otherEntity.labels,
                properties: otherEntity.properties,
                caption: otherEntity.properties.name || otherEntity.properties.scene_id || nodeId,
              });
            }
          }

          if (r) {
            const relId = r.identity.toString();
            if (!relMap.has(relId)) {
              relMap.set(relId, {
                id: relId,
                type: r.type,
                from: r.start.toString(),
                to: r.end.toString(),
                properties: r.properties,
                caption: r.type.replace(/_/g, " ").toLowerCase(),
              });
            }
          }
        });

        setNodes(Array.from(nodeMap.values()));
        setRelationships(Array.from(relMap.values()));
        setLoading(false);
      } catch (err: any) {
        console.error("Neo4j query error:", err);
        setError(err.message);
        setLoading(false);
      } finally {
        await session.close();
        await driver.close();
      }
    }

    fetchGraphData();
  }, [sceneId]);

  return { nodes, relationships, loading, error };
}
