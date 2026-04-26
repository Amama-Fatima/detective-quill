from __future__ import annotations

from app.core.logging import get_logger
from app.core.supabase import get_supabase_client
from app.schemas.query import SupportingEvidence

logger = get_logger(__name__)


class SupportingEvidenceService:
    def fetch_by_job_ids(self, job_ids: list[str]) -> list[SupportingEvidence]:
        if not job_ids:
            return []

        normalized_job_ids: list[str] = []
        seen: set[str] = set()
        for raw_job_id in job_ids:
            job_id = str(raw_job_id).strip()
            if not job_id or job_id in seen:
                continue
            seen.add(job_id)
            normalized_job_ids.append(job_id)

        if not normalized_job_ids:
            return []

        client = get_supabase_client()
        response = (
            client.table("nlp_analysis_jobs")
            .select("job_id,fs_node_id,scene_text")
            .in_("job_id", normalized_job_ids)
            .execute()
        )
        rows = response.data or []

        rows_by_job_id = {
            str(row.get("job_id")): row
            for row in rows
            if row.get("job_id") is not None
        }

        evidence: list[SupportingEvidence] = []
        missing_job_ids: list[str] = []
        for job_id in normalized_job_ids:
            row = rows_by_job_id.get(job_id)
            if row is None:
                missing_job_ids.append(job_id)
                continue

            fs_node_id = row.get("fs_node_id")
            resolved_text = row.get("scene_text")
            evidence.append(
                SupportingEvidence(
                    job_id=job_id,
                    fs_node_id=str(fs_node_id) if fs_node_id is not None else None,
                    resolved_text=(
                        str(resolved_text) if resolved_text is not None else None
                    ),
                )
            )

        if missing_job_ids:
            logger.warning(
                "Missing nlp_analysis_jobs rows for supporting job IDs: %s",
                missing_job_ids,
            )

        return evidence


supporting_evidence_service = SupportingEvidenceService()
