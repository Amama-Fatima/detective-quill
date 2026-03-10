import modal

image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(["numpy<2.0"])
    .pip_install([
        "torch==2.6.0",
        "transformers==4.46.3",
        "accelerate>=0.26.0",
        "bitsandbytes>=0.43.0",
        "scipy",
        "sentencepiece",
        "pika==1.3.2",
        "spacy==3.5.4",
        "pydantic==1.10.13",
        "supabase==1.2.0",
        "neo4j==5.14.0",
        "fastcoref==2.1.6",
        "huggingface_hub",
    ])
    .pip_install([
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_lg-3.5.0/en_core_web_lg-3.5.0-py3-none-any.whl",
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_sm-3.5.0/en_core_web_sm-3.5.0-py3-none-any.whl",
    ])
)

app = modal.App("mistral-test", image=image)

# ---------------------------------------------------------------------------
# Test inputs
# ---------------------------------------------------------------------------

ORIGINAL_TEXT = """Detective Nora Vance stepped into the rain-soaked courtyard of the Hartwell Hotel just before two in the morning. The cobblestones glistened under the amber glow of a single working streetlamp, the others having been smashed sometime in the past week. A uniformed officer, Constable Ben Ridley, met her at the gate and handed her a pair of latex gloves without a word. The body had been found by the night porter, an elderly man named Albert Foss, who had stepped outside for a cigarette and nearly tripped over it. Foss was now seated in the hotel lobby, a blanket around his shoulders, a cup of tea going cold on the table beside him. He had not spoken more than four words since calling it in. The victim was a woman in her late thirties, dressed in an expensive charcoal coat, a single pearl earring still in her left ear. Her name, according to the hotel register, was Sylvia Crane. She had checked in alone two days prior, paying in cash and listing her occupation as a consultant. No one on the hotel staff could say what she had been consulting on, or for whom. Nora crouched beside the body and studied the position of the hands. There were no visible wounds on the front of the torso. The medical examiner, Dr. Raymond Osei, arrived twelve minutes later and confirmed what Nora had already suspected: the cause of death was almost certainly not the fall. He pointed to faint bruising along the neck, barely visible beneath the collar of the coat. Nora stood and looked up at the hotel facade. Three windows on the second floor were dark. One on the third floor showed a thin strip of light beneath the curtain. She asked Ridley to find out which room that was and who was registered to it. The hotel manager, a thin anxious man called Gerald Pitt, appeared in the doorway and began insisting that the hotel had an impeccable reputation and that the press could not be allowed near the entrance. Nora ignored him. A leather handbag had been found two metres from the body, its contents partially scattered across the cobblestones. A phone with a cracked screen, a tube of lipstick, a folded receipt from a restaurant called The Meridian, and a small brass key with no label. Nora bagged the key separately. She had seen that shape before, the narrow shaft and the double-cut teeth. It was the kind used for a safety deposit box. Ridley returned and told her the third floor room was registered to a man named Oliver Strand, a solicitor from Edinburgh, who had checked in that same afternoon. Nora told him to make sure Strand did not leave the building. She took one last look at Sylvia Crane and made a note in her book: two days, cash, no contact, pearl earring, one key. Someone had known exactly where to find her."""

RESOLVED_TEXT = """Detective Nora Vance stepped into the rain-soaked courtyard of the Hartwell Hotel just before two in the morning. The cobblestones glistened under the amber glow of a single working streetlamp, the others having been smashed sometime in the past week. A uniformed officer, Constable Ben Ridley, met her at the gate and handed her a pair of latex gloves without a word. Sylvia Crane had been found by the night porter, an elderly man named Albert Foss, who had stepped outside for a cigarette and nearly tripped over it. Albert Foss was now seated in the hotel lobby, a blanket around his shoulders, a cup of tea going cold on the table beside Albert Foss. Albert Foss had not spoken more than four words since calling it in. Sylvia Crane was a woman in her late thirties, dressed in an expensive charcoal coat, a single pearl earring still in her left ear. Her name, according to the hotel register, was Sylvia Crane. Sylvia Crane had checked in alone two days prior, paying in cash and listing her occupation as a consultant. No one on the hotel staff could say what Sylvia Crane had been consulting on, or for whom. Nora Vance crouched beside Sylvia Crane and studied the position of the hands. There were no visible wounds on the front of the torso. The medical examiner, Dr. Raymond Osei, arrived twelve minutes later and confirmed what Nora Vance had already suspected: the cause of death was almost certainly not the fall. Raymond Osei pointed to faint bruising along the neck, barely visible beneath the collar of the coat. Nora Vance stood and looked up at the hotel facade. Three windows on the second floor were dark. One on the third floor showed a thin strip of light beneath the curtain. Nora Vance asked Ben Ridley to find out which room that was and who was registered to it. The hotel manager, a thin anxious man called Gerald Pitt, appeared in the doorway and began insisting that the Hartwell Hotel had an impeccable reputation and that the press could not be allowed near the entrance. Nora Vance ignored Gerald Pitt. A leather handbag had been found two metres from Sylvia Crane, its contents partially scattered across the cobblestones. A phone with a cracked screen, a tube of lipstick, a folded receipt from a restaurant called The Meridian, and a small brass key with no label. Nora Vance bagged the key separately. Nora Vance had seen that shape before, the narrow shaft and the double-cut teeth. It was the kind used for a safety deposit box. Ben Ridley returned and told her the third floor room was registered to a man named Oliver Strand, a solicitor from Edinburgh, who had checked in that same afternoon. Nora Vance told Ben Ridley to make sure Oliver Strand did not leave the Hartwell Hotel. Nora Vance took one last look at Sylvia Crane and made a note in her book: two days, cash, no contact, pearl earring, one key. Someone had known exactly where to find her."""

# Pairs: two clear relationships, one that should be null, one directional test
TEST_PAIRS = [
    {
        "label": "Nora Vance ↔ Gerald Pitt (Nora ignored Pitt — clear)",
        "entity_a": {"name": "Nora Vance",  "type": "PERSON", "role": "detective"},
        "entity_b": {"name": "Gerald Pitt", "type": "PERSON", "role": "hotel manager"},
    },
    {
        "label": "Sylvia Crane ↔ Albert Foss (Foss found Crane — clear)",
        "entity_a": {"name": "Sylvia Crane", "type": "PERSON", "role": "victim"},
        "entity_b": {"name": "Albert Foss",  "type": "PERSON", "role": "witness"},
    },
    {
        "label": "Raymond Osei ↔ The Meridian (no relationship — should be null)",
        "entity_a": {"name": "Raymond Osei", "type": "PERSON", "role": "medical examiner"},
        "entity_b": {"name": "The Meridian", "type": "ORG",    "role": "location"},
    },
    {
        "label": "Oliver Strand ↔ Edinburgh (Strand is from Edinburgh — clear)",
        "entity_a": {"name": "Oliver Strand", "type": "PERSON", "role": "suspect"},
        "entity_b": {"name": "Edinburgh",     "type": "GPE",    "role": "location"},
    },
    {
        "label": "Nora Vance ↔ Ben Ridley (Nora asked Ridley — directional test)",
        "entity_a": {"name": "Nora Vance", "type": "PERSON", "role": "detective"},
        "entity_b": {"name": "Ben Ridley", "type": "PERSON", "role": "officer"},
    },
]


def _build_prompt(scene_text: str, entity_a: dict, entity_b: dict) -> str:
    a_ctx = f"{entity_a['name']} ({entity_a['type']}, {entity_a['role']})"
    b_ctx = f"{entity_b['name']} ({entity_b['type']}, {entity_b['role']})"
    return f"""[INST] You are an expert literary analyst. Extract relationships from scene text. Output only valid JSON or the word null. No explanations. No markdown.

Scene: "{scene_text}"

A: {a_ctx}
B: {b_ctx}

Task: Find ONE direct, explicit relationship between A and B stated in the scene.

Rules:
- The relationship MUST be directly stated, not inferred or implied.
- "source" must be the entity that performs the action.
- "target" must be the entity that receives the action.
- "type" must be a short active verb or verb phrase (e.g. "works_at", "found", "ignored").
- "evidence" must be a verbatim sentence or clause from the scene that proves the relationship.
- The evidence MUST explicitly mention both "{entity_a['name']}" and "{entity_b['name']}" by name.
- source and target must be exactly "{entity_a['name']}" or "{entity_b['name']}".
- If no direct relationship exists, output null.

Output ONLY one of these two formats:
{{"source":"<name>","target":"<name>","type":"<verb>","evidence":"<verbatim quote>"}}
null [/INST]"""


@app.cls(
    gpu="T4",
    secrets=[modal.Secret.from_name("detective-quill-secrets")],
    scaledown_window=120,
    timeout=900,
)
class MistralTest:

    @modal.enter()
    def load_model(self):
        import os
        import torch
        from huggingface_hub import login
        from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

        # Authenticate with Hugging Face
        hf_token = os.environ.get("HF_TOKEN")
        if hf_token:
            login(token=hf_token)
            print("Logged in to Hugging Face.")

        model_name = "mistralai/Mistral-7B-Instruct-v0.2"
        print(f"Loading tokenizer: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )

        print("Loading model with 4-bit quantization...")
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            device_map="auto",
        )

        vram_used  = torch.cuda.memory_allocated() / 1024**3
        vram_total = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"Model loaded — VRAM used: {vram_used:.1f}GB / {vram_total:.1f}GB ({vram_used/vram_total*100:.0f}%)")
        print("Model ready.")

    def _generate(self, prompt: str, max_new_tokens: int = 120) -> str:
        import torch

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,           # greedy — deterministic
                temperature=1.0,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        # Decode only the newly generated tokens
        new_tokens = output_ids[0][inputs["input_ids"].shape[-1]:]
        return self.tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    @modal.method()
    def run_tests(self) -> None:
        for scene_label, scene_text in [
            ("ORIGINAL (pronouns unresolved)", ORIGINAL_TEXT),
            ("RESOLVED  (pronouns replaced)", RESOLVED_TEXT),
        ]:
            print(f"\n{'='*70}")
            print(f"SCENE: {scene_label}")
            print(f"{'='*70}")

            for pair in TEST_PAIRS:
                print(f"\n--- {pair['label']} ---")
                prompt = _build_prompt(scene_text, pair["entity_a"], pair["entity_b"])
                response = self._generate(prompt)
                print(f"Response: {response}")


@app.local_entrypoint()
def main():
    tester = MistralTest()
    tester.run_tests.remote()