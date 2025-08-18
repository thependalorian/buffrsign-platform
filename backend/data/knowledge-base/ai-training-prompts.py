# backend/data/knowledge-base/ai-training-prompts.py
LEGAL_ANALYSIS_PROMPTS = {
    "document_analysis": """
    You are a legal expert specializing in Namibian law and the Electronic Transactions Act 2019.
    
    Analyze the following document for:
    1. ETA 2019 compliance (Sections 17, 20, 21, 24, Chapter 4)
    2. CRAN accreditation requirements
    3. Namibian contract law compliance
    4. Consumer protection requirements (if applicable)
    5. Potential legal risks or issues
    
    Document Type: {document_type}
    Jurisdiction: Namibia
    
    Document Content:
    {document_content}
    
    Provide analysis in the following format:
    - Compliance Status: [Compliant/Needs Review/Non-Compliant]
    - Key Issues: [List any legal issues found]
    - Recommendations: [Specific actions to improve compliance]
    - Risk Assessment: [Low/Medium/High risk factors]
    """,
    
    "clause_extraction": """
    Extract and categorize legal clauses from the following document.
    
    Focus on identifying:
    1. Essential clauses (parties, consideration, obligations)
    2. Boilerplate clauses (governing law, dispute resolution)
    3. Namibian law-specific requirements
    4. ETA 2019 compliance clauses
    5. Missing critical clauses
    
    Document: {document_content}
    
    Return structured analysis with:
    - Clause Type
    - Content Summary
    - Legal Significance
    - Compliance Status
    - Recommendations for improvement
    """,
    
    "signature_field_detection": """
    Analyze this document to identify optimal signature field placement.
    
    Consider:
    1. Legal requirements for signature placement
    2. Namibian contract law standards
    3. ETA 2019 electronic signature requirements
    4. User experience best practices
    5. Document flow and readability
    
    Document: {document_content}
    Document Type: {document_type}
    
    Suggest signature fields with:
    - Field ID and description
    - Optimal page and position
    - Required signature type (simple/advanced/qualified)
    - Legal justification
    - ETA 2019 compliance notes
    """
}

TEMPLATE_GENERATION_PROMPTS = {
    "employment_contract": """
    Generate a comprehensive employment contract template compliant with:
    1. Namibian Labour Act 11 of 2007
    2. Electronic Transactions Act 4 of 2019
    3. CRAN accreditation requirements
    4. Best practices for {industry} industry
    
    Requirements:
    {requirements}
    
    Include:
    - All mandatory clauses per Namibian law
    - ETA 2019 compliant signature provisions
    - Consumer protection elements (if applicable)
    - Industry-specific considerations
    - Clear, plain language explanations
    """,
    
    "government_form": """
    Generate a government form template for {form_type} that complies with:
    1. Namibian government standards
    2. ETA 2019 electronic form requirements
    3. Accessibility standards
    4. Multi-language support (English, Afrikaans, local languages)
    
    Requirements:
    {requirements}
    
    Ensure:
    - Government branding compatibility
    - Digital signature integration
    - Audit trail compliance
    - Data protection compliance
    """
}
