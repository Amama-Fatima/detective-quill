from neo4j import GraphDatabase

from app.core.config import settings
from app.core.logging import get_logger
from app.core.prompts import CYPHER_PROMPT_TEMPLATE, GRAPH_CYPHER_EXAMPLES_BLOCK, GRAPH_SCHEMA_TEXT
from app.services.cypher_utils import ensure_limit_clause, extract_cypher
from app.services.cypher_validation_service import validate_cypher_query
from app.services.modal_llm import ModalQwenLLM
from app.services.prompt_template import PromptTemplate
from app.services.query_classifier_service import QueryClassifier

logger = get_logger(__name__)


class CypherGenerationService:
    def __init__(self) -> None:
        if not settings.use_modal_nl2cypher:
            raise RuntimeError(
                "Modal NL2Cypher is disabled. Set USE_MODAL_NL2CYPHER=true to enable it."
            )

        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
        self._cypher_prompt = PromptTemplate.from_template(CYPHER_PROMPT_TEMPLATE)
        self._llm = ModalQwenLLM(timeout_seconds=settings.modal_timeout_seconds)

    def _build_prompt(self, question: str, query_type: QueryClassifier) -> str:

            base = self._cypher_prompt

            if query_type == QueryClassifier.INTERACTION:
                extra = """
        Focus: relationships between characters.
        Use: (a)-[r]-(b)
        """

            elif query_type == QueryClassifier.TIMELINE:
                extra = """
        Focus: ordering and timestamps.
        Use ORDER BY r.timestamp DESC/ASC
        """

            elif query_type == QueryClassifier.FILE:
                extra = """
        Focus: file/scene mentions.
        Use: (n)-[:APPEARS_IN]->(Scene)
        """

            else:
                extra = """
        Use general graph traversal patterns.
        """

            return base.format(
                schema=GRAPH_SCHEMA_TEXT+ "\n\n" + extra,
                question=question,
                limit=settings.cypher_result_limit,
                GRAPH_CYPHER_EXAMPLES_BLOCK=GRAPH_CYPHER_EXAMPLES_BLOCK,
            )

    def _normalize_output(self, output: str) -> str:
        cleaned = extract_cypher(output)
        cleaned = ensure_limit_clause(cleaned, settings.cypher_result_limit)
        return cleaned

    def generate_cypher(self, question: str, query_type: QueryClassifier) -> str:
        logger.debug("Generating Cypher for question")
        prompt = self._build_prompt(question)
        generated = self._llm.generate(prompt)
        cypher = self._normalize_output(generated)
        validate_cypher_query(cypher)
        return cypher
