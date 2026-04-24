GRAPH_CYPHER_EXAMPLES = [
    {
        "question": "Give me all interactions between Character A and Character B",
        "cypher": "MATCH (a:Character {name: 'Character A'})-[r]-(b:Character {name: 'Character B'}) RETURN a, r, b LIMIT 50",
    },
    {
        "question": "Which scenes mention Item X?",
        "cypher": "MATCH (i:Item {name: 'Item X'})-[:APPEARS_IN]->(s:Scene) RETURN s LIMIT 50",
    },
    {
        "question": "When did Character A appear in scenes with Location B?",
        "cypher": "MATCH (c:Character {name: 'Character A'})-[:APPEARS_IN]->(s:Scene)<-[:APPEARS_IN]-(l:Location {name: 'Location B'}) RETURN c, s, l LIMIT 50",
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
- All entities connect to Scene via APPEARS_IN.

Relationships:
- Relationships between entities are dynamic and extracted from text.
- Any verb or action may become a relationship type (e.g., KILLED, BETRAYED, ESCAPED_WITH, DISCOVERED, etc.)

Rules:
- Do NOT assume fixed relationship types.
- Use relationship types exactly as they appear in the graph.
- If unsure, use generic pattern (a)-[r]-(b)
- Always prioritize APPEARS_IN when connecting entities to Scene.
"""


CYPHER_PROMPT_TEMPLATE = """You are an expert Cypher query generator for a Neo4j Graph RAG system.

Your job is to convert natural language questions into valid Cypher queries.

---
GRAPH SCHEMA:
{schema}
---
GRAPH DESIGN RULES (VERY IMPORTANT):
1. This is a Scene-centric knowledge graph.
   - Scene is the central node.
   - All entities (Character, Location, Item) connect to Scene via:
     (Entity)-[:APPEARS_IN]->(Scene)

2. Relationships between entities are DYNAMIC.
   - Any verb/action may appear as a relationship type.
   - Examples: KILLED, BETRAYED, HELPED, ESCAPED_WITH, DISCOVERED, etc.
   - DO NOT assume fixed relationship lists.

3. There is NO predefined ontology of relationship types.
   - Use relationship types exactly as they appear in the graph.
   - If unknown, use generic pattern (a)-[r]-(b)
---

STRICT RULES:
1. Return ONLY ONE Cypher query.
2. Do NOT include explanations, markdown, or extra text.
3. Use ONLY read-only Cypher:
   MATCH, OPTIONAL MATCH, RETURN, WHERE, ORDER BY, LIMIT

4. NEVER use:
   CREATE, DELETE, MERGE, SET, REMOVE, DROP, CALL db.*, LOAD CSV

5. NEVER invent relationship types not present in the graph.

6. Prefer simple queries over complex ones.

7. Always include LIMIT {limit} unless sorting requires ordering first.

---

QUERY INTENT GUIDELINES:
- If question asks about interactions between characters:
  Use:
  (a:Character)-[r]-(b:Character)

- If question asks about events or what happened:
  Always consider Scene via:
  (Entity)-[:APPEARS_IN]->(Scene)

- If question asks “when” or timeline:
  Use r.when if available:
  ORDER BY r.when

- If question asks about items or mentions:
  Use generic traversal unless schema explicitly shows pattern.

---

SAFETY RULES:
- If unsure, prefer:
  MATCH (a)-[r]-(b)
- Do NOT hallucinate relationship names.
- Do NOT assume missing schema elements.
---

FEW-SHOT EXAMPLES:
{GRAPH_CYPHER_EXAMPLES_BLOCK}
---
USER QUESTION:
{question}

---
OUTPUT FORMAT:
Cypher:
"""