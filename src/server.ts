import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Import BuffrSign components
import { BuffrSignAIAgent } from './ai/BuffrSignAIAgent';
import { Logger, createLoggerMiddleware } from './utils/logger';
import { 
  DocumentUploadRequest, 
  DocumentSendRequest, 
  SignDocumentRequest,
  APIResponse,
  User,
  Document,
  Party,
  BuffrSignConfig
} from './types';

// Load environment variables
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: User;
  requestId?: string;
}

export class BuffrSignServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private logger: Logger;
  private aiAgent: BuffrSignAIAgent;
  private config: BuffrSignConfig;

  constructor() {
    this.logger = new Logger('BuffrSignServer');
    this.config = this.loadConfiguration();
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: this.config.server.cors.origin,
        credentials: this.config.server.cors.credentials
      }
    });

    this.initializeAIAgent();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private loadConfiguration(): BuffrSignConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost',
        cors: {
          origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
          credentials: true
        }
      },
      database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/buffsign',
        ssl: process.env.NODE_ENV === 'production',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20')
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD
      },
      storage: {
        provider: (process.env.STORAGE_PROVIDER as any) || 'aws',
        bucket: process.env.STORAGE_BUCKET || 'buffsign-documents',
        region: process.env.STORAGE_REGION || 'af-south-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
      },
      ai: {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        llamaIndexConfig: {},
        embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        chatModel: process.env.CHAT_MODEL || 'gpt-4-turbo-preview'
      },
      notifications: {
        email: {
          provider: (process.env.EMAIL_PROVIDER as any) || 'sendgrid',
          apiKey: process.env.EMAIL_API_KEY,
          from: process.env.EMAIL_FROM || 'noreply@buffsign.com'
        },
        sms: {
          provider: 'twilio',
          accountSid: process.env.TWILIO_ACCOUNT_SID || '',
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          from: process.env.TWILIO_FROM || ''
        }
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100')
        }
      },
      compliance: {
        eta2019: {
          enabled: process.env.ETA_2019_ENABLED !== 'false',
          strictMode: process.env.ETA_2019_STRICT_MODE === 'true'
        },
        sadc: {
          enabled: process.env.SADC_ENABLED !== 'false',
          countries: process.env.SADC_COUNTRIES?.split(',') || ['NA', 'ZA', 'BW', 'ZM', 'ZW']
        }
      }
    };
  }

  private async initializeAIAgent(): Promise<void> {
    try {
      this.aiAgent = new BuffrSignAIAgent({
        openaiApiKey: this.config.ai.openaiApiKey,
        modelName: this.config.ai.chatModel,
        embeddingModel: this.config.ai.embeddingModel,
        temperature: 0.1,
        maxTokens: 4096,
        enableLogging: true
      });

      this.logger.info('AI Agent initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AI Agent', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }));

    // CORS
    this.app.use(cors({
      origin: this.config.server.cors.origin,
      credentials: this.config.server.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.security.rateLimiting.windowMs,
      max: this.config.security.rateLimiting.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Request parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging middleware
    this.app.use(createLoggerMiddleware('HTTP'));

    // Request ID middleware
    this.app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.requestId) {
        req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // File upload configuration
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        cb(null, `${uniqueSuffix}_${file.originalname}`);
      }
    });

    const upload = multer({
      storage,
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 1
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
      }
    });

    this.app.use('/api/documents/upload', upload.single('file'));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          aiAgent: this.aiAgent.getHealthStatus(),
          database: { status: 'healthy' }, // Would check actual DB connection
          redis: { status: 'healthy' }, // Would check actual Redis connection
          storage: { status: 'healthy' } // Would check actual storage connection
        }
      };

      res.json(healthStatus);
    });

    // Authentication routes
    this.setupAuthRoutes();

    // Document management routes
    this.setupDocumentRoutes();

    // Signing routes
    this.setupSigningRoutes();

    // AI routes
    this.setupAIRoutes();

    // Workflow routes
    this.setupWorkflowRoutes();

    // User management routes
    this.setupUserRoutes();

    // Admin routes
    this.setupAdminRoutes();

    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static(path.join(__dirname, '../frontend/dist')));
      
      this.app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
      });
    }
  }

  private setupAuthRoutes(): void {
    // User registration
    this.app.post('/api/auth/register', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { email, name, password, role } = req.body;

        // Validate input
        if (!email || !name || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email, name, and password are required',
            timestamp: new Date(),
            requestId: req.requestId
          } as APIResponse);
        }

        // In a real implementation, this would:
        // 1. Hash the password
        // 2. Check if user already exists
        // 3. Create user in database
        // 4. Send verification email
        // 5. Return JWT token

        this.logger.audit('user_registration_attempt', {
          email,
          name,
          role: role || 'individual'
        }, {
          requestId: req.requestId,
          ipAddress: req.ip
        });

        // Mock successful registration
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name,
          role: role || 'individual',
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            language: 'en',
            timezone: 'Africa/Windhoek',
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            security: {
              twoFactorEnabled: false,
              biometricEnabled: false
            }
          }
        };

        res.status(201).json({
          success: true,
          data: {
            user: mockUser,
            token: 'mock_jwt_token',
            expiresIn: '24h'
          },
          message: 'User registered successfully. Please verify your email.',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('User registration failed', error, {
          requestId: req.requestId,
          ipAddress: req.ip
        });

        res.status(500).json({
          success: false,
          error: 'Registration failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // User login
    this.app.post('/api/auth/login', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password are required',
            timestamp: new Date(),
            requestId: req.requestId
          } as APIResponse);
        }

        this.logger.audit('user_login_attempt', { email }, {
          requestId: req.requestId,
          ipAddress: req.ip
        });

        // Mock successful login
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name: 'John Doe',
          role: 'individual',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          settings: {
            language: 'en',
            timezone: 'Africa/Windhoek',
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            security: {
              twoFactorEnabled: false,
              biometricEnabled: false
            }
          }
        };

        res.json({
          success: true,
          data: {
            user: mockUser,
            token: 'mock_jwt_token',
            expiresIn: '24h'
          },
          message: 'Login successful',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('User login failed', error, {
          requestId: req.requestId,
          ipAddress: req.ip
        });

        res.status(500).json({
          success: false,
          error: 'Login failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // Logout
    this.app.post('/api/auth/logout', async (req: AuthenticatedRequest, res: Response) => {
      this.logger.audit('user_logout', {}, {
        requestId: req.requestId,
        userId: req.user?.id,
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date(),
        requestId: req.requestId
      } as APIResponse);
    });
  }

  private setupDocumentRoutes(): void {
    // Upload document
    this.app.post('/api/documents/upload', async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded',
            timestamp: new Date(),
            requestId: req.requestId
          } as APIResponse);
        }

        const uploadRequest: DocumentUploadRequest = req.body;
        const filePath = req.file.path;

        this.logger.document('upload_started', 'document_upload', {
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        }, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        // Analyze document with AI
        const aiAnalysis = await this.aiAgent.analyzeDocument(filePath, {
          userId: req.user?.id || 'anonymous',
          documentId: `doc_${Date.now()}`,
          userRole: req.user?.role
        });

        // Create document record (mock)
        const document: Partial<Document> = {
          id: `doc_${Date.now()}`,
          title: uploadRequest.title || req.file.originalname,
          originalName: req.file.originalname,
          filePath: filePath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedBy: req.user?.id || 'anonymous',
          status: 'analyzing',
          createdAt: new Date(),
          updatedAt: new Date(),
          parties: [],
          signatureFields: [],
          aiAnalysis,
          auditTrail: [],
          metadata: {
            pageCount: 1,
            language: 'en',
            documentHash: 'mock_hash',
            originalHash: 'mock_original_hash',
            version: 1,
            tags: uploadRequest.tags || []
          }
        };

        this.logger.document(document.id!, 'upload_completed', {
          analysisId: aiAnalysis.id,
          documentType: aiAnalysis.documentType,
          complianceScore: aiAnalysis.complianceScore
        }, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        res.status(201).json({
          success: true,
          data: {
            document,
            aiAnalysis
          },
          message: 'Document uploaded and analyzed successfully',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Document upload failed', error, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        res.status(500).json({
          success: false,
          error: 'Document upload failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // Get document
    this.app.get('/api/documents/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const documentId = req.params.id;

        // Mock document retrieval
        const mockDocument: Partial<Document> = {
          id: documentId,
          title: 'Sample Service Agreement',
          originalName: 'service-agreement.pdf',
          status: 'ready',
          createdAt: new Date(),
          updatedAt: new Date(),
          uploadedBy: req.user?.id || 'mock_user'
        };

        res.json({
          success: true,
          data: mockDocument,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Document retrieval failed', error, {
          requestId: req.requestId,
          documentId: req.params.id
        });

        res.status(500).json({
          success: false,
          error: 'Document retrieval failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // Send document for signing
    this.app.post('/api/documents/:id/send', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const documentId = req.params.id;
        const sendRequest: DocumentSendRequest = req.body;

        this.logger.document(documentId, 'send_for_signing', {
          partyCount: sendRequest.parties.length,
          workflowType: sendRequest.workflowType
        }, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        // Mock document sending
        const mockWorkflow = {
          id: `workflow_${Date.now()}`,
          documentId,
          status: 'active',
          parties: sendRequest.parties.map((party, index) => ({
            id: `party_${Date.now()}_${index}`,
            ...party,
            status: 'pending',
            signingOrder: index + 1,
            isRequired: true,
            signatures: []
          })),
          createdAt: new Date()
        };

        res.json({
          success: true,
          data: mockWorkflow,
          message: 'Document sent for signing successfully',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Document send failed', error, {
          requestId: req.requestId,
          documentId: req.params.id
        });

        res.status(500).json({
          success: false,
          error: 'Failed to send document for signing',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupSigningRoutes(): void {
    // Get signing session
    this.app.get('/api/sign/:token', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const token = req.params.token;

        // Mock signing session
        const mockSession = {
          documentId: 'doc_123',
          partyId: 'party_456',
          document: {
            title: 'Service Agreement',
            summary: 'This service agreement outlines the terms between the service provider and client.',
            pages: 2
          },
          signatureFields: [
            {
              id: 'field_1',
              page: 1,
              x: 100,
              y: 700,
              width: 200,
              height: 50,
              type: 'signature',
              required: true
            }
          ]
        };

        res.json({
          success: true,
          data: mockSession,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Signing session retrieval failed', error, {
          requestId: req.requestId,
          signingToken: req.params.token
        });

        res.status(500).json({
          success: false,
          error: 'Failed to load signing session',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // Sign document
    this.app.post('/api/sign/:token', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const token = req.params.token;
        const signRequest: SignDocumentRequest = req.body;

        this.logger.signature('doc_123', 'party_456', 'signature_applied', {
          signatureCount: signRequest.signatures.length,
          ipAddress: signRequest.ipAddress,
          userAgent: signRequest.userAgent
        }, {
          requestId: req.requestId
        });

        // Mock signature processing
        res.json({
          success: true,
          data: {
            documentId: 'doc_123',
            status: 'signed',
            completedAt: new Date()
          },
          message: 'Document signed successfully',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Document signing failed', error, {
          requestId: req.requestId,
          signingToken: req.params.token
        });

        res.status(500).json({
          success: false,
          error: 'Document signing failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupAIRoutes(): void {
    // AI chat
    this.app.post('/api/ai/chat', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { message, context } = req.body;

        if (!message) {
          return res.status(400).json({
            success: false,
            error: 'Message is required',
            timestamp: new Date(),
            requestId: req.requestId
          } as APIResponse);
        }

        const aiResponse = await this.aiAgent.handleConversation(message, {
          userId: req.user?.id || 'anonymous',
          ...context
        });

        this.logger.ai('chat_completion', this.config.ai.chatModel, 0, {
          messageLength: message.length,
          responseLength: aiResponse.text.length,
          intent: aiResponse.intent
        }, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        res.json({
          success: true,
          data: aiResponse,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('AI chat failed', error, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        res.status(500).json({
          success: false,
          error: 'AI chat failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });

    // Workflow optimization
    this.app.post('/api/ai/optimize-workflow', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { documentId, parties } = req.body;

        if (!documentId || !parties) {
          return res.status(400).json({
            success: false,
            error: 'Document ID and parties are required',
            timestamp: new Date(),
            requestId: req.requestId
          } as APIResponse);
        }

        // Mock document analysis for optimization
        const mockAnalysis = {
          id: 'analysis_123',
          documentId,
          documentType: 'service_agreement',
          confidence: 0.95,
          summary: 'Service agreement between two parties',
          recommendations: [],
          complianceScore: 94,
          complianceStatus: 'compliant',
          estimatedCompletionTime: 24,
          riskFactors: [],
          detectedFields: [],
          processedAt: new Date(),
          processingTime: 1500
        };

        const optimization = await this.aiAgent.optimizeWorkflow(parties, mockAnalysis as any);

        res.json({
          success: true,
          data: optimization,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Workflow optimization failed', error, {
          requestId: req.requestId,
          documentId: req.body.documentId
        });

        res.status(500).json({
          success: false,
          error: 'Workflow optimization failed',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupWorkflowRoutes(): void {
    // Get workflow status
    this.app.get('/api/workflows/:id/status', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const workflowId = req.params.id;

        // Mock workflow status
        const mockStatus = {
          workflowId,
          status: 'in_progress',
          completedParties: 1,
          totalParties: 2,
          estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
          lastActivity: new Date()
        };

        res.json({
          success: true,
          data: mockStatus,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Workflow status retrieval failed', error, {
          requestId: req.requestId,
          workflowId: req.params.id
        });

        res.status(500).json({
          success: false,
          error: 'Failed to get workflow status',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupUserRoutes(): void {
    // Get user profile
    this.app.get('/api/user/profile', async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Mock user profile
        const mockProfile = {
          id: req.user?.id || 'user_123',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'individual',
          isVerified: true,
          settings: {
            language: 'en',
            timezone: 'Africa/Windhoek',
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        };

        res.json({
          success: true,
          data: mockProfile,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('User profile retrieval failed', error, {
          requestId: req.requestId,
          userId: req.user?.id
        });

        res.status(500).json({
          success: false,
          error: 'Failed to get user profile',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupAdminRoutes(): void {
    // System metrics
    this.app.get('/api/admin/metrics', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const metrics = {
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
          },
          business: {
            totalDocuments: 1250,
            documentsThisMonth: 180,
            activeWorkflows: 45,
            completedSignatures: 2340
          },
          ai: {
            analysesPerformed: 890,
            averageAnalysisTime: 2300,
            complianceScore: 94.2
          }
        };

        res.json({
          success: true,
          data: metrics,
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);

      } catch (error) {
        this.logger.error('Metrics retrieval failed', error, {
          requestId: req.requestId
        });

        res.status(500).json({
          success: false,
          error: 'Failed to get system metrics',
          timestamp: new Date(),
          requestId: req.requestId
        } as APIResponse);
      }
    });
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      this.logger.info('WebSocket client connected', {
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent']
      });

      // Join document rooms for real-time updates
      socket.on('join_document', (documentId: string) => {
        socket.join(`document_${documentId}`);
        this.logger.info('Client joined document room', {
          socketId: socket.id,
          documentId
        });
      });

      // Handle AI chat via WebSocket
      socket.on('ai_chat', async (data: { message: string; context?: any }) => {
        try {
          const response = await this.aiAgent.handleConversation(data.message, {
            userId: 'websocket_user',
            ...data.context
          });

          socket.emit('ai_response', response);
        } catch (error) {
          this.logger.error('WebSocket AI chat failed', error);
          socket.emit('ai_error', { error: 'AI chat failed' });
        }
      });

      socket.on('disconnect', () => {
        this.logger.info('WebSocket client disconnected', {
          socketId: socket.id
        });
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date(),
        requestId: (req as any).requestId
      } as APIResponse);
    });

    // Global error handler
    this.app.use((error: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      this.logger.error('Unhandled error', error, {
        requestId: req.requestId,
        url: req.url,
        method: req.method,
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        timestamp: new Date(),
        requestId: req.requestId
      } as APIResponse);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      this.logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      this.logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });

    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection', new Error(String(reason)), {
        promise: promise.toString()
      });
    });
  }

  public start(): void {
    this.server.listen(this.config.server.port, this.config.server.host, () => {
      this.logger.info(`BuffrSign server started`, {
        port: this.config.server.port,
        host: this.config.server.host,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  private shutdown(): void {
    this.logger.info('Starting graceful shutdown');
    
    this.server.close(() => {
      this.logger.info('HTTP server closed');
      
      // Close database connections, cleanup resources, etc.
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      this.logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new BuffrSignServer();
  server.start();
}

export default BuffrSignServer;