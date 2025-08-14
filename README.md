# BuffrSign Platform

> **Digital Signature Platform for Namibia and Southern Africa**
> 
> Fully compliant with Namibia's Electronic Transactions Act 4 of 2019 and designed for CRAN accreditation.

## 🚀 Project Overview

BuffrSign is a comprehensive digital signature platform specifically designed to comply with Namibia's Electronic Transactions Act 4 of 2019 and serve the Southern African market. It's positioned as the premier locally-compliant alternative to international solutions like DocuSign.

### Domains (Wireframes/TRD)

- Marketing site: https://www.buffr.ai
- Web app: https://www.sign.buffr.ai
- API: https://www.api.sign.buffr.ai

### Key Features

- ✅ **ETA 2019 Compliance** - Full compliance with Electronic Transactions Act
- ✅ **CRAN Accreditation Ready** - Designed for Communications Regulatory Authority of Namibia
- ✅ **Advanced Electronic Signatures** - PKI-based signatures with certificates
- ✅ **Audit Trail System** - Complete activity logging for compliance
- ✅ **Government Integration** - Ready for Namibian government system integration
- ✅ **Multi-tenant Architecture** - Support for individual, business, and government users

## 📊 Current Status

### ✅ Completed Components

1. **Database Setup** - Complete Supabase PostgreSQL database with 17 production tables
2. **Security Implementation** - Row Level Security (RLS) on all tables
3. **Compliance Framework** - ETA 2019 compliance tracking and CRAN accreditation support
4. **TypeScript Types** - Generated database types for frontend integration
5. **Documentation** - Comprehensive setup and migration documentation

### 🏗️ Architecture

```
BuffrSign Platform
├── 📱 Frontend (Next.js 14 + TypeScript)
├── 🔧 Backend (FastAPI - Python)
├── 📱 Mobile (React Native)
├── 🗄️ Database (Supabase PostgreSQL)
├── ☁️ Infrastructure (Docker + Kubernetes)
└── 📚 Documentation
```

## 🗄️ Database Schema

### Core Tables (6)
- `users` - User accounts and profiles
- `documents` - Document storage and metadata
- `recipients` - Document recipients and signing workflow
- `signatures` - Digital signatures and certificates
- `audit_trail` - Complete audit logging for compliance
- `templates` - Reusable document templates

### CRAN Compliance Tables (5)
- `cran_accreditation` - CRAN accreditation status and certificates
- `digital_certificates` - PKI certificates for advanced signatures
- `eta_compliance` - ETA 2019 compliance verification
- `security_events` - Security monitoring and threat detection
- `government_integration` - Government system integrations

### Advanced Features Tables (6)
- `subscription_plans` - Subscription tiers and pricing
- `user_subscriptions` - User subscription management
- `notifications` - User notifications and alerts
- `document_fields` - Signature field placement and metadata
- `document_versions` - Document version control
- `api_keys` - API access management

## 🔒 Security & Compliance

### Row Level Security (RLS)
- ✅ All 17 tables have RLS enabled
- ✅ User-specific data access policies
- ✅ Document sharing controls
- ✅ API key restrictions

### ETA 2019 Compliance
- ✅ Section 17: Legal recognition of data messages
- ✅ Section 20: Electronic signature requirements
- ✅ Section 21: Original information integrity
- ✅ Section 24: Electronic record retention

### CRAN Accreditation Features
- ✅ Security service provider status tracking
- ✅ Digital certificate authority capabilities
- ✅ Compliance database maintenance
- ✅ Security audit support

## 💰 Subscription Plans

| Plan | Monthly | Yearly | Documents | Users | Features |
|------|---------|--------|-----------|-------|----------|
| Individual | N$150 | N$1,500 | 5 | 1 | Simple signatures, basic templates |
| Small Business | N$400 | N$4,000 | 50 | 5 | Advanced signatures, bulk signing |
| Enterprise | N$1,200 | N$12,000 | 500 | 25 | Qualified signatures, CRAN compliance |
| Government | N$2,000 | N$20,000 | 1,000 | 50 | Government integration, 24/7 support |

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Query + Zustand
- **Authentication**: Supabase Auth

### Backend
- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage

### Database
- **Platform**: Supabase
- **Database**: PostgreSQL 17.4.1
- **Security**: Row Level Security (RLS)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Custom logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker
- Supabase CLI (optional)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buffrsign-platform
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill values. Key variables:
     - Frontend (`apps/web`):
       - `NEXT_PUBLIC_SUPABASE_URL`
       - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       - `NEXT_PUBLIC_API_URL` (default `http://localhost:8003`)
       - `NEXT_PUBLIC_API_KEY` (optional; forwards as `x-api-key`)
     - Backend (`apps/api`):
       - `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
       - `BUFFRSIGN_API_KEY` (optional; enables API key auth)
       - `LLAMAINDEX_ENABLE` (optional; `1` to enable LlamaIndex features)

4. **Install dependencies**
   ```bash
   # Frontend (Next.js)
   cd apps/web && npm install
   
   # Backend (FastAPI)
   cd apps/api && pip install -r requirements.txt  # or: uv pip install -e .
   ```

5. **Start development servers**
   ```bash
   # Frontend (Next.js)
   cd apps/web && npm run dev
   
    # Backend (FastAPI)
    cd apps/api && uvicorn app:app --reload --host 0.0.0.0 --port 8003
   ```

## 📁 Project Structure

```
buffrsign-platform/
├── 📱 apps/web/                 # Next.js frontend application
├── 🔧 apps/api/                 # FastAPI backend API
├── 📱 mobile/                   # React Native mobile app
├── 🗄️ supabase/                # Database migrations and types
│   ├── migrations/              # Database migration files
│   └── database.types.ts        # TypeScript database types
├── ☁️ infrastructure/           # Docker and deployment configs
├── 📚 docs/                     # Project documentation
├── 🧪 tests/                    # Test suites
├── 📜 scripts/                  # Build and deployment scripts
└── ⚙️ config/                   # Configuration files
```

## 🔧 Development

### Database Migrations
```bash
# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --project-id inqoltqqfneqfltcqlmx > supabase/database.types.ts
```

### API Development (FastAPI)
```bash
cd apps/api
uvicorn app:app --reload
```

### Frontend Development
```bash
cd apps/web
npm run dev
```

## 📚 Documentation

- [Database Setup Summary](./SUPABASE_SETUP_SUMMARY.md) - Complete database configuration details
- [API Documentation](./docs/api/) - REST API documentation
- [Compliance Guide](./docs/compliance/) - ETA 2019 and CRAN compliance details
- [Deployment Guide](./docs/deployment/) - Production deployment instructions

## 🔒 Compliance & Security

### ETA 2019 Compliance
BuffrSign is designed to fully comply with Namibia's Electronic Transactions Act 4 of 2019:

- **Section 17**: Legal recognition of data messages
- **Section 20**: Electronic signature requirements
- **Section 21**: Original information integrity
- **Section 24**: Electronic record retention

### CRAN Accreditation
The platform supports CRAN (Communications Regulatory Authority of Namibia) accreditation:

- Security service provider status
- Digital certificate authority capabilities
- Compliance database maintenance
- Security audit support

### Security Features
- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Encrypted data storage
- Complete audit trail system
- IP address and user agent tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@buffrsign.ai
- **Documentation**: [docs.buffrsign.ai](https://docs.sign.buffr.ai)
- **Issues**: [GitHub Issues](https://github.com/buffrsign/platform/issues)

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] Database schema design and implementation
- [x] Basic authentication system
- [x] Document upload and storage
- [x] Simple signature functionality

### Phase 2: Advanced Features 🚧
- [ ] Advanced electronic signatures
- [ ] CRAN accreditation integration
- [ ] Government system integration
- [ ] Mobile application

### Phase 3: Enterprise Features 📋
- [ ] Multi-tenant architecture
- [ ] Advanced audit trails
- [ ] API integrations
- [ ] Performance optimization

### Phase 4: Scale & Compliance 📋
- [ ] Production deployment
- [ ] Security audits
- [ ] Compliance certifications
- [ ] International expansion

---

**BuffrSign** - Empowering Namibia with legally compliant digital signatures 🇳🇦
