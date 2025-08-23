// BuffrSign Platform Types
export enum DocumentType {
  SERVICE_AGREEMENT = 'service_agreement',
  NDA = 'nda',
  PARTNERSHIP_AGREEMENT = 'partnership_agreement',
  EMPLOYMENT_CONTRACT = 'employment_contract',
  PURCHASE_ORDER = 'purchase_order',
  INVOICE = 'invoice',
  LEGAL_DOCUMENT = 'legal_document',
  UNKNOWN = 'unknown'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  NEEDS_REVIEW = 'needs_review',
  PENDING_ANALYSIS = 'pending_analysis',
  UNKNOWN = 'unknown'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  ANALYZING = 'analyzing',
  READY = 'ready',
  SENT = 'sent',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum PartyStatus {
  PENDING = 'pending',
  NOTIFIED = 'notified',
  VIEWED = 'viewed',
  IN_PROGRESS = 'in_progress',
  SIGNED = 'signed',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum SignatureFieldType {
  SIGNATURE = 'signature',
  INITIAL = 'initial',
  DATE = 'date',
  TEXT = 'text',
  CHECKBOX = 'checkbox',
  RADIO = 'radio'
}

export enum UserRole {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin'
}

export enum WorkflowType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  HYBRID = 'hybrid'
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  settings: UserSettings;
  subscription?: Subscription;
}

export interface UserSettings {
  language: 'en' | 'af';
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
  };
}

export interface Subscription {
  id: string;
  plan: 'free' | 'personal' | 'business' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  documentsPerMonth: number;
  documentsUsed: number;
  renewsAt: Date;
  features: string[];
}

export interface Document {
  id: string;
  title: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  parties: Party[];
  signatureFields: SignatureField[];
  aiAnalysis?: AIAnalysis;
  workflow?: Workflow;
  auditTrail: AuditEntry[];
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  pageCount: number;
  language: string;
  documentHash: string;
  originalHash: string;
  version: number;
  tags: string[];
  category?: string;
}

export interface Party {
  id: string;
  documentId: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: PartyStatus;
  signingOrder: number;
  isRequired: boolean;
  notifiedAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  signingToken?: string;
  tokenExpiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  signatures: Signature[];
}

export interface SignatureField {
  id: string;
  documentId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: SignatureFieldType;
  label?: string;
  placeholder?: string;
  required: boolean;
  partyId: string;
  value?: string;
  signedAt?: Date;
  validation?: FieldValidation;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  required: boolean;
  errorMessage?: string;
}

export interface Signature {
  id: string;
  fieldId: string;
  partyId: string;
  type: 'drawn' | 'typed' | 'uploaded' | 'biometric';
  data: string; // Base64 encoded signature data
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  certificate?: string;
  hash: string;
}

export interface AIAnalysis {
  id: string;
  documentId: string;
  documentType: DocumentType;
  confidence: number;
  summary: string;
  recommendations: AIRecommendation[];
  complianceScore: number;
  complianceStatus: ComplianceStatus;
  estimatedCompletionTime: number; // in hours
  riskFactors: RiskFactor[];
  detectedFields: DetectedField[];
  processedAt: Date;
  processingTime: number; // in milliseconds
}

export interface AIRecommendation {
  type: 'optimization' | 'compliance' | 'security' | 'workflow';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired?: boolean;
  suggestedAction?: string;
}

export interface RiskFactor {
  type: 'legal' | 'security' | 'completion' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
}

export interface DetectedField {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: SignatureFieldType;
  confidence: number;
  suggestedRole?: string;
  text?: string;
}

export interface Workflow {
  id: string;
  documentId: string;
  type: WorkflowType;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  parties: string[]; // Party IDs in order
  notifications: NotificationSchedule[];
  reminders: ReminderSchedule[];
  rules: WorkflowRule[];
}

export interface WorkflowRule {
  type: 'require_all' | 'require_majority' | 'require_specific' | 'conditional';
  condition?: string;
  action: string;
  params?: Record<string, any>;
}

export interface NotificationSchedule {
  id: string;
  type: 'email' | 'sms' | 'push';
  trigger: 'immediate' | 'delayed' | 'reminder';
  delay?: number; // in minutes
  template: string;
  recipients: string[];
  sent: boolean;
  sentAt?: Date;
}

export interface ReminderSchedule {
  id: string;
  partyId: string;
  scheduledFor: Date;
  type: 'email' | 'sms' | 'push';
  sent: boolean;
  sentAt?: Date;
}

export interface AuditEntry {
  id: string;
  documentId: string;
  userId?: string;
  partyId?: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AIConversation {
  id: string;
  userId: string;
  documentId?: string;
  messages: AIMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface ComplianceCheck {
  documentId: string;
  framework: 'ETA_2019' | 'SADC_MODEL' | 'ECTA' | 'CUSTOM';
  status: ComplianceStatus;
  score: number;
  checks: ComplianceRule[];
  checkedAt: Date;
  checkedBy: 'system' | 'human';
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  requirement: string;
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  recommendation?: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  documentId?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Request/Response interfaces
export interface DocumentUploadRequest {
  title?: string;
  category?: string;
  tags?: string[];
  autoAnalyze?: boolean;
}

export interface DocumentSendRequest {
  parties: {
    email: string;
    name: string;
    role: string;
    phone?: string;
  }[];
  workflowType: WorkflowType;
  message?: string;
  expiresInDays?: number;
  requireAllSignatures?: boolean;
  useAIOptimization?: boolean;
}

export interface SignDocumentRequest {
  signatures: {
    fieldId: string;
    type: 'drawn' | 'typed' | 'uploaded';
    data: string;
  }[];
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface AIOptimizationRequest {
  documentId: string;
  parties: Party[];
  preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeCompletion?: boolean;
    allowParallel?: boolean;
  };
}

export interface SearchFilters {
  status?: DocumentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  documentType?: DocumentType[];
  tags?: string[];
  partyEmail?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Configuration interfaces
export interface BuffrSignConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  database: {
    url: string;
    ssl: boolean;
    maxConnections: number;
  };
  redis: {
    url: string;
    password?: string;
  };
  storage: {
    provider: 'aws' | 'azure' | 'gcp' | 'local';
    bucket: string;
    region: string;
    credentials: Record<string, string>;
  };
  ai: {
    openaiApiKey: string;
    llamaIndexConfig: Record<string, any>;
    embeddingModel: string;
    chatModel: string;
  };
  notifications: {
    email: {
      provider: 'sendgrid' | 'ses' | 'smtp';
      apiKey?: string;
      from: string;
    };
    sms: {
      provider: 'twilio';
      accountSid: string;
      authToken: string;
      from: string;
    };
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };
  compliance: {
    eta2019: {
      enabled: boolean;
      strictMode: boolean;
    };
    sadc: {
      enabled: boolean;
      countries: string[];
    };
  };
}