from app.core.logging import get_logger
from app.core.supabase import get_supabase_client
from app.schemas.query import EntityContext
from app.schemas.query import GraphContext
from app.schemas.query import RelationshipContext

logger = get_logger(__name__)


class NlpContextService:
    FILE_SCOPED_PHRASES = ("in this scene", "in this file", "in this document","in this snippet", "in the current file", "in the current scene", "in the current context", "in the current document", "in the current snippet")

    @classmethod
    def _is_file_scoped_question(cls, question: str) -> bool:
        lowered = question.lower()
        return any(phrase in lowered for phrase in cls.FILE_SCOPED_PHRASES)

    def _fetch_job_id(self, fs_node_id: str) -> str | None:
        client = get_supabase_client()
        response = (
            client.table("nlp_analysis_jobs")
            .select("job_id,id")
            .eq("fs_node_id", fs_node_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        rows = response.data or []

        if not rows:
            return None

        job_id = rows[0].get("job_id") or rows[0].get("id")
        return str(job_id) if job_id is not None else None

    def _fetch_file_fs_node_ids(
        self, project_id: str, active_branch_id: str
    ) -> list[str]:
        client = get_supabase_client()
        response = (
            client.table("fs_nodes")
            .select("id")
            .eq("project_id", project_id)
            .eq("branch_id", active_branch_id)
            .eq("node_type", "file")
            .execute()
        )
        rows = response.data or []
        return [str(row.get("id")) for row in rows if row.get("id") is not None]

    def _fetch_active_branch_id(self, project_id: str) -> str | None:
        client = get_supabase_client()
        response = (
            client.table("branches")
            .select("id")
            .eq("project_id", project_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        rows = response.data or []

        if not rows:
            return None

        branch_id = rows[0].get("id")
        return str(branch_id) if branch_id is not None else None

    def _fetch_job_ids_for_fs_nodes(self, fs_node_ids: list[str]) -> list[str]:
        if not fs_node_ids:
            return []

        client = get_supabase_client()
        response = (
            client.table("nlp_analysis_jobs")
            .select("job_id,id")
            .in_("fs_node_id", fs_node_ids)
            .execute()
        )
        rows = response.data or []

        job_ids: list[str] = []
        seen: set[str] = set()
        for row in rows:
            raw_job_id = row.get("job_id") or row.get("id")
            if raw_job_id is None:
                continue

            job_id = str(raw_job_id)
            if job_id in seen:
                continue

            seen.add(job_id)
            job_ids.append(job_id)

        return job_ids

    def _fetch_entities(self, job_id: str) -> list[EntityContext]:
        client = get_supabase_client()
        response = (
            client.table("nlp_entities")
            .select("name,mentions")
            .eq("job_id", job_id)
            .execute()
        )
        rows = response.data or []

        entities: list[EntityContext] = []
        for row in rows:
            raw_mentions = row.get("mentions", [])
            mentions: list[str]
            if isinstance(raw_mentions, list):
                mentions = [str(item) for item in raw_mentions]
            elif raw_mentions is None:
                mentions = []
            else:
                mentions = [str(raw_mentions)]

            entities.append(
                EntityContext(name=str(row.get("name", "")), mentions=mentions)
            )

        return entities

    def _fetch_entities_for_job_ids(self, job_ids: list[str]) -> list[EntityContext]:
        if not job_ids:
            return []

        client = get_supabase_client()
        response = (
            client.table("nlp_entities")
            .select("name,mentions")
            .in_("job_id", job_ids)
            .execute()
        )
        rows = response.data or []

        entities: list[EntityContext] = []
        for row in rows:
            raw_mentions = row.get("mentions", [])
            mentions: list[str]
            if isinstance(raw_mentions, list):
                mentions = [str(item) for item in raw_mentions]
            elif raw_mentions is None:
                mentions = []
            else:
                mentions = [str(raw_mentions)]

            entities.append(
                EntityContext(name=str(row.get("name", "")), mentions=mentions)
            )

        return entities

    def _fetch_relationships(self, job_id: str) -> list[RelationshipContext]:
        client = get_supabase_client()
        response = (
            client.table("nlp_relationships")
            .select("source,target,relation_type")
            .eq("job_id", job_id)
            .execute()
        )
        rows = response.data or []

        relationships: list[RelationshipContext] = []
        for row in rows:
            relationships.append(
                RelationshipContext(
                    source=str(row.get("source", "")),
                    target=str(row.get("target", "")),
                    relation_type=str(row.get("relation_type", "")),
                )
            )

        return relationships

    def _fetch_relationships_for_job_ids(
        self, job_ids: list[str]
    ) -> list[RelationshipContext]:
        if not job_ids:
            return []

        client = get_supabase_client()
        response = (
            client.table("nlp_relationships")
            .select("source,target,relation_type")
            .in_("job_id", job_ids)
            .execute()
        )
        rows = response.data or []

        relationships: list[RelationshipContext] = []
        for row in rows:
            relationships.append(
                RelationshipContext(
                    source=str(row.get("source", "")),
                    target=str(row.get("target", "")),
                    relation_type=str(row.get("relation_type", "")),
                )
            )

        return relationships

    def fetch_context_for_fs_node(
        self,
        fs_node_id: str,
        question: str,
        project_id: str,
    ) -> GraphContext:
        is_file_scoped_question = self._is_file_scoped_question(question)

        try:
            active_branch_id = self._fetch_active_branch_id(project_id)

            if not active_branch_id:
                logger.info(
                    "No active branch found for project_id=%s",
                    project_id,
                )
                return GraphContext(
                    fs_node_id=fs_node_id,
                    project_id=project_id,
                    active_branch_id=None,
                    is_file_scoped=is_file_scoped_question,
                    job_id=None,
                )

            if is_file_scoped_question:
                job_id = self._fetch_job_id(fs_node_id)
                job_ids: list[str] = [job_id] if job_id else []
            else:
                fs_node_ids = self._fetch_file_fs_node_ids(project_id, active_branch_id)
                job_ids = self._fetch_job_ids_for_fs_nodes(fs_node_ids)
                job_id = None
        except Exception as exc:
            logger.exception(
                "Failed to fetch NLP analysis job ids for fs_node_id=%s project_id=%s branch_id=%s",
                fs_node_id,
                project_id,
                active_branch_id,
            )
            raise RuntimeError("Failed to fetch NLP analysis job ids") from exc

        if not job_ids:
            logger.info(
                "No NLP analysis jobs found for fs_node_id=%s project_id=%s branch_id=%s",
                fs_node_id,
                project_id,
                active_branch_id,
            )
            return GraphContext(
                fs_node_id=fs_node_id,
                project_id=project_id,
                active_branch_id=active_branch_id,
                is_file_scoped=is_file_scoped_question,
                job_id=job_id,
            )

        try:
            if is_file_scoped_question and job_id:
                entities = self._fetch_entities(job_id)
                relationships = self._fetch_relationships(job_id)
            else:
                entities = self._fetch_entities_for_job_ids(job_ids)
                relationships = self._fetch_relationships_for_job_ids(job_ids)
        except Exception as exc:
            logger.exception("Failed to fetch NLP context for job_ids=%s", job_ids)
            raise RuntimeError("Failed to fetch NLP entities and relationships") from exc

        return GraphContext(
            fs_node_id=fs_node_id,
            project_id=project_id,
            active_branch_id=active_branch_id,
            is_file_scoped=is_file_scoped_question,
            job_id=job_id,
            entities=entities,
            relationships=relationships,
        )


nlp_context_service = NlpContextService()
