GRAPH_CYPHER_EXAMPLES = [
    {
        "question": "Give me all interactions between Character A and Character B",
        "cypher": "MATCH (a:Character {name: 'Character A'})-[r:INTERACTED_WITH]-(b:Character {name: 'Character B'}) RETURN a, r, b LIMIT 50",
    },
    {
        "question": "Which files mention Item X?",
        "cypher": "MATCH (f:File)-[:MENTIONS]->(i:Item {name: 'Item X'}) RETURN f LIMIT 50",
    },
    {
        "question": "When did Character A visit Location B?",
        "cypher": "MATCH (c:Character {name: 'Character A'})-[r:VISITED]->(l:Location {name: 'Location B'}) RETURN c, r, l ORDER BY r.timestamp DESC LIMIT 50",
    },
]

GRAPH_CYPHER_EXAMPLES_BLOCK = "\n\n".join(
    f"Question: {example['question']}\nCypher: {example['cypher']}"
    for example in GRAPH_CYPHER_EXAMPLES
)

CYPHER_PROMPT_TEMPLATE = f"""You are an expert Neo4j Cypher generator for a Graph RAG system.

Graph schema:
{{schema}}

Strict rules:
- Return ONLY one Cypher query.
- Use read-only clauses only: MATCH, OPTIONAL MATCH, WHERE, WITH, RETURN, ORDER BY, SKIP, LIMIT.
- Do NOT use CREATE, DELETE, MERGE, SET, REMOVE, DROP, DETACH, CALL db.* or any write/update operation.
- Prefer precise labels, relationship types, and property filters from the schema.
- Add LIMIT when the result set could be large.
- Do not explain your answer.

Few-shot examples:
{GRAPH_CYPHER_EXAMPLES_BLOCK}

Question: {{question}}
Cypher:"""
