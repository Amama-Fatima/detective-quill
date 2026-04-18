import modal
import os
from dotenv import load_dotenv

load_dotenv()

app = modal.App("detective-quill-knowledge-graph")

POLL_INTERVAL_SECONDS = max(1, int(os.environ.get("QUEUE_POLL_INTERVAL_SECONDS", "5")))
MAX_JOBS_PER_POLL = max(1, int(os.environ.get("MAX_JOBS_PER_POLL", "10")))

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
    ])
    .pip_install([
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_lg-3.5.0/en_core_web_lg-3.5.0-py3-none-any.whl"
    ])
    .pip_install(["coreferee==1.4.1"])
    .run_commands("python -m coreferee install en")
    .add_local_dir("src", remote_path="/root/src") # mount local src/ at /root/src/ in the container
)

secrets = [
    modal.Secret.from_name("detective-quill-secrets"),
    modal.Secret.from_name("neo4j-secret")
]