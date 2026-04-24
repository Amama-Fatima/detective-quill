from enum import Enum


class QueryClassifier(str, Enum):
    INTERACTION = "interaction"
    TIMELINE = "timeline"
    FILE = "file"
    GENERAL = "general"


INTERACTION_KEYWORDS = [
    "interact", "relationship", "fight", "kill", "help",
    "serve", "threaten", "meet", "talk"
]

TIMELINE_KEYWORDS = [
    "when", "timestamp", "order", "before", "after", "timeline",
    "history", "sequence"
]

FILE_KEYWORDS = [
    "file", "scene", "document", "mention", "appear", "where"
]


def detect_query_type(question: str) -> QueryClassifier:
    q = question.lower()

    if any(k in q for k in INTERACTION_KEYWORDS):
        return QueryClassifier.INTERACTION

    if any(k in q for k in TIMELINE_KEYWORDS):
        return QueryClassifier.TIMELINE

    if any(k in q for k in FILE_KEYWORDS):
        return QueryClassifier.FILE

    return QueryClassifier.GENERAL