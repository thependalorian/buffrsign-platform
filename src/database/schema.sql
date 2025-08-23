-- BuffrSign Platform Database Schema
-- PostgreSQL 14+ with full ETA 2019 compliance and CRAN accreditation support

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('individual', 'business', 'enterprise', 'admin');
CREATE TYPE document_status AS ENUM ('draft', 'analyzing', 'ready', 'sent', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE party_status AS ENUM ('pending', 'notified', 'viewed', 'in_progress', 'signed', 'declined', 'expired');
CREATE TYPE signature_field_type AS ENUM ('signature', 'initial', 'date', 'text', 'checkbox', 'radio');
CREATE TYPE document_type AS ENUM ('service_agreement', 'nda', 'partnership_agreement', 'employment_contract', 'purchase_order', 'invoice', 'legal_document', 'unknown');
CREATE TYPE compliance_status AS ENUM ('compliant', 'non_compliant', 'needs_review', 'pending_analysis', 'unknown');
CREATE TYPE workflow_type AS ENUM ('sequential', 'parallel', 'hybrid');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'individual',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- User settings
    language VARCHAR(2) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Windhoek',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Security settings
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, personal, business, enterprise
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, past_due, unpaid
    documents_per_month INTEGER NOT NULL DEFAULT 5,
    documents_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    renews_at TIMESTAMP WITH TIME ZONE,
    features JSONB DEFAULT '[]',
    
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_expires_at (expires_at)
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status document_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Document metadata
    page_count INTEGER DEFAULT 1,
    language VARCHAR(2) DEFAULT 'en',
    document_hash VARCHAR(64) NOT NULL, -- SHA-256 hash
    original_hash VARCHAR(64) NOT NULL, -- Original file hash
    version INTEGER DEFAULT 1,
    tags TEXT[],
    category VARCHAR(100),
    
    -- AI Analysis results
    ai_analysis_id UUID,
    ai_confidence DECIMAL(3,2),
    ai_document_type document_type,
    ai_summary TEXT,
    ai_estimated_completion INTEGER, -- hours
    ai_processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    compliance_score INTEGER DEFAULT 0, -- 0-100
    compliance_status compliance_status DEFAULT 'pending_analysis',
    compliance_checked_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_documents_uploaded_by (uploaded_by),
    INDEX idx_documents_status (status),
    INDEX idx_documents_created_at (created_at),
    INDEX idx_documents_document_type (ai_document_type),
    INDEX idx_documents_compliance_status (compliance_status)
);

-- Parties table (document recipients/signers)
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(100) NOT NULL, -- e.g., 'client', 'contractor', 'witness'
    status party_status NOT NULL DEFAULT 'pending',
    signing_order INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    decline_reason TEXT,
    
    -- Signing token (for public access)
    signing_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit information
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255), -- City, Country
    
    INDEX idx_parties_document_id (document_id),
    INDEX idx_parties_email (email),
    INDEX idx_parties_status (status),
    INDEX idx_parties_signing_token (signing_token),
    INDEX idx_parties_signing_order (signing_order)
);

-- Signature fields table
CREATE TABLE signature_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
    page INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    type signature_field_type NOT NULL,
    label VARCHAR(255),
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT TRUE,
    value TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Validation rules
    validation_pattern VARCHAR(255),
    min_length INTEGER,
    max_length INTEGER,
    error_message VARCHAR(500),
    
    INDEX idx_signature_fields_document_id (document_id),
    INDEX idx_signature_fields_party_id (party_id),
    INDEX idx_signature_fields_type (type)
);

-- Signatures table
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES signature_fields(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'drawn', 'typed', 'uploaded', 'biometric'
    data TEXT NOT NULL, -- Base64 encoded signature data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    location VARCHAR(255),
    
    -- Security and validation
    certificate TEXT, -- PKI certificate if applicable
    hash VARCHAR(64) NOT NULL, -- SHA-256 hash of signature data
    
    INDEX idx_signatures_field_id (field_id),
    INDEX idx_signatures_party_id (party_id),
    INDEX idx_signatures_timestamp (timestamp)
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type workflow_type NOT NULL DEFAULT 'sequential',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, completed, cancelled, expired
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    
    -- AI optimization data
    ai_optimized BOOLEAN DEFAULT FALSE,
    success_probability DECIMAL(3,2), -- 0.00-1.00
    estimated_completion INTEGER, -- hours
    optimization_reasons TEXT[],
    
    -- Workflow rules and settings
    require_all_signatures BOOLEAN DEFAULT TRUE,
    allow_parallel BOOLEAN DEFAULT FALSE,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_interval INTEGER DEFAULT 72, -- hours
    
    INDEX idx_workflows_document_id (document_id),
    INDEX idx_workflows_status (status),
    INDEX idx_workflows_created_by (created_by)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery settings
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    attempts INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Template and context
    template_name VARCHAR(100),
    template_data JSONB DEFAULT '{}',
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_party_id (party_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_scheduled_for (scheduled_for)
);

-- Audit trail table
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_audit_trail_document_id (document_id),
    INDEX idx_audit_trail_user_id (user_id),
    INDEX idx_audit_trail_action (action),
    INDEX idx_audit_trail_timestamp (timestamp)
);

-- AI conversations table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Conversation context
    context JSONB DEFAULT '{}',
    
    INDEX idx_ai_conversations_user_id (user_id),
    INDEX idx_ai_conversations_document_id (document_id),
    INDEX idx_ai_conversations_created_at (created_at)
);

-- AI messages table
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI metadata
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_ai_messages_conversation_id (conversation_id),
    INDEX idx_ai_messages_timestamp (timestamp)
);

-- Compliance checks table
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    framework VARCHAR(50) NOT NULL, -- 'ETA_2019', 'SADC_MODEL', 'ECTA', 'CUSTOM'
    status compliance_status NOT NULL,
    score INTEGER NOT NULL, -- 0-100
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_by VARCHAR(20) DEFAULT 'system', -- 'system' or 'human'
    
    -- Detailed results
    checks JSONB NOT NULL DEFAULT '[]', -- Array of individual check results
    
    INDEX idx_compliance_checks_document_id (document_id),
    INDEX idx_compliance_checks_framework (framework),
    INDEX idx_compliance_checks_status (status)
);

-- Digital certificates table (for PKI infrastructure)
CREATE TABLE digital_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certificate_data TEXT NOT NULL, -- PEM encoded certificate
    private_key_hash VARCHAR(64), -- Hash of encrypted private key
    public_key TEXT NOT NULL,
    
    -- Certificate details
    serial_number VARCHAR(100) NOT NULL,
    issuer VARCHAR(500) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status and usage
    status VARCHAR(20) DEFAULT 'active', -- active, revoked, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason VARCHAR(100),
    
    -- CRAN compliance
    cran_accredited BOOLEAN DEFAULT FALSE,
    cran_certificate_id VARCHAR(255),
    
    INDEX idx_digital_certificates_user_id (user_id),
    INDEX idx_digital_certificates_serial_number (serial_number),
    INDEX idx_digital_certificates_status (status),
    INDEX idx_digital_certificates_valid_to (valid_to)
);

-- Security events table
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_security_events_user_id (user_id),
    INDEX idx_security_events_event_type (event_type),
    INDEX idx_security_events_severity (severity),
    INDEX idx_security_events_timestamp (timestamp)
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of the actual key
    
    -- Permissions and scope
    scopes TEXT[] DEFAULT '{}', -- Array of allowed scopes
    rate_limit INTEGER DEFAULT 1000, -- Requests per hour
    
    -- Status and lifecycle
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    total_requests BIGINT DEFAULT 0,
    
    INDEX idx_api_keys_user_id (user_id),
    INDEX idx_api_keys_key_hash (key_hash),
    INDEX idx_api_keys_active (active)
);

-- System metrics table (for monitoring and analytics)
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional dimensions
    tags JSONB DEFAULT '{}',
    
    INDEX idx_system_metrics_name (metric_name),
    INDEX idx_system_metrics_timestamp (timestamp)
);

-- Business analytics table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Event properties
    properties JSONB DEFAULT '{}',
    
    -- Session tracking
    session_id VARCHAR(255),
    
    INDEX idx_analytics_events_user_id (user_id),
    INDEX idx_analytics_events_event_name (event_name),
    INDEX idx_analytics_events_timestamp (timestamp)
);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_self_policy ON users
    FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

-- Documents: users can see documents they uploaded or are parties to
CREATE POLICY documents_owner_policy ON documents
    FOR ALL USING (
        uploaded_by = current_setting('app.current_user_id')::UUID
        OR id IN (
            SELECT p.document_id FROM parties p 
            WHERE p.email = current_setting('app.current_user_email')
        )
    );

-- Parties: users can see parties for documents they have access to
CREATE POLICY parties_document_access_policy ON parties
    FOR ALL USING (
        document_id IN (
            SELECT d.id FROM documents d WHERE 
            d.uploaded_by = current_setting('app.current_user_id')::UUID
            OR d.id IN (
                SELECT p.document_id FROM parties p 
                WHERE p.email = current_setting('app.current_user_email')
            )
        )
    );

-- Initial data
INSERT INTO users (email, name, password_hash, role, is_verified) VALUES
('admin@buffsign.com', 'BuffrSign Admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewtnvFOTwBDTjRmy', 'admin', TRUE),
('demo@buffsign.com', 'Demo User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewtnvFOTwBDTjRmy', 'business', TRUE);

-- Sample compliance framework data
INSERT INTO compliance_checks (document_id, framework, status, score, checks) VALUES
(uuid_generate_v4(), 'ETA_2019', 'compliant', 94, '[
    {"id": "eta_identity_verification", "status": "passed", "message": "Identity verification requirements met"},
    {"id": "eta_sole_control", "status": "passed", "message": "Sole control requirements implemented"},
    {"id": "eta_change_detection", "status": "passed", "message": "Change detection mechanisms in place"},
    {"id": "eta_technical_reliability", "status": "passed", "message": "Technical reliability standards met"},
    {"id": "eta_consumer_protection", "status": "warning", "message": "Consider adding electronic signature disclosure"}
]'::jsonb);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with ETA 2019 compliant identity management';
COMMENT ON TABLE documents IS 'Document storage with AI analysis and compliance tracking';
COMMENT ON TABLE parties IS 'Document signers with full audit trail for ETA 2019 compliance';
COMMENT ON TABLE signatures IS 'Digital signatures with PKI support and CRAN compliance';
COMMENT ON TABLE workflows IS 'AI-optimized multi-party signing workflows';
COMMENT ON TABLE compliance_checks IS 'ETA 2019 and SADC compliance verification results';
COMMENT ON TABLE digital_certificates IS 'PKI certificates for advanced electronic signatures';
COMMENT ON TABLE audit_trail IS 'Complete audit trail for legal compliance and admissibility';
COMMENT ON TABLE security_events IS 'Security monitoring for CRAN accreditation requirements';