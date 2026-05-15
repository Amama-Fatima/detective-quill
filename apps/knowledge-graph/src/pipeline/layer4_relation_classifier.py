from typing import List, Dict, Any
from src.models.schemas import Relationship


_VIOLENCE_WORDS = {
    'stab', 'stabbed', 'murder', 'murdered', 'kill', 'killed', 'shot', 'shoot', 'slit', 'slain', 'beat'
}

_MARRIAGE_WORDS = {'marry', 'married', 'wedded'}

_SPEECH_WORDS = {'said', 'told', 'asked', 'replied', 'answered', 'shouted', 'yelled'}


def _classify_from_evidence(evidence: str) -> str:
    text = evidence.lower()
    for w in _VIOLENCE_WORDS:
        if w in text:
            return 'attack'
    for w in _MARRIAGE_WORDS:
        if w in text:
            return 'married'
    for w in _SPEECH_WORDS:
        if w in text:
            return 'talk_to'
    return 'related_to


def batched_classify(
    candidates: List[Dict[str, Any]],
    batch_size: int = 32,
) -> List[Relationship]:
    """Cheap, batched rule-based classifier for candidate pairs.

    This is intentionally lightweight and deterministic so it can be used as
    a fast first-pass before heavier LLM validation.
    """

    relationships: List[Relationship] = []

    for i in range(0, len(candidates), batch_size):
        batch = candidates[i:i+batch_size]
        for c in batch:
            rel_type = _classify_from_evidence(c.get('evidence', ''))
            relationships.append(Relationship(
                source=c['source'],
                target=c['target'],
                relation_type=rel_type,
                when=None,
            ))

    return relationships
