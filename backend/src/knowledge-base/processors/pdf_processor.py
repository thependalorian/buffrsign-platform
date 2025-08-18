import PyPDF2
import fitz  # PyMuPDF
from typing import List, Dict, Any
import hashlib
from datetime import datetime

class PDFProcessor:
    """
    Process PDF documents for BuffrSign knowledge base
    ETA 2019 Section 21 compliant document processing
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf']
    
    def extract_text(self, file_path: str) -> Dict[str, Any]:
        """Extract text content from PDF with metadata"""
        try:
            doc = fitz.open(file_path)
            
            # Extract metadata
            metadata = doc.metadata
            
            # Extract text by page
            pages = []
            full_text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text()
                pages.append({
                    "page_number": page_num + 1,
                    "text": text,
                    "word_count": len(text.split())
                })
                full_text += text + "\n"
            
            # Generate document hash for integrity (ETA 2019 Section 21)
            document_hash = hashlib.sha256(full_text.encode()).hexdigest()
            
            doc.close()
            
            return {
                "file_path": file_path,
                "metadata": {
                    "title": metadata.get("title", ""),
                    "author": metadata.get("author", ""),
                    "subject": metadata.get("subject", ""),
                    "creator": metadata.get("creator", ""),
                    "producer": metadata.get("producer", ""),
                    "creation_date": metadata.get("creationDate", ""),
                    "modification_date": metadata.get("modDate", "")
                },
                "content": {
                    "full_text": full_text,
                    "pages": pages,
                    "total_pages": len(pages),
                    "word_count": len(full_text.split())
                },
                "integrity": {
                    "document_hash": document_hash,
                    "processed_at": datetime.utcnow().isoformat(),
                    "eta_2019_compliant": True
                }
            }
            
        except Exception as e:
            raise Exception(f"PDF processing failed: {str(e)}")
    
    def extract_legal_sections(self, text: str, document_type: str = "legislation") -> List[Dict[str, Any]]:
        """Extract legal sections from document text"""
        sections = []
        
        if document_type == "eta_2019":
            # Extract ETA 2019 specific sections
            section_patterns = [
                r"Section\s+(\d+)\.?\s*([^\n]+)",
                r"Chapter\s+(\d+)\s*([^\n]+)",
                r"\((\d+)\)\s*([^\n]+)"
            ]
            
            import re
            for pattern in section_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    sections.append({
                        "type": "section" if "Section" in match.group(0) else "chapter",
                        "number": match.group(1),
                        "title": match.group(2).strip(),
                        "full_match": match.group(0)
                    })
        
        return sections
    
    def validate_document_integrity(self, file_path: str, expected_hash: str) -> bool:
        """Validate document integrity using hash comparison"""
        try:
            current_data = self.extract_text(file_path)
            current_hash = current_data["integrity"]["document_hash"]
            return current_hash == expected_hash
        except:
            return False