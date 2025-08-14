"""
Optional LlamaIndex-backed smart template generation with safe fallbacks.

When `LLAMAINDEX_ENABLE=1` and dependencies are installed, attempts to synthesize
template content using LlamaIndex. Otherwise returns a deterministic stub.
"""

from typing import Any, Dict, List
import os

_LLAMAINDEX_IMPORTED = False
try:
    # Attempt import unconditionally; callers will fallback on exceptions
    from llama_index.core import VectorStoreIndex  # type: ignore
    from llama_index.core.schema import Document  # type: ignore
    _LLAMAINDEX_IMPORTED = True
except Exception:
    _LLAMAINDEX_IMPORTED = False


def _stub(template_type: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "template_content": f"Template: {template_type.replace('_', ' ').title()}\n\n[Sections]\n- Parties\n- Scope\n- Term\n- Payment\n- Confidentiality\n- Termination\n- Signatures",
        "signature_fields": [
            {"type": "signature", "role": "signer", "label": "Primary Signer"},
            {"type": "date", "label": "Date"},
        ],
        "compliance_notes": [
            "Ensure signatures meet ETA 2019 Sec 20",
            "Retain integrity per Sec 21",
        ],
        "customization_options": list(requirements.keys()),
        "engine": "stub",
    }


def generate_smart_template(template_type: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a smart template with optional LlamaIndex enhancement."""
    if not _LLAMAINDEX_IMPORTED:
        return _stub(template_type, requirements)

    try:
        # Use a tiny in-memory knowledge doc to guide structure
        guidance_text = (
            "You are drafting a legally sound template that follows Namibian ETA 2019 basics.\n"
            "Include sections for Parties, Scope, Term, Payment, Confidentiality, Termination, Signatures.\n"
            "Produce concise, well-structured sections suitable for e-signing."
        )
        index = VectorStoreIndex.from_documents([Document(text=guidance_text)])
        query = index.as_query_engine()
        content = str(query.query(
            f"Create a {template_type.replace('_',' ')} template summarizing key sections with short bullet points."
        ))

        return {
            **_stub(template_type, requirements),
            "template_content": content or _stub(template_type, requirements)["template_content"],
            "engine": "llamaindex",
        }
    except Exception:
        return _stub(template_type, requirements)


def generate_smart_template_stub(template_type: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
    # Backwards-compatible export used by the API endpoint
    return generate_smart_template(template_type, requirements)

