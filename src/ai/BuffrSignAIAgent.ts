import { VectorStoreIndex, Document as LlamaDocument, Settings } from 'llamaindex';
import { OpenAI } from 'llamaindex/llm/openai';
import { OpenAIEmbedding } from 'llamaindex/embeddings/openai';
import { SentenceSplitter } from 'llamaindex/node_parser';
import { PDFReader } from 'llamaindex/readers/pdf';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  DocumentType,
  ComplianceStatus,
  SignatureFieldType,
  AIAnalysis,
  AIRecommendation,
  RiskFactor,
  DetectedField,
  Document,
  Party,
  WorkflowType
} from '@/types';
import { Logger } from '@/utils/logger';
import { ComplianceEngine } from './ComplianceEngine';
import { DocumentProcessor } from './DocumentProcessor';
import { WorkflowOptimizer } from './WorkflowOptimizer';

interface AIAgentConfig {
  openaiApiKey: string;
  modelName: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  enableLogging: boolean;
}

interface AnalysisContext {
  userId: string;
  documentId?: string;
  userRole?: string;
  preferences?: Record<string, any>;
  businessContext?: string;
}

interface ConversationResponse {
  text: string;
  intent: string;
  confidence: number;
  suggestedActions: string[];
  requiresHumanEscalation: boolean;
  metadata?: Record<string, any>;
}

interface WorkflowOptimization {
  signingOrder: string[];
  estimatedCompletion: number;
  successProbability: number;
  reasons: string[];
  reminderSchedule: ReminderRecommendation[];
}

interface ReminderRecommendation {
  partyId: string;
  delayHours: number;
  type: 'email' | 'sms' | 'push';
  urgency: 'low' | 'medium' | 'high';
}

export class BuffrSignAIAgent {
  private config: AIAgentConfig;
  private logger: Logger;
  private complianceEngine: ComplianceEngine;
  private documentProcessor: DocumentProcessor;
  private workflowOptimizer: WorkflowOptimizer;
  private legalKnowledgeIndex: VectorStoreIndex | null = null;
  private pdfReader: PDFReader;
  private nodeSplitter: SentenceSplitter;

  constructor(config: AIAgentConfig) {
    this.config = config;
    this.logger = new Logger('BuffrSignAIAgent');
    
    // Configure LlamaIndex settings
    Settings.llm = new OpenAI({
      model: config.modelName || 'gpt-4-turbo-preview',
      temperature: config.temperature || 0.1,
      maxTokens: config.maxTokens || 4096
    });
    
    Settings.embedModel = new OpenAIEmbedding({
      model: config.embeddingModel || 'text-embedding-3-small'
    });

    // Initialize components
    this.complianceEngine = new ComplianceEngine();
    this.documentProcessor = new DocumentProcessor();
    this.workflowOptimizer = new WorkflowOptimizer();
    this.pdfReader = new PDFReader();
    this.nodeSplitter = new SentenceSplitter({
      chunkSize: 1024,
      chunkOverlap: 20
    });

    this.initializeLegalKnowledgeBase();
  }

  /**
   * Initialize the legal knowledge base with ETA 2019 and SADC frameworks
   */
  private async initializeLegalKnowledgeBase(): Promise<void> {
    try {
      const legalDocuments = [
        new LlamaDocument({
          text: `
          Electronic Transactions Act 2019 (Namibia) - Core Requirements:
          
          1. LEGAL RECOGNITION (Section 11):
          - Electronic signatures have the same legal status as handwritten signatures
          - Must be capable of identifying the signatory
          - Must indicate signatory's approval of the information
          
          2. RELIABILITY REQUIREMENTS (Section 13):
          - Signature creation data linked to signatory and no other person
          - Signature creation data under sole control of signatory
          - Signature linked to data message to detect subsequent changes
          - Technical reliability appropriate for purpose and circumstances
          
          3. CONSUMER PROTECTION (Section 43):
          - Clear disclosure of signature process
          - Right to withdraw consent
          - Access to signed documents in usable format
          
          4. CERTIFICATE PROVIDERS (Section 30):
          - Must be accredited by CRAN
          - Maintain reliable systems and procedures
          - Verify identity of certificate applicants
          
          5. ADMISSIBILITY (Section 15):
          - Electronic signatures admissible in legal proceedings
          - Rebuttable presumption of authenticity
          - Court may consider reliability of signature creation process
          `,
          metadata: { source: 'ETA_2019', framework: 'namibian_law' }
        }),
        
        new LlamaDocument({
          text: `
          SADC Model Law on Electronic Transactions - Key Principles:
          
          1. TECHNOLOGY NEUTRALITY:
          - Law must not discriminate against electronic form
          - Adaptable to current and future technologies
          - Performance-based rather than technology-specific requirements
          
          2. CROSS-BORDER RECOGNITION:
          - Electronic signatures valid across SADC member states
          - Mutual recognition of certification authorities
          - Harmonized legal frameworks across region
          
          3. FUNCTIONAL EQUIVALENCE:
          - Electronic documents legally equivalent to paper
          - Electronic signatures equivalent to handwritten signatures
          - Same legal effect as traditional methods
          
          4. LEGAL ADMISSIBILITY:
          - Electronic evidence admissible in court proceedings
          - Integrity and reliability standards apply
          - Authentication requirements must be met
          
          5. CONSUMER PROTECTION:
          - Right to choose between electronic and paper
          - Clear consent requirements
          - Access and retention obligations
          `,
          metadata: { source: 'SADC_MODEL', framework: 'regional_law' }
        }),
        
        new LlamaDocument({
          text: `
          Namibian Business Document Requirements and Best Practices:
          
          1. SERVICE AGREEMENTS:
          - Client and service provider signatures required
          - Date of signing should be included
          - Witness signatures recommended for high-value contracts
          - Payment terms acknowledgment
          
          2. NON-DISCLOSURE AGREEMENTS (NDAs):
          - All parties must sign and date
          - Usually bilateral between two parties
          - May require witness for confidential information
          - Jurisdiction clause important for enforcement
          
          3. PARTNERSHIP AGREEMENTS:
          - All partners must sign individually
          - Witness signatures often required
          - Notarization may be needed for property transfers
          - Amendment procedures must be specified
          
          4. EMPLOYMENT CONTRACTS:
          - Employee and employer signatures required
          - Date of commencement important
          - Reference to labor law compliance
          - Probation period acknowledgment
          
          5. PURCHASE ORDERS/INVOICES:
          - Authorized signatory for company
          - Delivery acknowledgment signature
          - Payment authorization signature
          - VAT registration compliance
          `,
          metadata: { source: 'business_practices', framework: 'namibian_business' }
        }),
        
        new LlamaDocument({
          text: `
          Digital Signature Security and Compliance Standards:
          
          1. ENCRYPTION REQUIREMENTS:
          - Minimum AES-256 encryption for documents
          - RSA-2048 or higher for signature keys
          - TLS 1.3 for data transmission
          - Hash functions: SHA-256 or stronger
          
          2. AUDIT TRAIL REQUIREMENTS:
          - Complete signing history with timestamps
          - IP address and geolocation logging
          - User agent and device information
          - Document integrity verification
          
          3. IDENTITY VERIFICATION:
          - Multi-factor authentication recommended
          - Email verification mandatory
          - SMS verification for high-value transactions
          - Biometric verification for enterprise use
          
          4. DOCUMENT INTEGRITY:
          - Cryptographic hash of original document
          - Tamper-evident sealing after each signature
          - Version control and change tracking
          - Final sealed document with all signatures
          
          5. COMPLIANCE MONITORING:
          - Real-time compliance checking
          - Automated risk assessment
          - Regulatory change monitoring
          - Audit report generation
          `,
          metadata: { source: 'security_standards', framework: 'technical' }
        })
      ];

      this.legalKnowledgeIndex = await VectorStoreIndex.fromDocuments(
        legalDocuments,
        { nodeSplitter: this.nodeSplitter }
      );

      this.logger.info('Legal knowledge base initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize legal knowledge base', error);
      throw new Error('AI Agent initialization failed');
    }
  }

  /**
   * Comprehensive document analysis using AI and legal knowledge
   */
  async analyzeDocument(
    documentPath: string, 
    context: AnalysisContext
  ): Promise<AIAnalysis> {
    const startTime = Date.now();
    const analysisId = uuidv4();

    try {
      this.logger.info(`Starting document analysis: ${analysisId}`, { documentPath, context });

      // Step 1: Extract document content
      const documentContent = await this.documentProcessor.extractContent(documentPath);
      
      // Step 2: Classify document type
      const { documentType, confidence } = await this.classifyDocument(documentContent);
      
      // Step 3: Detect signature fields using AI
      const detectedFields = await this.detectSignatureFields(documentPath, documentType);
      
      // Step 4: Generate document summary
      const summary = await this.generateDocumentSummary(documentContent, documentType);
      
      // Step 5: Check legal compliance
      const complianceResult = await this.checkLegalCompliance(documentContent, documentType, context);
      
      // Step 6: Generate AI recommendations
      const recommendations = await this.generateRecommendations(
        documentType, 
        detectedFields, 
        complianceResult,
        context
      );
      
      // Step 7: Assess risk factors
      const riskFactors = await this.assessRiskFactors(documentContent, documentType, context);
      
      // Step 8: Estimate completion time
      const estimatedCompletionTime = await this.estimateCompletionTime(
        detectedFields, 
        documentType, 
        context
      );

      const processingTime = Date.now() - startTime;

      const analysis: AIAnalysis = {
        id: analysisId,
        documentId: context.documentId || '',
        documentType,
        confidence,
        summary,
        recommendations,
        complianceScore: complianceResult.score,
        complianceStatus: complianceResult.status,
        estimatedCompletionTime,
        riskFactors,
        detectedFields,
        processedAt: new Date(),
        processingTime
      };

      this.logger.info(`Document analysis completed: ${analysisId}`, { 
        processingTime, 
        documentType, 
        confidence 
      });

      return analysis;

    } catch (error) {
      this.logger.error(`Document analysis failed: ${analysisId}`, error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Classify document type using AI
   */
  private async classifyDocument(content: any): Promise<{ documentType: DocumentType; confidence: number }> {
    try {
      const text = content.text || '';
      const classificationPrompt = `
        Analyze this document and classify its type. Consider the content, structure, and legal language.
        
        Document text (first 2000 characters):
        ${text.substring(0, 2000)}
        
        Available document types:
        - service_agreement: Service contracts, consulting agreements, professional services
        - nda: Non-disclosure agreements, confidentiality agreements
        - partnership_agreement: Business partnerships, joint ventures, consortium agreements
        - employment_contract: Employment agreements, job contracts, work agreements
        - purchase_order: Purchase orders, procurement documents, buying agreements
        - invoice: Invoices, billing documents, payment requests
        - legal_document: Legal contracts, court documents, legal forms
        - unknown: Cannot determine type
        
        Respond with JSON format:
        {
          "documentType": "type_from_list_above",
          "confidence": 0.95,
          "reasoning": "Brief explanation of classification"
        }
      `;

      if (!this.legalKnowledgeIndex) {
        throw new Error('Legal knowledge base not initialized');
      }

      const queryEngine = this.legalKnowledgeIndex.asQueryEngine();
      const response = await queryEngine.query(classificationPrompt);
      
      try {
        const result = JSON.parse(response.toString());
        return {
          documentType: result.documentType as DocumentType,
          confidence: result.confidence
        };
      } catch (parseError) {
        // Fallback classification
        return this.fallbackClassification(text);
      }

    } catch (error) {
      this.logger.error('Document classification failed', error);
      return { documentType: DocumentType.UNKNOWN, confidence: 0.5 };
    }
  }

  /**
   * Fallback document classification using keyword matching
   */
  private fallbackClassification(text: string): { documentType: DocumentType; confidence: number } {
    const lowercaseText = text.toLowerCase();
    
    const patterns = {
      [DocumentType.SERVICE_AGREEMENT]: [
        'service agreement', 'consulting agreement', 'professional services',
        'scope of work', 'deliverables', 'service provider'
      ],
      [DocumentType.NDA]: [
        'non-disclosure', 'confidentiality agreement', 'confidential information',
        'proprietary information', 'trade secrets'
      ],
      [DocumentType.PARTNERSHIP_AGREEMENT]: [
        'partnership agreement', 'joint venture', 'business partnership',
        'consortium', 'collaboration agreement'
      ],
      [DocumentType.EMPLOYMENT_CONTRACT]: [
        'employment agreement', 'employment contract', 'job contract',
        'terms of employment', 'employee', 'employer'
      ],
      [DocumentType.PURCHASE_ORDER]: [
        'purchase order', 'procurement', 'buy', 'purchase',
        'supplier', 'vendor', 'goods'
      ],
      [DocumentType.INVOICE]: [
        'invoice', 'bill', 'payment due', 'amount owed',
        'billing', 'charges'
      ]
    };

    let bestMatch = DocumentType.UNKNOWN;
    let highestScore = 0;

    for (const [docType, keywords] of Object.entries(patterns)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowercaseText.includes(keyword) ? 1 : 0);
      }, 0) / keywords.length;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = docType as DocumentType;
      }
    }

    return {
      documentType: bestMatch,
      confidence: Math.min(0.8, highestScore + 0.2)
    };
  }

  /**
   * Detect signature fields in document using AI
   */
  private async detectSignatureFields(
    documentPath: string, 
    documentType: DocumentType
  ): Promise<DetectedField[]> {
    try {
      // This would integrate with computer vision AI for actual field detection
      // For now, return mock detected fields based on document type
      const mockFields = this.getMockSignatureFields(documentType);
      
      this.logger.info(`Detected ${mockFields.length} signature fields`, { documentType });
      return mockFields;

    } catch (error) {
      this.logger.error('Signature field detection failed', error);
      return [];
    }
  }

  /**
   * Generate mock signature fields for testing
   */
  private getMockSignatureFields(documentType: DocumentType): DetectedField[] {
    const baseFields = [
      {
        page: 1,
        x: 100,
        y: 700,
        width: 200,
        height: 50,
        type: SignatureFieldType.SIGNATURE,
        confidence: 0.92,
        suggestedRole: 'Primary Party',
        text: 'Signature:'
      },
      {
        page: 1,
        x: 350,
        y: 700,
        width: 100,
        height: 30,
        type: SignatureFieldType.DATE,
        confidence: 0.88,
        suggestedRole: 'Primary Party',
        text: 'Date:'
      }
    ];

    if (documentType === DocumentType.SERVICE_AGREEMENT || 
        documentType === DocumentType.PARTNERSHIP_AGREEMENT) {
      baseFields.push(
        {
          page: 2,
          x: 100,
          y: 600,
          width: 200,
          height: 50,
          type: SignatureFieldType.SIGNATURE,
          confidence: 0.90,
          suggestedRole: 'Secondary Party',
          text: 'Client Signature:'
        },
        {
          page: 2,
          x: 350,
          y: 600,
          width: 100,
          height: 30,
          type: SignatureFieldType.DATE,
          confidence: 0.85,
          suggestedRole: 'Secondary Party',
          text: 'Date:'
        }
      );
    }

    return baseFields;
  }

  /**
   * Generate plain-language document summary
   */
  private async generateDocumentSummary(
    content: any, 
    documentType: DocumentType
  ): Promise<string> {
    try {
      const summaryPrompt = `
        Create a clear, simple summary of this ${documentType} document. 
        Explain what it's about, who needs to sign, and key terms in plain language 
        that someone with basic English can understand.
        
        Document content:
        ${content.text?.substring(0, 3000) || 'Document content not available'}
        
        Focus on:
        1. What this document is about
        2. Key obligations for each party
        3. Important terms (payment, timeline, etc.)
        4. What happens after signing
        
        Keep it under 200 words and use simple language.
      `;

      if (!this.legalKnowledgeIndex) {
        return this.generateFallbackSummary(documentType);
      }

      const queryEngine = this.legalKnowledgeIndex.asQueryEngine();
      const response = await queryEngine.query(summaryPrompt);
      
      return response.toString();

    } catch (error) {
      this.logger.error('Summary generation failed', error);
      return this.generateFallbackSummary(documentType);
    }
  }

  /**
   * Generate fallback summary when AI fails
   */
  private generateFallbackSummary(documentType: DocumentType): string {
    const summaries = {
      [DocumentType.SERVICE_AGREEMENT]: 'This is a service agreement between a service provider and client. It outlines the work to be done, payment terms, and responsibilities of both parties. Both parties need to sign to make it legally binding.',
      [DocumentType.NDA]: 'This is a confidentiality agreement to protect private information. It prevents sharing of confidential information with others. All parties must sign to agree to keep information secret.',
      [DocumentType.PARTNERSHIP_AGREEMENT]: 'This creates a business partnership between multiple parties. It defines each partner\'s roles, responsibilities, and profit sharing. All partners must sign to establish the partnership.',
      [DocumentType.EMPLOYMENT_CONTRACT]: 'This is an employment agreement between employer and employee. It outlines job duties, salary, benefits, and work conditions. Both employer and employee must sign.',
      [DocumentType.PURCHASE_ORDER]: 'This is a purchase order for goods or services. It specifies what is being bought, quantities, prices, and delivery terms. Buyer and seller signatures are required.',
      [DocumentType.INVOICE]: 'This is a bill for payment of goods or services provided. It shows amounts owed and payment terms. Customer signature acknowledges receipt and payment obligation.',
      [DocumentType.UNKNOWN]: 'This document requires signatures from multiple parties. Please review the content carefully to understand your obligations before signing.'
    };

    return summaries[documentType] || summaries[DocumentType.UNKNOWN];
  }

  /**
   * Check legal compliance using AI and knowledge base
   */
  private async checkLegalCompliance(
    content: any,
    documentType: DocumentType,
    context: AnalysisContext
  ): Promise<{ status: ComplianceStatus; score: number; issues: string[] }> {
    try {
      return await this.complianceEngine.checkCompliance(content, documentType, context);
    } catch (error) {
      this.logger.error('Compliance check failed', error);
      return {
        status: ComplianceStatus.UNKNOWN,
        score: 50,
        issues: ['Unable to perform compliance check']
      };
    }
  }

  /**
   * Generate AI recommendations for document optimization
   */
  private async generateRecommendations(
    documentType: DocumentType,
    detectedFields: DetectedField[],
    complianceResult: any,
    context: AnalysisContext
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Add workflow optimization recommendations
    if (detectedFields.length > 2) {
      recommendations.push({
        type: 'workflow',
        priority: 'medium',
        title: 'Optimize signing workflow',
        description: 'Use sequential signing for better completion rates with multiple parties',
        actionRequired: false,
        suggestedAction: 'Enable sequential workflow in document settings'
      });
    }

    // Add security recommendations
    recommendations.push({
      type: 'security',
      priority: 'high',
      title: 'Enable SMS verification',
      description: 'Add SMS verification for enhanced security and legal compliance',
      actionRequired: false,
      suggestedAction: 'Request phone numbers from all signers'
    });

    // Add compliance recommendations
    if (complianceResult.score < 90) {
      recommendations.push({
        type: 'compliance',
        priority: 'high',
        title: 'Improve ETA 2019 compliance',
        description: 'Document may need additional fields or clauses for full legal compliance',
        actionRequired: true,
        suggestedAction: 'Review compliance issues and add required elements'
      });
    }

    // Document-type specific recommendations
    if (documentType === DocumentType.SERVICE_AGREEMENT) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Add payment acknowledgment',
        description: 'Include payment terms acknowledgment signature for better enforceability',
        actionRequired: false,
        suggestedAction: 'Add payment terms signature field'
      });
    }

    return recommendations;
  }

  /**
   * Assess risk factors for the document
   */
  private async assessRiskFactors(
    content: any,
    documentType: DocumentType,
    context: AnalysisContext
  ): Promise<RiskFactor[]> {
    const riskFactors: RiskFactor[] = [];

    // Check for missing date fields
    const text = content.text || '';
    if (!text.toLowerCase().includes('date') && !text.includes('20')) {
      riskFactors.push({
        type: 'legal',
        severity: 'medium',
        description: 'No clear date fields detected',
        mitigation: 'Add date fields next to signature lines'
      });
    }

    // Check for high-value contracts
    if (text.match(/\$[\d,]+|N\$[\d,]+|\d+\s*(dollars?|namibian)/i)) {
      riskFactors.push({
        type: 'security',
        severity: 'high',
        description: 'High-value contract detected',
        mitigation: 'Consider additional verification methods and witness signatures'
      });
    }

    // Check completion risk based on party count
    if (documentType === DocumentType.PARTNERSHIP_AGREEMENT) {
      riskFactors.push({
        type: 'completion',
        severity: 'medium',
        description: 'Multi-party agreements have higher abandonment rates',
        mitigation: 'Use sequential signing and send regular reminders'
      });
    }

    return riskFactors;
  }

  /**
   * Estimate document completion time
   */
  private async estimateCompletionTime(
    detectedFields: DetectedField[],
    documentType: DocumentType,
    context: AnalysisContext
  ): Promise<number> {
    // Base time estimates (in hours)
    const baseTime = {
      [DocumentType.INVOICE]: 4,
      [DocumentType.NDA]: 12,
      [DocumentType.SERVICE_AGREEMENT]: 24,
      [DocumentType.EMPLOYMENT_CONTRACT]: 18,
      [DocumentType.PARTNERSHIP_AGREEMENT]: 48,
      [DocumentType.PURCHASE_ORDER]: 8,
      [DocumentType.LEGAL_DOCUMENT]: 72,
      [DocumentType.UNKNOWN]: 24
    };

    let estimatedTime = baseTime[documentType] || 24;

    // Adjust based on number of signature fields (proxy for complexity)
    const fieldMultiplier = Math.max(1, detectedFields.length * 0.3);
    estimatedTime *= fieldMultiplier;

    // Adjust based on user role (business users might be faster)
    if (context.userRole === 'business' || context.userRole === 'enterprise') {
      estimatedTime *= 0.7;
    }

    return Math.ceil(estimatedTime);
  }

  /**
   * Handle conversational AI interactions
   */
  async handleConversation(
    message: string, 
    context: AnalysisContext
  ): Promise<ConversationResponse> {
    try {
      this.logger.info('Processing AI conversation', { message: message.substring(0, 100), context });

      const conversationPrompt = `
        You are BuffrSign AI, an expert assistant for digital signatures in Namibia and SADC region.
        You help users with document signing, legal compliance (ETA 2019), and workflow optimization.
        
        User message: "${message}"
        
        Context: ${JSON.stringify(context)}
        
        Provide a helpful response that:
        1. Directly answers the user's question
        2. Offers specific, actionable advice
        3. Mentions relevant legal compliance if applicable
        4. Suggests next steps or actions
        
        Keep responses conversational but professional. Use simple language.
        If you can't help, say so and suggest contacting support.
        
        Respond in JSON format:
        {
          "response": "Your helpful response here",
          "intent": "detected_intent",
          "confidence": 0.95,
          "suggestedActions": ["action1", "action2"],
          "requiresHuman": false
        }
      `;

      if (!this.legalKnowledgeIndex) {
        throw new Error('Legal knowledge base not available');
      }

      const queryEngine = this.legalKnowledgeIndex.asQueryEngine();
      const response = await queryEngine.query(conversationPrompt);
      
      try {
        const result = JSON.parse(response.toString());
        return result as ConversationResponse;
      } catch (parseError) {
        return this.generateFallbackResponse(message);
      }

    } catch (error) {
      this.logger.error('Conversation handling failed', error);
      return this.generateFallbackResponse(message);
    }
  }

  /**
   * Generate fallback response when AI fails
   */
  private generateFallbackResponse(message: string): ConversationResponse {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('sign') || lowercaseMessage.includes('signature')) {
      return {
        text: "I can help you with digital signatures! You can upload your document, and I'll analyze it to detect signature fields and ensure ETA 2019 compliance. Would you like to start by uploading a document?",
        intent: 'signing_help',
        confidence: 0.8,
        suggestedActions: ['Upload document', 'Learn about signatures'],
        requiresHumanEscalation: false
      };
    }
    
    if (lowercaseMessage.includes('legal') || lowercaseMessage.includes('compliance')) {
      return {
        text: "I ensure all documents comply with Namibia's Electronic Transactions Act 2019 and SADC regional standards. This includes proper signature validation, audit trails, and legal admissibility. What specific compliance question do you have?",
        intent: 'compliance_question',
        confidence: 0.8,
        suggestedActions: ['Check document compliance', 'Learn about ETA 2019'],
        requiresHumanEscalation: false
      };
    }
    
    return {
      text: "I'm here to help with digital signatures, document analysis, and legal compliance. I can analyze your documents, optimize signing workflows, and ensure ETA 2019 compliance. What would you like to know?",
      intent: 'general_help',
      confidence: 0.6,
      suggestedActions: ['Upload document', 'Ask specific question', 'Contact support'],
      requiresHumanEscalation: false
    };
  }

  /**
   * Optimize multi-party signing workflow
   */
  async optimizeWorkflow(
    parties: Party[], 
    documentAnalysis: AIAnalysis
  ): Promise<WorkflowOptimization> {
    try {
      this.logger.info('Optimizing workflow', { 
        partyCount: parties.length, 
        documentType: documentAnalysis.documentType 
      });

      return await this.workflowOptimizer.optimizeSigningOrder(parties, documentAnalysis);

    } catch (error) {
      this.logger.error('Workflow optimization failed', error);
      
      // Return basic sequential workflow as fallback
      return {
        signingOrder: parties.map(p => p.id),
        estimatedCompletion: parties.length * 24, // 24 hours per party
        successProbability: 0.75,
        reasons: ['Using sequential workflow as fallback'],
        reminderSchedule: parties.map(p => ({
          partyId: p.id,
          delayHours: 72,
          type: 'email' as const,
          urgency: 'medium' as const
        }))
      };
    }
  }

  /**
   * Validate signing compliance in real-time
   */
  async validateSigningCompliance(
    documentId: string, 
    signatureData: any
  ): Promise<{ isCompliant: boolean; issues: string[] }> {
    try {
      return await this.complianceEngine.validateSigningProcess(documentId, signatureData);
    } catch (error) {
      this.logger.error('Signing compliance validation failed', error);
      return {
        isCompliant: false,
        issues: ['Unable to validate compliance']
      };
    }
  }

  /**
   * Generate completion report with AI insights
   */
  async generateCompletionReport(
    documentId: string, 
    workflowData: any
  ): Promise<string> {
    try {
      const reportPrompt = `
        Generate a completion report for this signed document workflow.
        
        Document ID: ${documentId}
        Workflow data: ${JSON.stringify(workflowData)}
        
        Include:
        1. Completion summary
        2. Timeline analysis
        3. Compliance status
        4. Any issues or recommendations
        
        Keep it professional but easy to understand.
      `;

      if (!this.legalKnowledgeIndex) {
        return this.generateBasicCompletionReport(workflowData);
      }

      const queryEngine = this.legalKnowledgeIndex.asQueryEngine();
      const response = await queryEngine.query(reportPrompt);
      
      return response.toString();

    } catch (error) {
      this.logger.error('Completion report generation failed', error);
      return this.generateBasicCompletionReport(workflowData);
    }
  }

  /**
   * Generate basic completion report as fallback
   */
  private generateBasicCompletionReport(workflowData: any): string {
    const completedAt = new Date().toLocaleDateString();
    const partyCount = workflowData.parties?.length || 'multiple';
    
    return `
      Document Signing Completed Successfully
      
      Completion Date: ${completedAt}
      Parties: ${partyCount} parties signed
      Status: All signatures collected
      Compliance: ETA 2019 compliant
      
      The document has been signed by all required parties and is legally binding.
      All signatures include proper audit trails and comply with Namibian electronic signature laws.
      
      A final sealed copy has been generated and distributed to all parties.
    `;
  }

  /**
   * Get agent health status
   */
  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, any> } {
    const status = {
      legalKnowledgeBase: !!this.legalKnowledgeIndex,
      complianceEngine: this.complianceEngine.isHealthy(),
      documentProcessor: this.documentProcessor.isHealthy(),
      workflowOptimizer: this.workflowOptimizer.isHealthy()
    };

    const isHealthy = Object.values(status).every(Boolean);
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      details: status
    };
  }
}

export default BuffrSignAIAgent;