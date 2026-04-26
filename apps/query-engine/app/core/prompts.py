GRAPH_CYPHER_EXAMPLES = [
        {
            "question": "Find all interactions between Character A and Character B",
            "cypher": (
                f"MATCH (a:Character {{name: 'Character A'}})-[r]-(b:Character {{name: 'Character B'}}) "
                f"OPTIONAL MATCH (a)-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(b) "
                f"RETURN a.name AS a, type(r) AS relationship, b.name AS b, collect(s.scene_id) AS scene_ids "
                f"LIMIT 20"
            ),
        },
        {
            "question": "What did Character A do to Character B?",
            "cypher": (
                f"MATCH (a:Character {{name: 'Character A'}})-[r]-(b:Character {{name: 'Character B'}}) "
                f"OPTIONAL MATCH (a)-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(b) "
                f"RETURN a.name AS a, type(r) AS relationship, b.name AS b, collect(s.scene_id) AS scene_ids "
                f"LIMIT 20"
            ),
        },
        {
            "question": "In which scene do Character A and Character B first interact?",
            "cypher": (
                f"MATCH (a:Character {{name: 'Character A'}})-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(b:Character {{name: 'Character B'}}) "
                f"RETURN s.scene_id AS scene_id, s.scene_text AS scene_text "
                f"LIMIT 20"
            ),
        },
        {
            "question": "Which scenes do Character A and Character B share?",
            "cypher": (
                f"MATCH (a:Character {{name: 'Character A'}})-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(b:Character {{name: 'Character B'}}) "
                f"RETURN s.scene_id AS scene_id, s.scene_text AS scene_text "
                f"LIMIT 20"
            ),
        },
        {
            "question": "Which scenes mention Item X?",
            "cypher": (
                f"MATCH (i:Item {{name: 'Item X'}})-[:APPEARS_IN]->(s:Scene) "
                f"RETURN s.scene_id AS scene_id, s.scene_text AS scene_text "
                f"LIMIT 20"
            ),
        },
        {
            "question": "When did Character A appear in scenes with Location B?",
            "cypher": (
                f"MATCH (c:Character {{name: 'Character A'}})-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(l:Location {{name: 'Location B'}}) "
                f"RETURN c.name AS character, l.name AS location, collect(s.scene_id) AS scene_ids "
                f"LIMIT 20"
            ),
        },
        {
            "question": "Which characters appear in scenes with Location X?",
            "cypher": (
                f"MATCH (c:Character)-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(l:Location {{name: 'Location X'}}) "
                f"RETURN c.name AS character, collect(s.scene_id) AS scene_ids "
                f"LIMIT 20"
            ),
        },
        {
            "question": "Who is Character A?",
            "cypher": (
                f"MATCH (c:Character {{name: 'Character A'}}) "
                f"OPTIONAL MATCH (c)-[:APPEARS_IN]->(s:Scene) "
                f"RETURN c.name AS name, c.role AS role, c.type AS type, collect(s.scene_id) AS scene_ids "
                f"LIMIT 20"
            ),
        },
]

GRAPH_CYPHER_EXAMPLES_BLOCK = "\n\n".join(
    f"Question: {example['question']}\nCypher: {example['cypher']}"
    for example in GRAPH_CYPHER_EXAMPLES
)


GRAPH_SCHEMA_TEXT = """
Node labels:
- Character(name, type, role)
- Location(name)
- Item(name)
- Scene(scene_id, scene_text)

Core structure:
- Scene is the central node.
- All entities connect to Scene via: (Entity)-[:APPEARS_IN]->(Scene)

Entity-to-entity relationships:
- Relationships between entities are dynamic (e.g., KILLED, BETRAYED, ESCAPED_WITH, DISCOVERED).
- NEVER assume fixed relationship types — use them exactly as they appear in the graph.
- When relationship type is unknown, use the generic pattern: (a)-[r]-(b)
- Always return type(r) AS relationship when fetching entity-to-entity relationships.
"""

CONTEXT_USAGE_INSTRUCTIONS = """
CONTEXT USAGE:\n"
    "- Use ENTITY RELATIONSHIP CONTEXT only as grounding hints.\n"
    "- When ENTITY RELATIONSHIP CONTEXT is provided, use the exact relation_type words and directions from the context in Cypher.\n"
    "- Never invent relationships that are not present in the graph.\n"
    "- Prefer relationship directions/types present in context when relevant to the user question.
"""


CYPHER_PROMPT_TEMPLATE = """You are an expert Cypher query generator for a Neo4j Graph RAG system.
Convert the user question into a single valid Cypher query.
 
GRAPH SCHEMA:
{schema}
 
RULES:
1. Output ONLY the Cypher query — no explanations, no markdown, no extra text.
2. Use ONLY: MATCH, OPTIONAL MATCH, RETURN, WHERE, ORDER BY, LIMIT
3. NEVER use: CREATE, DELETE, MERGE, SET, REMOVE, DROP, CALL db.*, LOAD CSV
4. NEVER invent relationship types. When unknown, use (a)-[r]-(b).
5. For interaction/relationship questions between two entities:
   - Use: MATCH (a)-[r]-(b) to capture the relationship
   - Always return type(r) AS relationship in the RETURN clause
   - Use OPTIONAL MATCH to also fetch shared scenes
6. For "first", "earliest", or "initial" scene questions between two entities:
   - Do NOT fetch relationships — use only APPEARS_IN to find shared scenes
   - Return each scene individually (scene_id, scene_text) so the caller can sort them
   - Do NOT use collect() — return one row per scene
7. Always include scene_id(s) in RETURN:
   - Shared scenes (individual rows): s.scene_id AS scene_id
   - Aggregated: collect(s.scene_id) AS scene_ids
8. Always end with LIMIT {limit}. Use exactly {limit}, not any other number.
9. Return named fields (e.g. c.name AS name) rather than whole nodes where possible.

SCENE SCOPE CONSTRAINT:
{scene_scope_instructions}

{entity_relationship_context_block}

{context_usage_block}
 
FEW-SHOT EXAMPLES:
{examples_block}
 
USER QUESTION:
{question}
 
MATCH"""

ANSWER_PROMPT_TEMPLATE = """You are an expert assistant analyzing entities and relationships in a narrative work.

Your task: answer the user's question using ONLY the structured data below, then return a single valid JSON object.

ENTITIES:
{entities_text}

RELATIONSHIPS:
{relationships_text}

USER QUESTION:
{question}

INSTRUCTIONS:
1. Base your answer strictly on the entities and relationships above. Do not infer, assume, or hallucinate anything not explicitly stated.
2. If the data is insufficient to answer, set "answer" to: "This information is not available in the current context."
3. Keep "answer" to one direct, concise sentence.
4. "supporting_job_ids": include only job_ids that directly evidence the answer. If none apply, return [].
5. "exact_entities": include only entity names explicitly present in the context that support the answer. Do not rename or paraphrase.
6. "exact_relationships": include only relationship types explicitly present in the context that support the answer. Do not rename or paraphrase.
7. For questions about interactions between multiple entities, only include a job_id if ALL entities and the relevant relationship are present in that job.

Return ONLY a valid JSON object — no explanation, no markdown, no preamble:

{{
  "answer": "<one sentence>",
  "supporting_job_ids": ["<job_id>"],
  "exact_entities": ["<entity_name>"],
  "exact_relationships": ["<relationship_type>"]
}}"""