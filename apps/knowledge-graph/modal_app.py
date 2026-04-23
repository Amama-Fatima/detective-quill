import modal

from src.config import settings

app = modal.App("detective-quill-knowledge-graph")

SPACY_MODEL_VERSION = "3.5.0"
SPACY_MODEL_WHEEL = (
    "https://github.com/explosion/spacy-models/releases/download/"
    f"{settings.SPACY_MODEL}-{SPACY_MODEL_VERSION}/"
    f"{settings.SPACY_MODEL}-{SPACY_MODEL_VERSION}-py3-none-any.whl"
)

# these installations happen every time container builds
image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install([
        "torch==2.1.0",
        "transformers==4.36.0",
        "accelerate==0.25.0",
        "bitsandbytes>=0.43.0",
        "scipy",
        "sentencepiece",
        "numpy<2.0",
        "pika==1.3.2",
        "spacy==3.5.4",
        "pydantic==1.10.13",
        "supabase==1.2.0", 
        "neo4j==5.14.0",  
        "python-dotenv"
    ])
    .pip_install([SPACY_MODEL_WHEEL])
    .pip_install(["coreferee==1.4.1"])
    .run_commands("python -m coreferee install en")
    .add_local_dir("src", remote_path="/root/src") # mount local src/ at /root/src/ in the container
    .add_local_file("knowledge_graph_worker.py", remote_path="/root/knowledge_graph_worker.py")
    .add_local_file("modal_app.py", remote_path="/root/modal_app.py")
)

secrets = [
    modal.Secret.from_name("detective-quill-secrets"),
    modal.Secret.from_name("neo4j-secret")
]