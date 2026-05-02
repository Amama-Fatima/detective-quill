<img align="right" src="apps/frontend/public/detective.gif" alt="Detective Quill Animation" width="220" height="200"  />

<p><big><big><big><strong>Detective Quill</strong></big></big></big></p>
A writing platform built for detective crime fiction writers to manage and develop their stories. It provides structured version control for manuscripts, an AI-generated knowledge graph of story elements, and natural language search across the manuscript.

<br clear="right" />

## Main Features

- **Version Control**
Track the evolution of a manuscript through a branching system. Writers can create branches to explore different narrative directions, commit changes, and review the history of their story, similar to how software developers manage code.

- **Knowledge Graph**
As the manuscript grows, the platform uses an NLP pipeline to extract and map story elements — characters, locations, events, and relationships — into a visual knowledge graph. This gives writers a bird's-eye view of their story's structure and helps surface hidden connections.

- **Search Manuscript**
Query the manuscript and knowledge graph using natural language. The query engine translates plain-English questions into graph queries, allowing writers to ask things like "which characters were present at the dockyard" and get structured answers.


## Architecture

Detective Quill is a monorepo with a microservices backend. All services live in a single git repository, but each is an independently deployable process that communicates over the network. The frontend is a standard web application; the backend, knowledge-graph pipeline, and query-engine are the microservices.

| Service | Language | Role |
|---|---|---|
| `apps/frontend` | TypeScript / Next.js | Web interface |
| `apps/backend` | TypeScript / NestJS | REST API and business logic |
| `apps/knowledge-graph` | Python | Builds and enriches the story knowledge graph |
| `apps/query-engine` | FastAPI | Translates natural language queries to graph queries |

#### Message Queues

The backend publishes jobs to RabbitMQ. Lightweight workers (create commit, send invites, etc.) run as part of the backend process and can consume from a local or cloud RabbitMQ instance without issue.

The NLP pipeline (knowledge-graph and query-engine) is deployed on Modal.com, which runs in the cloud. Because of this, a local RabbitMQ instance is not reachable by Modal workers. Modal cannot connect to `localhost:5672` on your machine. For these workers to consume jobs, RabbitMQ must be hosted on a publicly accessible broker (e.g. CloudAMQP). Both the NestJS backend (producer) and the Modal workers (consumers) must point to the same cloud broker URL.

During local development, you can skip Modal entirely and run the Python services directly on your machine, they will consume from your local RabbitMQ the same way any other local process would.

#### Databases
Supabase serves as the primary database. Neo4j stores and serves the knowledge graph.


## Tech Stack

**Frontend**
- Next.js
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (server state)
- BlockNote (rich text editor)
- yjs + y-webrtc (real-time collaborative editing)
- Neo4j NVL (graph visualization)
- ShadCN UI

**Backend**
- NestJS
- TypeScript
- Supabase (PostgreSQL)
- RabbitMQ (async messaging via AMQP)

**Python Services**
- FastAPI
- Neo4j (knowledge graph database)
- Modal.com (serverless deployment)
- RabbitMQ (job queue consumption)

**Infrastructure**
- pnpm workspaces (monorepo)
- Docker (RabbitMQ via docker-compose)

## Project Structure

```
detective-quill/
├── apps/
│   ├── backend/          # NestJS API
│   ├── frontend/         # Next.js app
│   ├── knowledge-graph/  # Graph construction pipeline
│   └── query-engine/     # Natural language query service
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── infra/                # Docker and infrastructure config
├── supabase/             # Supabase project config
└── docs/                 # Architecture diagrams
```

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Python
- Docker (for RabbitMQ)
- A Supabase project
- A Neo4j instance
- A Modal.com account (for Python worker deployment)

### Install dependencies

```bash
pnpm install
```

### Start infrastructure

```bash
docker-compose -f infra/docker-compose.yml up -d
```

This starts RabbitMQ. The management UI is available at `http://localhost:15672`.

### Environment variables

Copy the example env files for each service and fill in the required values:

```bash
cp apps/backend/.env.example apps/backend/.env-example
cp apps/frontend/.env.example apps/frontend/.env-example
cp apps/knowledge-graph/.env.example apps/knowledge-graph/.env-example
cp apps/query-engine/.env.example apps/query-engine/.env-example
```

### Run the backend

```bash
cd apps/backend
pnpm run start:dev
```

### Run the frontend

```bash
cd apps/frontend
pnpm run dev
```

### Run the worker

```bash
cd apps/backend
pnpm run start:worker:dev
```

### Run the query engine

```bash
cd apps/query-engine
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### Note: Deploying the AI Microservices

The knowledge-graph pipeline and query-engine are intended to be deployed on Modal.com. Once deployed, configure knowledge graph service to use a cloud-hosted RabbitMQ broker (e.g. CloudAMQP) so that the NestJS backend and the knowledge graph Modal workers share the same broker URL. Update the relevant environment variables in each service to point to the cloud broker instead of localhost.
