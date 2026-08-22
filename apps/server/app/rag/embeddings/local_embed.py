import os
import numpy as np
from typing import List, Optional
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings

class FastLocalEmbeddingFunction(EmbeddingFunction[Documents]):
    """
    Lightning-fast, dependency-free local embedding function for instant indexing & retrieval.
    Computes normalized character n-gram hashing embeddings.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    def name(self) -> str:
        return "fast_local_embedding"

    def get_config(self) -> dict:
        return {"dim": self.dim}

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: List[List[float]] = []
        for doc in input:
            vec = np.zeros(self.dim, dtype=np.float32)
            for i, char in enumerate(doc):
                idx = (ord(char) * 31 + i * 17) % self.dim
                vec[idx] += 1.0
            # Bi-grams
            for j in range(len(doc) - 1):
                bg = doc[j:j+2]
                idx = (ord(bg[0]) * 37 + ord(bg[1]) * 19) % self.dim
                vec[idx] += 1.5
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            embeddings.append(vec.tolist())
        return embeddings

def get_embedding_function() -> EmbeddingFunction[Documents]:
    if os.getenv("USE_HEAVY_EMBEDDING", "false").lower() == "true":
        try:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
            return SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-m3")
        except Exception:
            pass
    return FastLocalEmbeddingFunction()
