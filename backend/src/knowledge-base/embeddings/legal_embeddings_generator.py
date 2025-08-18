from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from typing import List, Dict, Any
import os

class LegalEmbeddingsGenerator:
    """
    Generate embeddings for legal documents in BuffrSign knowledge base
    """
    
    def __init__(self):
        # Configure LlamaIndex settings
        Settings.llm = OpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4"),
            temperature=0.1
        )
        Settings.embed_model = OpenAIEmbedding(
            model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        )
    
    def generate_legal_embeddings(self, documents: List[Dict[str, Any]]) -> VectorStoreIndex:
        """Generate embeddings for legal documents"""
        
        llama_documents = []
        
        for doc_data in documents:
            # Create LlamaIndex Document with legal metadata
            document = Document(
                text=doc_data["content"]["full_text"],
                metadata={
                    "source": doc_data.get("source", "unknown"),
                    "document_type": doc_data.get("document_type", "legal"),
                    "jurisdiction": doc_data.get("jurisdiction", "namibia"),
                    "legal_framework": doc_data.get("legal_framework", "eta_2019"),
                    "sections": doc_data.get("sections", []),
                    "compliance_relevant": True,
                    "processed_at": doc_data["integrity"]["processed_at"],
                    "document_hash": doc_data["integrity"]["document_hash"]
                }
            )
            llama_documents.append(document)
        
        # Create vector index
        index = VectorStoreIndex.from_documents(
            llama_documents,
            show_progress=True
        )
        
        return index
    
    def create_eta_2019_embeddings(self, eta_documents: List[Dict[str, Any]]) -> VectorStoreIndex:
        """Create specialized embeddings for ETA 2019 documents"""
        
        # Add ETA 2019 specific metadata
        for doc in eta_documents:
            doc["legal_framework"] = "eta_2019"
            doc["jurisdiction"] = "namibia"
            doc["authority"] = "parliament_of_namibia"
            doc["compliance_critical"] = True
        
        return self.generate_legal_embeddings(eta_documents)
    
    def create_cran_embeddings(self, cran_documents: List[Dict[str, Any]]) -> VectorStoreIndex:
        """Create specialized embeddings for CRAN requirements"""
        
        # Add CRAN specific metadata
        for doc in cran_documents:
            doc["legal_framework"] = "cran_accreditation"
            doc["jurisdiction"] = "namibia"
            doc["authority"] = "cran"
            doc["regulatory_type"] = "accreditation_requirements"
        
        return self.generate_legal_embeddings(cran_documents)
