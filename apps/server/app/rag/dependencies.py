from app.rag.loader.knowledge_builder import seed_knowledge_graph
from app.rag.retriever.hybrid import HybridRAGEngine
from app.rag.stores.vector_store import BopomoVectorStore

kg = seed_knowledge_graph()
vector_store = BopomoVectorStore()

rag_engine = HybridRAGEngine(kg=kg, vector_store=vector_store)

def get_rag_engine() -> HybridRAGEngine:
    return rag_engine
