# backend/src/knowledge-base/legal_knowledge_base.py
from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.readers.file import PDFReader, MarkdownReader
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb
from typing import List, Dict, Any

class BuffrSignLegalKnowledgeBase:
    def __init__(self):
        self.eta_index = None
        self.cran_index = None
        self.general_law_index = None
        self.template_index = None
        self.regional_index = None
        
    def initialize_knowledge_bases(self):
        """Initialize all knowledge base indices"""
        
        # ETA 2019 Knowledge Base
        self.eta_index = self._create_eta_knowledge_base()
        
        # CRAN Requirements Knowledge Base
        self.cran_index = self._create_cran_knowledge_base()
        
        # General Legal Knowledge Base
        self.general_law_index = self._create_general_law_knowledge_base()
        
        # Template Knowledge Base
        self.template_index = self._create_template_knowledge_base()
        
        # Regional Law Knowledge Base
        self.regional_index = self._create_regional_knowledge_base()
    
    def _create_eta_knowledge_base(self) -> VectorStoreIndex:
        """Create ETA 2019 specific knowledge base"""
        documents = []
        
        # Load ETA 2019 full text
        eta_full_text = self._load_document("legal-documents/namibia/eta-2019/eta-2019-full-text.md")
        eta_full_text.metadata = {
            "source": "ETA 2019",
            "type": "primary_legislation",
            "jurisdiction": "namibia",
            "authority": "parliament_of_namibia",
            "effective_date": "2020-03-16",
            "sections": "all"
        }
        documents.append(eta_full_text)
        
        # Load individual sections
        sections = [
            "section-17-legal-recognition.md",
            "section-20-electronic-signatures.md", 
            "section-21-original-information.md",
            "section-24-retention.md",
            "chapter-4-consumer-protection.md"
        ]
        
        for section_file in sections:
            section_doc = self._load_document(f"legal-documents/namibia/eta-2019/eta-2019-sections/{section_file}")
            section_doc.metadata = {
                "source": "ETA 2019",
                "type": "legislation_section",
                "section": section_file.replace(".md", "").replace("-", "_"),
                "jurisdiction": "namibia"
            }
            documents.append(section_doc)
        
        # Create vector store
        chroma_client = chromadb.PersistentClient(path="./data/vector-stores/eta-2019")
        chroma_collection = chroma_client.get_or_create_collection("eta_2019_knowledge")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        
        return VectorStoreIndex.from_documents(documents, vector_store=vector_store)
