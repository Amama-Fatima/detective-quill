from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.core.logging import get_logger
from app.core.prompts import CYPHER_PROMPT_TEMPLATE

logger = get_logger(__name__)


class CypherGenerationService:
    def __init__(self) -> None:
        self._graph = Neo4jGraph(
            url=settings.neo4j_uri,
            username=settings.neo4j_user,
            password=settings.neo4j_password,
        )
        self._llm = ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.llm_api_key,
            base_url=settings.llm_api_base,
            temperature=settings.llm_temperature,
        )
        self._cypher_prompt = PromptTemplate.from_template(CYPHER_PROMPT_TEMPLATE)
        self._chain = GraphCypherQAChain.from_llm(
            llm=self._llm,
            graph=self._graph,
            cypher_prompt=self._cypher_prompt,
            verbose=False,
            top_k=settings.graph_top_k,
        )

    def generate_cypher(self, question: str) -> str:
        logger.info("Generating Cypher for question")
        generated = self._chain.cypher_generation_chain.invoke(
            {"question": question, "schema": self._chain.graph_schema}
        )

        if isinstance(generated, dict):
            cypher = str(generated.get("text") or generated.get("result") or "")
        else:
            cypher = str(generated)

        return cypher.strip()

    def generateCypher(self, question: str) -> str:
        return self.generate_cypher(question)
