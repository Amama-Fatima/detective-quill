from typing import List, Dict, Any
from src.models.schemas import Entity


def generate_candidate_pairs(
    entities: List[Entity],
    resolved_text: str,
    nlp,
    window_sentences: int = 0,
) -> List[Dict[str, Any]]:
    """Generate candidate entity pairs with a supporting evidence sentence.

    - entities: list of `Entity` (must have `mentions` populated)
    - resolved_text: the scene text (preferably coref-resolved)
    - nlp: spaCy NLP instance to split sentences
    - window_sentences: how many neighboring sentences to include (0 = same sentence only)

    Returns list of dicts: {"source": name, "target": name, "evidence": sentence_text}
    """

    if not entities:
        return []

    doc = nlp(resolved_text)

    # Map char index ranges to sentence index
    sent_bounds = [(sent.start_char, sent.end_char, sent) for sent in doc.sents]

    def sent_idx_for_span(start: int, end: int):
        for i, (s0, s1, _) in enumerate(sent_bounds):
            if start >= s0 and end <= s1:
                return i
        return None

    # Build mapping from entity name to sentence indices where it appears
    entity_sentence_map = {}
    for e in entities:
        indices = set()
        for m in e.mentions:
            # naive search for mention inside text
            try:
                off = resolved_text.index(m)
            except ValueError:
                continue
            idx = sent_idx_for_span(off, off + len(m))
            if idx is not None:
                indices.add(idx)
        if indices:
            entity_sentence_map[e.name] = sorted(indices)

    candidates = []

    names = list(entity_sentence_map.keys())
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            a = names[i]
            b = names[j]
            # check if they appear in the same or neighboring sentences
            sent_idxs_a = entity_sentence_map.get(a, [])
            sent_idxs_b = entity_sentence_map.get(b, [])
            found = False
            evidence = None
            for ia in sent_idxs_a:
                for ib in sent_idxs_b:
                    if abs(ia - ib) <= window_sentences:
                        # choose the earlier sentence as evidence
                        idx = min(ia, ib)
                        evidence = sent_bounds[idx][2].text
                        found = True
                        break
                if found:
                    break

            if found and evidence:
                candidates.append({"source": a, "target": b, "evidence": evidence})

    return candidates
