import re

READ_ONLY_PREFIXES = (
    "MATCH",
    "OPTIONAL MATCH",
    "WITH",
    "UNWIND",
)
BLOCKED_KEYWORDS = (
    "CREATE",
    "DELETE",
    "MERGE",
    "SET",
    "REMOVE",
    "DROP",
    "DETACH",
)


def validate_cypher_query(cypher: str) -> None:
    cleaned = re.sub(r"\s+", " ", cypher).strip().upper()

    if not cleaned.startswith(READ_ONLY_PREFIXES):
        raise ValueError("Only read-only Cypher queries are allowed")

    if any(keyword in cleaned for keyword in BLOCKED_KEYWORDS):
        raise ValueError("Unsafe Cypher query detected")

    if ";" in cypher.strip().rstrip(";"):
        raise ValueError("Multiple Cypher statements are not allowed")
