"""
Chunk scene text for the knowledge-graph pipeline.

- If text has ≤ single_chunk_max_words words, return it as one chunk (no split).
- If longer, split into chunks of ~words_per_chunk words at sentence boundaries,
  with sentence overlap so the last overlap_sentences of each chunk also start the next.
"""

import re
from typing import List


def chunk_text(
    text: str,
    single_chunk_max_words: int = 600,
    words_per_chunk: int = 300,
    overlap_sentences: int = 2,
) -> List[str]:
    """
    Split text into chunks only when it exceeds the single-chunk threshold.
    Otherwise return the whole text as one chunk.

    When splitting:
    - Chunks are ~words_per_chunk words, broken at sentence boundaries.
    - The last overlap_sentences sentences of each chunk are repeated at the
      start of the next chunk (sentence overlap) to preserve context at boundaries.

    Args:
        text: Full scene or document text.
        single_chunk_max_words: If word count ≤ this, return [text] (default 600).
        words_per_chunk: Target words per chunk when splitting (default 300).
        overlap_sentences: Number of sentences to carry over into the next chunk (default 2).

    Returns:
        List of chunk strings. If text is empty or whitespace-only, returns [""].
    """
    text = (text or "").strip()
    if not text:
        return [""]

    word_count = len(text.split())
    if word_count <= single_chunk_max_words:
        return [text]

    # Split into sentences: break on . ! ? followed by space or end, and on newlines.
    sentence_end = re.compile(r"(?<=[.!?])\s+|\n+")
    sentences = [s.strip() for s in sentence_end.split(text) if s.strip()]

    if not sentences:
        return [text]

    chunks: List[str] = []
    current: List[str] = []
    current_words = 0
    overlap = max(0, min(overlap_sentences, len(sentences) - 1))

    for sent in sentences:
        sent_words = len(sent.split())
        if current_words + sent_words > words_per_chunk and current:
            # Flush current chunk
            chunks.append(" ".join(current))
            # Start next chunk with the last `overlap` sentences for context
            if overlap > 0 and len(current) >= overlap:
                current = current[-overlap:]
                current_words = sum(len(s.split()) for s in current)
            else:
                current = []
                current_words = 0
        current.append(sent)
        current_words += sent_words

    if current:
        chunks.append(" ".join(current))

    return chunks if chunks else [text]
