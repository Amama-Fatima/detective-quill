import re


def extract_cypher(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"```(?:cypher)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()

    match = re.search(r"\bOPTIONAL\s+MATCH\b|\bMATCH\b", cleaned, flags=re.IGNORECASE)
    if match:
        cleaned = cleaned[match.start() :].strip()

    cleaned = re.split(r"\n\s*\n", cleaned, maxsplit=1)[0].strip()

    if ";" in cleaned:
        cleaned = cleaned.split(";", maxsplit=1)[0].strip()

    return cleaned


def ensure_limit_clause(cypher: str, limit: int) -> str:
    cleaned = cypher.strip().rstrip(";").strip()

    if re.search(r"\bLIMIT\s+\d+\s*$", cleaned, flags=re.IGNORECASE):
        return cleaned

    return f"{cleaned} LIMIT {limit}"
