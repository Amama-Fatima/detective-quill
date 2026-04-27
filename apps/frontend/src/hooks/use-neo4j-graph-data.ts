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
  
  // Get all entities that appear in this scene
  OPTIONAL MATCH (s)<-[:APPEARS_IN]-(entity)
  
  // Only match relationships where BOTH nodes appear in this scene
  OPTIONAL MATCH (entity)-[r]-(otherEntity)
  WHERE (otherEntity)-[:APPEARS_IN]->(s)
  
  // Return the scene, entities, and relationships
  RETURN s, entity, r, otherEntity
`,
          { sceneId: targetSceneId },
        );

        const nodeMap = new Map();
        const relMap = new Map();

        result.records.forEach((record) => {
          const n = record.get("node");
          const r = record.get("rel");
          const m = record.get("connected");

          if (n) {
            const nodeId = n.identity.toString();
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId,
                labels: n.labels,
                properties: n.properties,
                caption: n.properties.name || n.properties.scene_id || nodeId,
              });
            }
          }

          if (m) {
            const nodeId = m.identity.toString();
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId,
                labels: m.labels,
                properties: m.properties,
                caption: m.properties.name || m.properties.scene_id || nodeId,
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
