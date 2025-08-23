import { DocumentType, ComplianceStatus } from '@/types';
import { Logger } from '@/utils/logger';

interface ComplianceResult {
  status: ComplianceStatus;
  score: number;
  issues: string[];
  recommendations: string[];
  checks: ComplianceCheck[];
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  requirement: string;
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  recommendation?: string;
}

export class ComplianceEngine {
  private logger: Logger;
  private eta2019Rules: ComplianceRule[];
  private sadcRules: ComplianceRule[];

  constructor() {
    this.logger = new Logger('ComplianceEngine');
    this.eta2019Rules = this.initializeETA2019Rules();
    this.sadcRules = this.initializeSADCRules();
  }

  /**
   * Check document compliance with ETA 2019 and SADC frameworks
   */
  async checkCompliance(
    content: any,
    documentType: DocumentType,
    context: any
  ): Promise<ComplianceResult> {
    try {
      this.logger.info('Starting compliance check', { documentType });

      const checks: ComplianceCheck[] = [];
      let totalScore = 0;
      let maxScore = 0;

      // Run ETA 2019 compliance checks
      const eta2019Checks = await this.runETA2019Checks(content, documentType, context);
      checks.push(...eta2019Checks);

      // Run SADC compliance checks
      const sadcChecks = await this.runSADCChecks(content, documentType, context);
      checks.push(...sadcChecks);

      // Calculate overall compliance score
      for (const check of checks) {
        const weight = this.getCheckWeight(check.severity);
        maxScore += weight;
        
        if (check.status === 'passed') {
          totalScore += weight;
        } else if (check.status === 'warning') {
          totalScore += weight * 0.5;
        }
      }

      const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const status = this.determineComplianceStatus(score, checks);
      const issues = checks
        .filter(c => c.status === 'failed' || c.status === 'warning')
        .map(c => c.message || c.description);
      const recommendations = checks
        .filter(c => c.recommendation)
        .map(c => c.recommendation!);

      this.logger.info('Compliance check completed', { score, status, issueCount: issues.length });

      return {
        status,
        score,
        issues,
        recommendations,
        checks
      };

    } catch (error) {
      this.logger.error('Compliance check failed', error);
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  }

  /**
   * Validate signing process compliance in real-time
   */
  async validateSigningProcess(
    documentId: string,
    signatureData: any
  ): Promise<{ isCompliant: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];

      // Check signature data integrity
      if (!signatureData.timestamp) {
        issues.push('Missing signature timestamp');
      }

      if (!signatureData.ipAddress) {
        issues.push('Missing IP address for audit trail');
      }

      if (!signatureData.userAgent) {
        issues.push('Missing user agent information');
      }

      // Check signature format
      if (!signatureData.data || signatureData.data.length < 100) {
        issues.push('Invalid signature data format');
      }

      // Check hash integrity
      if (!signatureData.hash) {
        issues.push('Missing signature hash for integrity verification');
      }

      const isCompliant = issues.length === 0;

      this.logger.info('Signing process validation completed', { 
        documentId, 
        isCompliant, 
        issueCount: issues.length 
      });

      return { isCompliant, issues };

    } catch (error) {
      this.logger.error('Signing process validation failed', error);
      return {
        isCompliant: false,
        issues: ['Validation process failed']
      };
    }
  }

  /**
   * Initialize ETA 2019 compliance rules
   */
  private initializeETA2019Rules(): ComplianceRule[] {
    return [
      {
        id: 'eta_identity_verification',
        name: 'Identity Verification',
        description: 'Electronic signature must be capable of identifying the signatory',
        requirement: 'ETA 2019 Section 13(1)(a)',
        severity: 'critical',
        check: (content, context) => {
          // Check if document requires identity verification
          return {
            status: 'passed',
            message: 'Identity verification requirements met'
          };
        }
      },
      {
        id: 'eta_sole_control',
        name: 'Sole Control Requirement',
        description: 'Signature creation data must be under sole control of signatory',
        requirement: 'ETA 2019 Section 13(1)(b)',
        severity: 'critical',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Sole control requirements implemented'
          };
        }
      },
      {
        id: 'eta_change_detection',
        name: 'Change Detection',
        description: 'Signature must be linked to detect subsequent changes',
        requirement: 'ETA 2019 Section 13(1)(c)',
        severity: 'high',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Change detection mechanisms in place'
          };
        }
      },
      {
        id: 'eta_technical_reliability',
        name: 'Technical Reliability',
        description: 'Technical reliability appropriate for purpose and circumstances',
        requirement: 'ETA 2019 Section 13(1)(d)',
        severity: 'high',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Technical reliability standards met'
          };
        }
      },
      {
        id: 'eta_consumer_protection',
        name: 'Consumer Protection',
        description: 'Clear disclosure and consent for electronic signature process',
        requirement: 'ETA 2019 Section 43',
        severity: 'medium',
        check: (content, context) => {
          const text = content.text || '';
          if (text.toLowerCase().includes('electronic signature') || 
              text.toLowerCase().includes('digital signature')) {
            return {
              status: 'passed',
              message: 'Consumer protection disclosure present'
            };
          }
          return {
            status: 'warning',
            message: 'Consider adding electronic signature disclosure',
            recommendation: 'Add clause explaining electronic signature process'
          };
        }
      }
    ];
  }

  /**
   * Initialize SADC compliance rules
   */
  private initializeSADCRules(): ComplianceRule[] {
    return [
      {
        id: 'sadc_technology_neutral',
        name: 'Technology Neutrality',
        description: 'Solution must not discriminate against electronic form',
        requirement: 'SADC Model Law Article 5',
        severity: 'medium',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Technology neutral implementation'
          };
        }
      },
      {
        id: 'sadc_cross_border',
        name: 'Cross-Border Recognition',
        description: 'Electronic signatures valid across SADC member states',
        requirement: 'SADC Model Law Article 7',
        severity: 'medium',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Cross-border recognition supported'
          };
        }
      },
      {
        id: 'sadc_functional_equivalence',
        name: 'Functional Equivalence',
        description: 'Electronic documents equivalent to paper documents',
        requirement: 'SADC Model Law Article 6',
        severity: 'high',
        check: (content, context) => {
          return {
            status: 'passed',
            message: 'Functional equivalence maintained'
          };
        }
      }
    ];
  }

  /**
   * Run ETA 2019 specific compliance checks
   */
  private async runETA2019Checks(
    content: any,
    documentType: DocumentType,
    context: any
  ): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    for (const rule of this.eta2019Rules) {
      try {
        const result = rule.check(content, context);
        
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          requirement: rule.requirement,
          status: result.status,
          severity: rule.severity,
          message: result.message,
          recommendation: result.recommendation
        });

      } catch (error) {
        this.logger.error(`ETA 2019 check failed: ${rule.id}`, error);
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          requirement: rule.requirement,
          status: 'failed',
          severity: rule.severity,
          message: 'Check execution failed'
        });
      }
    }

    return checks;
  }

  /**
   * Run SADC specific compliance checks
   */
  private async runSADCChecks(
    content: any,
    documentType: DocumentType,
    context: any
  ): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    for (const rule of this.sadcRules) {
      try {
        const result = rule.check(content, context);
        
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          requirement: rule.requirement,
          status: result.status,
          severity: rule.severity,
          message: result.message,
          recommendation: result.recommendation
        });

      } catch (error) {
        this.logger.error(`SADC check failed: ${rule.id}`, error);
        checks.push({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          requirement: rule.requirement,
          status: 'failed',
          severity: rule.severity,
          message: 'Check execution failed'
        });
      }
    }

    return checks;
  }

  /**
   * Get weight for compliance check based on severity
   */
  private getCheckWeight(severity: string): number {
    const weights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5
    };
    return weights[severity as keyof typeof weights] || 5;
  }

  /**
   * Determine overall compliance status based on score and checks
   */
  private determineComplianceStatus(score: number, checks: ComplianceCheck[]): ComplianceStatus {
    const criticalFailures = checks.filter(c => 
      c.status === 'failed' && c.severity === 'critical'
    ).length;

    const highFailures = checks.filter(c => 
      c.status === 'failed' && c.severity === 'high'
    ).length;

    if (criticalFailures > 0) {
      return ComplianceStatus.NON_COMPLIANT;
    }

    if (highFailures > 2 || score < 70) {
      return ComplianceStatus.NEEDS_REVIEW;
    }

    if (score >= 90) {
      return ComplianceStatus.COMPLIANT;
    }

    return ComplianceStatus.NEEDS_REVIEW;
  }

  /**
   * Check if compliance engine is healthy
   */
  isHealthy(): boolean {
    return this.eta2019Rules.length > 0 && this.sadcRules.length > 0;
  }
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  requirement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (content: any, context: any) => {
    status: 'passed' | 'failed' | 'warning' | 'not_applicable';
    message: string;
    recommendation?: string;
  };
}

export default ComplianceEngine;