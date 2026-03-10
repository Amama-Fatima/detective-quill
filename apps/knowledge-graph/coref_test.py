import modal

app = modal.App("coref-test")

image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(["numpy<2.0"])
    .pip_install([
        "torch==2.6.0",
        "transformers==4.46.3",   # ← last version before the breaking API change
        "fastcoref==2.1.6",
    ])
    .pip_install(["spacy==3.5.4"])
    .pip_install([
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_lg-3.5.0/en_core_web_lg-3.5.0-py3-none-any.whl"
    ])
)

@app.function(image=image, gpu="T4", timeout=300)
def test_coref():
    from fastcoref import FCoref
    import spacy
    import re

    # ── Load models ──────────────────────────────────────────────
    print("Loading fastcoref model...")
    model = FCoref(device="cuda:0")
    print("Loading spaCy...")
    nlp = spacy.load("en_core_web_lg")
    print("Models loaded.")

    # ── Test texts ───────────────────────────────────────────────
    texts = [
        # Basic pronoun resolution
        "Detective Marcus Chen arrived at the Riverside Warehouse. He examined the broken window carefully.",

        # Multiple characters - the hard case for coreferee
        "Robert Sullivan and Diana Reeves owned the warehouse jointly. They had been using it to store imported furniture.",

        # Possessives
        "Marcus approached Diana for a statement. Her account of the evening was detailed.",

        # Your exact problem case - plural they
        "Sullivan and Reeves had received an anonymous tip. They decided to check the warehouse personally.",

        # Full chunk from your test scene
        (
            "Detective Marcus Chen arrived at the Riverside Warehouse just after midnight. "
            "The building was cordoned off with yellow tape, and two patrol officers stood at the entrance. "
            "Marcus ducked under the tape and approached the scene carefully. "
            "The victim, Robert Sullivan, lay face down near a stack of wooden crates. "
            "Sullivan was a fifty-two-year-old import merchant. "
            "His business partner, Diana Reeves, had discovered the body at eleven forty-five. "
            "She was now sitting in the back of a patrol car outside, visibly shaken."
        ),
    ]

    def extract_proper_name(text: str) -> str:
        """Extract the core proper name from a verbose mention like 'The victim, Robert Sullivan'."""
        # Remove leading articles and role descriptions before a comma
        # e.g. "The victim, Robert Sullivan" → "Robert Sullivan"
        # e.g. "His business partner, Diana Reeves" → "Diana Reeves"
        comma_split = re.split(r',\s*', text)
        if len(comma_split) > 1:
            # Take the last part after the comma — usually the proper name
            candidate = comma_split[-1].strip()
            # Only use it if it looks like a proper name (starts with capital)
            if candidate and candidate[0].isupper():
                return candidate
        # Strip leading "The/A/An + word(s) + " pattern
        cleaned = re.sub(r'^(the|a|an)\s+', '', text, flags=re.IGNORECASE).strip()
        return cleaned

    # ── Run coreference + resolve ─────────────────────────────────
    def resolve_coref(text: str, model: FCoref) -> str:
        preds = model.predict(texts=[text])
        clusters = preds[0].get_clusters(as_strings=False)

        if not clusters:
            return text

        replacements = []
        for cluster in clusters:
            if len(cluster) < 2:
                continue
            canonical_start, canonical_end = cluster[0]
            canonical_raw = text[canonical_start:canonical_end]
            canonical_text = extract_proper_name(canonical_raw)

            for start, end in cluster[1:]:
                mention_text = text[start:end]
                is_possessive = mention_text.lower() in {
                    "his", "her", "their", "its", "hers", "theirs"
                }
                if len(mention_text.split()) <= 3 and mention_text.lower() != canonical_text.lower():
                    replacement = canonical_text + "'s" if is_possessive else canonical_text
                    replacements.append((start, end, replacement))

        if not replacements:
            return text

        replacements.sort(key=lambda x: x[0], reverse=True)
        result = list(text)
        for start, end, replacement in replacements:
            result[start:end] = list(replacement)

        return "".join(result)

    # ── Print results ─────────────────────────────────────────────
    print("\n" + "="*60)
    print("COREFERENCE RESOLUTION TEST RESULTS")
    print("="*60)

    for i, text in enumerate(texts):
        resolved = resolve_coref(text, model)
        clusters = model.predict(texts=[text])[0].get_clusters(as_strings=True)

        print(f"\n--- Test {i+1} ---")
        print(f"ORIGINAL:  {text}")
        print(f"CLUSTERS:  {clusters}")
        print(f"RESOLVED:  {resolved}")
        print(f"CHANGED:   {text != resolved}")

    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)


@app.local_entrypoint()
def main():
    test_coref.remote()