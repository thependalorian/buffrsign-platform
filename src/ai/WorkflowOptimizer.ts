import { Party, AIAnalysis, DocumentType, WorkflowType } from '@/types';
import { Logger } from '@/utils/logger';

interface WorkflowOptimization {
  signingOrder: string[];
  estimatedCompletion: number;
  successProbability: number;
  reasons: string[];
  reminderSchedule: ReminderRecommendation[];
  workflowType: WorkflowType;
}

interface ReminderRecommendation {
  partyId: string;
  delayHours: number;
  type: 'email' | 'sms' | 'push';
  urgency: 'low' | 'medium' | 'high';
  message?: string;
}

interface PartyAnalysis {
  party: Party;
  priority: number;
  riskScore: number;
  estimatedResponseTime: number;
  preferredContactMethod: 'email' | 'sms' | 'push';
}

interface OptimizationFactors {
  documentComplexity: number;
  partyCount: number;
  businessDay: boolean;
  urgency: 'low' | 'medium' | 'high';
  documentValue: 'low' | 'medium' | 'high';
  crossBorder: boolean;
}

export class WorkflowOptimizer {
  private logger: Logger;
  private historicalData: Map<string, any>;

  constructor() {
    this.logger = new Logger('WorkflowOptimizer');
    this.historicalData = new Map();
    this.initializeHistoricalData();
  }

  /**
   * Optimize signing order for maximum completion probability
   */
  async optimizeSigningOrder(
    parties: Party[],
    documentAnalysis: AIAnalysis
  ): Promise<WorkflowOptimization> {
    try {
      this.logger.info('Starting workflow optimization', {
        partyCount: parties.length,
        documentType: documentAnalysis.documentType
      });

      // Analyze each party
      const partyAnalyses = await this.analyzeParties(parties, documentAnalysis);
      
      // Determine optimization factors
      const factors = this.determineOptimizationFactors(parties, documentAnalysis);
      
      // Choose optimal workflow type
      const workflowType = this.determineWorkflowType(partyAnalyses, factors);
      
      // Optimize signing order
      const signingOrder = this.optimizeOrder(partyAnalyses, workflowType, factors);
      
      // Calculate success probability
      const successProbability = this.calculateSuccessProbability(partyAnalyses, factors);
      
      // Estimate completion time
      const estimatedCompletion = this.estimateCompletionTime(partyAnalyses, workflowType, factors);
      
      // Generate optimization reasons
      const reasons = this.generateOptimizationReasons(partyAnalyses, workflowType, factors);
      
      // Create reminder schedule
      const reminderSchedule = this.createReminderSchedule(partyAnalyses, factors);

      const optimization: WorkflowOptimization = {
        signingOrder,
        estimatedCompletion,
        successProbability,
        reasons,
        reminderSchedule,
        workflowType
      };

      this.logger.info('Workflow optimization completed', {
        workflowType,
        estimatedCompletion,
        successProbability
      });

      return optimization;

    } catch (error) {
      this.logger.error('Workflow optimization failed', error);
      throw new Error(`Workflow optimization failed: ${error.message}`);
    }
  }

  /**
   * Analyze individual parties for optimization
   */
  private async analyzeParties(
    parties: Party[],
    documentAnalysis: AIAnalysis
  ): Promise<PartyAnalysis[]> {
    const analyses: PartyAnalysis[] = [];

    for (const party of parties) {
      const analysis: PartyAnalysis = {
        party,
        priority: this.calculatePartyPriority(party, documentAnalysis),
        riskScore: this.calculateRiskScore(party, documentAnalysis),
        estimatedResponseTime: this.estimateResponseTime(party, documentAnalysis),
        preferredContactMethod: this.determinePreferredContact(party)
      };

      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Calculate priority score for a party
   */
  private calculatePartyPriority(party: Party, documentAnalysis: AIAnalysis): number {
    let priority = 50; // Base priority

    // Role-based adjustments
    const roleAdjustments: Record<string, number> = {
      'client': 10,
      'customer': 10,
      'service provider': 5,
      'contractor': 5,
      'partner': 15,
      'witness': -10,
      'notary': 20,
      'legal counsel': 15
    };

    const roleAdjustment = roleAdjustments[party.role.toLowerCase()] || 0;
    priority += roleAdjustment;

    // Document type adjustments
    if (documentAnalysis.documentType === DocumentType.PARTNERSHIP_AGREEMENT && 
        party.role.toLowerCase().includes('partner')) {
      priority += 20;
    }

    if (documentAnalysis.documentType === DocumentType.EMPLOYMENT_CONTRACT && 
        party.role.toLowerCase().includes('employee')) {
      priority += 15;
    }

    // Signing order adjustments
    if (party.signingOrder === 1) {
      priority += 25; // First signer gets highest priority
    }

    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Calculate risk score for signing abandonment
   */
  private calculateRiskScore(party: Party, documentAnalysis: AIAnalysis): number {
    let risk = 20; // Base risk

    // Higher risk for complex documents
    if (documentAnalysis.complianceScore < 80) {
      risk += 15;
    }

    // Higher risk for multi-party documents
    const partyCount = documentAnalysis.detectedFields.length / 2; // Rough estimate
    if (partyCount > 3) {
      risk += 10;
    }

    // Risk factors from document analysis
    documentAnalysis.riskFactors.forEach(factor => {
      if (factor.severity === 'high') risk += 10;
      if (factor.severity === 'medium') risk += 5;
    });

    // Phone availability reduces risk
    if (party.phone) {
      risk -= 10;
    }

    return Math.min(100, Math.max(0, risk));
  }

  /**
   * Estimate response time for a party in hours
   */
  private estimateResponseTime(party: Party, documentAnalysis: AIAnalysis): number {
    let baseTime = 24; // 24 hours default

    // Document complexity affects response time
    const complexityFactors = {
      [DocumentType.INVOICE]: 0.5,
      [DocumentType.NDA]: 1.0,
      [DocumentType.SERVICE_AGREEMENT]: 1.5,
      [DocumentType.EMPLOYMENT_CONTRACT]: 1.2,
      [DocumentType.PARTNERSHIP_AGREEMENT]: 2.0,
      [DocumentType.LEGAL_DOCUMENT]: 2.5
    };

    const complexityFactor = complexityFactors[documentAnalysis.documentType] || 1.0;
    baseTime *= complexityFactor;

    // Role-based adjustments
    const roleFactors: Record<string, number> = {
      'legal counsel': 1.5,
      'notary': 2.0,
      'witness': 0.5,
      'individual': 0.8,
      'business owner': 1.2
    };

    const roleFactor = roleFactors[party.role.toLowerCase()] || 1.0;
    baseTime *= roleFactor;

    // Weekend/holiday adjustments would go here
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    if (isWeekend) {
      baseTime *= 1.5;
    }

    return Math.ceil(baseTime);
  }

  /**
   * Determine preferred contact method
   */
  private determinePreferredContact(party: Party): 'email' | 'sms' | 'push' {
    // SMS for urgent documents if phone available
    if (party.phone) {
      return 'sms';
    }
    return 'email';
  }

  /**
   * Determine optimization factors
   */
  private determineOptimizationFactors(
    parties: Party[],
    documentAnalysis: AIAnalysis
  ): OptimizationFactors {
    const now = new Date();
    const isBusinessDay = now.getDay() >= 1 && now.getDay() <= 5;

    // Determine document complexity
    let complexity = 50;
    if (documentAnalysis.complianceScore < 70) complexity += 20;
    if (documentAnalysis.riskFactors.length > 2) complexity += 15;
    if (documentAnalysis.detectedFields.length > 4) complexity += 10;

    // Determine urgency based on document type
    const urgencyMap = {
      [DocumentType.INVOICE]: 'high' as const,
      [DocumentType.PURCHASE_ORDER]: 'high' as const,
      [DocumentType.NDA]: 'medium' as const,
      [DocumentType.SERVICE_AGREEMENT]: 'medium' as const,
      [DocumentType.EMPLOYMENT_CONTRACT]: 'medium' as const,
      [DocumentType.PARTNERSHIP_AGREEMENT]: 'low' as const,
      [DocumentType.LEGAL_DOCUMENT]: 'low' as const
    };

    const urgency = urgencyMap[documentAnalysis.documentType] || 'medium';

    // Check for cross-border parties (simplified)
    const crossBorder = parties.some(party => 
      party.email.includes('.za') || party.email.includes('.bw') || party.email.includes('.zm')
    );

    return {
      documentComplexity: complexity,
      partyCount: parties.length,
      businessDay: isBusinessDay,
      urgency,
      documentValue: this.determineDocumentValue(documentAnalysis),
      crossBorder
    };
  }

  /**
   * Determine document value category
   */
  private determineDocumentValue(documentAnalysis: AIAnalysis): 'low' | 'medium' | 'high' {
    // This would analyze document content for monetary values
    // For now, use document type as proxy
    const highValueTypes = [
      DocumentType.PARTNERSHIP_AGREEMENT,
      DocumentType.LEGAL_DOCUMENT
    ];

    const mediumValueTypes = [
      DocumentType.SERVICE_AGREEMENT,
      DocumentType.EMPLOYMENT_CONTRACT
    ];

    if (highValueTypes.includes(documentAnalysis.documentType)) {
      return 'high';
    } else if (mediumValueTypes.includes(documentAnalysis.documentType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine optimal workflow type
   */
  private determineWorkflowType(
    partyAnalyses: PartyAnalysis[],
    factors: OptimizationFactors
  ): WorkflowType {
    // Sequential for high-value or complex documents
    if (factors.documentValue === 'high' || factors.documentComplexity > 70) {
      return WorkflowType.SEQUENTIAL;
    }

    // Parallel for simple, low-risk documents with few parties
    if (factors.partyCount <= 3 && factors.urgency === 'high') {
      const avgRisk = partyAnalyses.reduce((sum, p) => sum + p.riskScore, 0) / partyAnalyses.length;
      if (avgRisk < 30) {
        return WorkflowType.PARALLEL;
      }
    }

    // Hybrid for mixed scenarios
    if (factors.partyCount > 3 && factors.partyCount <= 6) {
      return WorkflowType.HYBRID;
    }

    // Default to sequential for safety
    return WorkflowType.SEQUENTIAL;
  }

  /**
   * Optimize signing order based on analysis
   */
  private optimizeOrder(
    partyAnalyses: PartyAnalysis[],
    workflowType: WorkflowType,
    factors: OptimizationFactors
  ): string[] {
    if (workflowType === WorkflowType.PARALLEL) {
      // For parallel, order doesn't matter much, but return original order
      return partyAnalyses.map(p => p.party.id);
    }

    // For sequential and hybrid, optimize order
    const sortedParties = [...partyAnalyses].sort((a, b) => {
      // Primary sort: priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Secondary sort: risk score (lower first)
      if (a.riskScore !== b.riskScore) {
        return a.riskScore - b.riskScore;
      }

      // Tertiary sort: response time (faster first)
      return a.estimatedResponseTime - b.estimatedResponseTime;
    });

    return sortedParties.map(p => p.party.id);
  }

  /**
   * Calculate overall success probability
   */
  private calculateSuccessProbability(
    partyAnalyses: PartyAnalysis[],
    factors: OptimizationFactors
  ): number {
    let baseProbability = 85; // 85% base success rate

    // Adjust for party count
    if (factors.partyCount > 5) baseProbability -= 10;
    if (factors.partyCount > 8) baseProbability -= 10;

    // Adjust for document complexity
    if (factors.documentComplexity > 70) baseProbability -= 10;
    if (factors.documentComplexity > 85) baseProbability -= 5;

    // Adjust for average risk score
    const avgRisk = partyAnalyses.reduce((sum, p) => sum + p.riskScore, 0) / partyAnalyses.length;
    baseProbability -= Math.floor(avgRisk / 10);

    // Adjust for urgency
    if (factors.urgency === 'high') baseProbability += 5;
    if (factors.urgency === 'low') baseProbability -= 5;

    // Adjust for business day
    if (!factors.businessDay) baseProbability -= 10;

    // Adjust for cross-border
    if (factors.crossBorder) baseProbability -= 5;

    return Math.max(60, Math.min(95, baseProbability)) / 100;
  }

  /**
   * Estimate total completion time
   */
  private estimateCompletionTime(
    partyAnalyses: PartyAnalysis[],
    workflowType: WorkflowType,
    factors: OptimizationFactors
  ): number {
    if (workflowType === WorkflowType.PARALLEL) {
      // Parallel: longest individual response time
      return Math.max(...partyAnalyses.map(p => p.estimatedResponseTime));
    }

    if (workflowType === WorkflowType.SEQUENTIAL) {
      // Sequential: sum of all response times
      return partyAnalyses.reduce((sum, p) => sum + p.estimatedResponseTime, 0);
    }

    // Hybrid: combination approach
    const halfParallel = Math.ceil(partyAnalyses.length / 2);
    const parallelTime = Math.max(...partyAnalyses.slice(0, halfParallel).map(p => p.estimatedResponseTime));
    const sequentialTime = partyAnalyses.slice(halfParallel).reduce((sum, p) => sum + p.estimatedResponseTime, 0);
    
    return parallelTime + sequentialTime;
  }

  /**
   * Generate human-readable optimization reasons
   */
  private generateOptimizationReasons(
    partyAnalyses: PartyAnalysis[],
    workflowType: WorkflowType,
    factors: OptimizationFactors
  ): string[] {
    const reasons: string[] = [];

    // Workflow type reasoning
    if (workflowType === WorkflowType.SEQUENTIAL) {
      if (factors.documentValue === 'high') {
        reasons.push('Sequential workflow recommended for high-value documents to ensure careful review');
      } else if (factors.documentComplexity > 70) {
        reasons.push('Sequential workflow chosen due to document complexity requiring careful review');
      } else {
        reasons.push('Sequential workflow provides better completion rates for this document type');
      }
    } else if (workflowType === WorkflowType.PARALLEL) {
      reasons.push('Parallel workflow chosen for faster completion with low-risk parties');
    } else {
      reasons.push('Hybrid workflow balances speed and completion probability');
    }

    // Party ordering reasoning
    const highPriorityParties = partyAnalyses.filter(p => p.priority > 70);
    if (highPriorityParties.length > 0) {
      reasons.push(`Key stakeholders prioritized for early signing (${highPriorityParties.map(p => p.party.role).join(', ')})`);
    }

    // Risk mitigation
    const highRiskParties = partyAnalyses.filter(p => p.riskScore > 50);
    if (highRiskParties.length > 0) {
      reasons.push('Enhanced reminder schedule for parties with higher abandonment risk');
    }

    // Timing considerations
    if (!factors.businessDay) {
      reasons.push('Weekend timing adjusted with extended completion estimates');
    }

    if (factors.crossBorder) {
      reasons.push('Cross-border considerations included in timing estimates');
    }

    return reasons;
  }

  /**
   * Create optimized reminder schedule
   */
  private createReminderSchedule(
    partyAnalyses: PartyAnalysis[],
    factors: OptimizationFactors
  ): ReminderRecommendation[] {
    const reminders: ReminderRecommendation[] = [];

    partyAnalyses.forEach(analysis => {
      const baseDelay = analysis.estimatedResponseTime * 0.5; // Remind at 50% of estimated time
      
      // Adjust delay based on urgency
      let adjustedDelay = baseDelay;
      if (factors.urgency === 'high') adjustedDelay *= 0.5;
      if (factors.urgency === 'low') adjustedDelay *= 1.5;

      // First reminder
      reminders.push({
        partyId: analysis.party.id,
        delayHours: Math.max(4, adjustedDelay), // Minimum 4 hours
        type: analysis.preferredContactMethod,
        urgency: this.mapUrgencyLevel(analysis.riskScore, factors.urgency),
        message: this.generateReminderMessage(analysis, factors, 'first')
      });

      // Second reminder for high-risk parties
      if (analysis.riskScore > 50) {
        reminders.push({
          partyId: analysis.party.id,
          delayHours: analysis.estimatedResponseTime * 0.8,
          type: 'email', // Always use email for follow-up
          urgency: 'high',
          message: this.generateReminderMessage(analysis, factors, 'followup')
        });
      }
    });

    return reminders;
  }

  /**
   * Map risk and urgency to reminder urgency level
   */
  private mapUrgencyLevel(riskScore: number, documentUrgency: string): 'low' | 'medium' | 'high' {
    if (riskScore > 60 || documentUrgency === 'high') return 'high';
    if (riskScore > 30 || documentUrgency === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Generate contextual reminder messages
   */
  private generateReminderMessage(
    analysis: PartyAnalysis,
    factors: OptimizationFactors,
    type: 'first' | 'followup'
  ): string {
    const party = analysis.party;
    
    if (type === 'first') {
      return `Hi ${party.name}, please review and sign the document when convenient. ${
        factors.urgency === 'high' ? 'Your prompt response is appreciated.' : ''
      }`;
    } else {
      return `Hi ${party.name}, this is a friendly reminder about the pending document signature. ${
        factors.urgency === 'high' ? 'Please sign at your earliest convenience.' : 'No rush, but please sign when you have a moment.'
      }`;
    }
  }

  /**
   * Initialize historical data for ML optimization
   */
  private initializeHistoricalData(): void {
    // This would typically load from a database
    // For now, initialize with mock data
    this.historicalData.set('completion_rates', {
      sequential: 0.85,
      parallel: 0.78,
      hybrid: 0.82
    });

    this.historicalData.set('average_response_times', {
      individual: 18, // hours
      business: 24,
      enterprise: 48
    });
  }

  /**
   * Learn from completed workflows (ML feedback loop)
   */
  async learnFromWorkflow(
    workflowId: string,
    actualOutcome: {
      completed: boolean;
      completionTime: number;
      abandonedParties: string[];
    }
  ): Promise<void> {
    try {
      // This would update ML models with actual outcomes
      // For now, just log for future implementation
      this.logger.info('Learning from workflow outcome', {
        workflowId,
        completed: actualOutcome.completed,
        completionTime: actualOutcome.completionTime
      });

      // Update historical success rates
      // Implementation would go here

    } catch (error) {
      this.logger.error('Failed to learn from workflow', error);
    }
  }

  /**
   * Check if workflow optimizer is healthy
   */
  isHealthy(): boolean {
    return this.historicalData.size > 0;
  }
}

export default WorkflowOptimizer;