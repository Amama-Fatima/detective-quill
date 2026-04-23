import re
from typing import List
from src.config import settings
from src.models.schemas import Entity, Relationship
from src.utils.logger import setup_logger
from neo4j import GraphDatabase


logger = setup_logger(__name__)

TYPE_LABEL_MAP = {
    "PERSON": "Character",
    "ORG":    "Organisation",
    "FAC":    "Location",
    "GPE":    "Location",
    "LOC":    "Location",
    "NORP":   "Group",
}
DEFAULT_LABEL = "Entity"


def _get_neo4j_driver():
    if not settings.NEO4J_URI or not settings.NEO4J_USERNAME or not settings.NEO4J_PASSWORD:
        raise ValueError("Missing Neo4j config. Set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD.")

    return GraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
    )


def _get_node_label(entity_type: str) -> str:
    return TYPE_LABEL_MAP.get(entity_type, DEFAULT_LABEL)


def _to_rel_type(relation_type: str) -> str:
    
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", "", relation_type)
    return "_".join(cleaned.upper().split())


def save_graph_layer5(
    scene_id: str,
    user_id: str,
    scene_text: str,
    resolved_text: str,
    entities: List[Entity],
    relationships: List[Relationship],
) -> dict:
    logger.info("=" * 60)
    logger.info("LAYER 5: Saving Knowledge Graph to Neo4j")
    logger.info("=" * 60)

    driver = _get_neo4j_driver()

    try:
        with driver.session() as session:
            session.execute_write(_create_scene, scene_id, user_id, scene_text, resolved_text)
            logger.info(f"Created Scene node: {scene_id}")

            for entity in entities:
                session.execute_write(_create_entity, entity, scene_id)
            logger.info(f"Created {len(entities)} entity nodes")

            created = 0
            for rel in relationships:
                session.execute_write(_create_relationship, rel, scene_id)
                created += 1
            logger.info(f"Created {created} relationship edges")

    except Exception as e:
        logger.error(f"Neo4j write failed: {e}")
        raise
    finally:
        driver.close()

    logger.info("Layer 5 complete")
    return {
        "entities_saved": len(entities),
        "relationships_saved": len(relationships),
    }


def _create_scene(tx, scene_id, user_id, scene_text, resolved_text):
    tx.run(
        """
        MERGE (s:Scene {scene_id: $scene_id})
        SET s.user_id       = $user_id,
            s.scene_text    = $scene_text,
            s.resolved_text = $resolved_text
        """,
        scene_id=scene_id,
        user_id=user_id,
        scene_text=scene_text,
        resolved_text=resolved_text,
    )


def _create_entity(tx, entity: Entity, scene_id: str):
    label = _get_node_label(entity.type)
    tx.run(
        f"""
        MERGE (e:{label} {{name: $name}})
        SET e.type        = $type,
            e.description = $description,
            e.role        = $role
        WITH e
        MATCH (s:Scene {{scene_id: $scene_id}})
        MERGE (e)-[r:APPEARS_IN]->(s)
        SET r.mentions = $mentions
        """,
        name=entity.name,
        type=entity.type,
        description=entity.attributes.get("description"),
        role=entity.attributes.get("role"),
        mentions=entity.mentions,
        scene_id=scene_id,
    )


def _create_relationship(tx, rel: Relationship, scene_id: str):
    rel_type = _to_rel_type(rel.relation_type)
    tx.run(
        f"""
        MATCH (a {{name: $source}})
        MATCH (b {{name: $target}})
        MERGE (a)-[r:{rel_type}]->(b)
        SET r.description = $description,
            r.confidence  = $confidence,
            r.scene_id    = $scene_id
        """,
        source=rel.source,
        target=rel.target,
        description=rel.description,
        confidence=rel.confidence,
        scene_id=scene_id,
    )


def get_scene_graph(scene_id: str) -> dict:
    """
    Retrieves the full graph for a scene — called by NestJS backend.
    Returns nodes and edges in a format ready for the frontend.
    """

    driver = _get_neo4j_driver()

    try:
        with driver.session() as session:
            result = session.execute_read(_fetch_scene_graph, scene_id)
        return result
    finally:
        driver.close()


def _fetch_scene_graph(tx, scene_id: str) -> dict:
    records = tx.run(
        """
        MATCH (e)-[r:APPEARS_IN]->(s:Scene {scene_id: $scene_id})
        OPTIONAL MATCH (e)-[rel]->(e2)
        WHERE NOT type(rel) = 'APPEARS_IN'
          AND (e2)-[:APPEARS_IN]->(s)
        RETURN 
            e.name        AS source_name,
            labels(e)[0]  AS source_label,
            e.role        AS source_role,
            e2.name       AS target_name,
            labels(e2)[0] AS target_label,
            type(rel)     AS rel_type,
            rel.description AS rel_description,
            rel.confidence  AS rel_confidence
        """,
        scene_id=scene_id,
    )

    nodes = {}
    edges = []

    for record in records:
        src = record["source_name"]
        if src and src not in nodes:
            nodes[src] = {
                "id":    src,
                "label": record["source_label"],
                "role":  record["source_role"],
            }

        tgt = record["target_name"]
        if tgt:
            if tgt not in nodes:
                nodes[tgt] = {
                    "id":    tgt,
                    "label": record["target_label"],
                    "role":  None,
                }
            edges.append({
                "source":      src,
                "target":      tgt,
                "type":        record["rel_type"],
                "description": record["rel_description"],
                "confidence":  record["rel_confidence"],
            })

    return {
        "nodes": list(nodes.values()),
        "edges": edges,
    }