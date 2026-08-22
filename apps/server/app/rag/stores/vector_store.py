import os
from typing import List, Dict, Any
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

class BopomoVectorStore:
    def __init__(self, persist_directory: str = "./data/chroma_db")
        os.makedirs(persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_directory)
    
        self.embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name="BAAI/bge-m3"
        )

        self.collection = self.client.get_or_create_collection(
            name="hsk_sentences",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

    def add_sentence(self, sentences: List[Dict[str, Any]]):
        documents = [s["hanzi"] for s in sentences]
        metadatas = [
            {
                "pinyin": s['pinyin'],  
                "translation": s["translation"],
                "level": s.get("level", 1)
            }
            for s in sentences
        ]

        ids = [s["id"] for s in sentences]

        self.collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def search_similar_sentences(self, query:str, top_k: int=3) -> List[Dict[str,Any]]:
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )

        retrieved = []
        if results["documents"] and results["metadatas"]:
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                retrieved.append({
                    "hanzi": doc,
                    "pinyin": meta["pinyin"],
                    "translation": meta["translation"]
                })
        return retrieved
