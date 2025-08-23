import * as winston from 'winston';
import * as path from 'path';

export interface LogContext {
  userId?: string;
  documentId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string = 'BuffrSign') {
    this.context = context;
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, context, ...meta }) => {
        const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}] [${context || this.context}] ${message}${metaString}`;
      })
    );

    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'app.log'),
        level: 'info',
        format: logFormat,
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10
      }),

      // Error file transport
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      })
    ];

    // Add audit log transport for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'audit.log'),
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 20
        })
      );
    }

    return winston.createLogger({
      level: 'debug',
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, { context: this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, { context: this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, { context: this.context, ...context });
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        context: this.context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        ...context
      });
    } else if (error) {
      this.logger.error(message, {
        context: this.context,
        error: JSON.stringify(error),
        ...context
      });
    } else {
      this.logger.error(message, { context: this.context, ...context });
    }
  }

  // Audit logging for security-sensitive operations
  audit(action: string, details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`AUDIT: ${action}`, {
      context: this.context,
      audit: true,
      action,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    this.logger.info(`PERFORMANCE: ${operation} completed in ${duration}ms`, {
      context: this.context,
      performance: true,
      operation,
      duration,
      ...context
    });
  }

  // Security event logging
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>, context?: LogContext): void {
    this.logger.warn(`SECURITY: ${event}`, {
      context: this.context,
      security: true,
      event,
      severity,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Compliance logging for regulatory requirements
  compliance(requirement: string, status: 'passed' | 'failed' | 'warning', details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`COMPLIANCE: ${requirement} - ${status.toUpperCase()}`, {
      context: this.context,
      compliance: true,
      requirement,
      status,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Business event logging
  business(event: string, details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`BUSINESS: ${event}`, {
      context: this.context,
      business: true,
      event,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Document lifecycle logging
  document(documentId: string, action: string, details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`DOCUMENT: ${action} - ${documentId}`, {
      context: this.context,
      document: true,
      documentId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Signature event logging
  signature(documentId: string, partyId: string, action: string, details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`SIGNATURE: ${action} - ${documentId}/${partyId}`, {
      context: this.context,
      signature: true,
      documentId,
      partyId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // API request logging
  apiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.logger.info(`API: ${method} ${url} - ${statusCode} (${duration}ms)`, {
      context: this.context,
      api: true,
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }

  // AI operation logging
  ai(operation: string, model: string, duration: number, details: Record<string, any>, context?: LogContext): void {
    this.logger.info(`AI: ${operation} using ${model} (${duration}ms)`, {
      context: this.context,
      ai: true,
      operation,
      model,
      duration,
      details,
      ...context
    });
  }

  // Create child logger with additional context
  child(additionalContext: Record<string, any>): Logger {
    const childLogger = new Logger(this.context);
    const originalCreateLogger = childLogger.createLogger.bind(childLogger);
    
    childLogger.createLogger = () => {
      const logger = originalCreateLogger();
      return logger.child(additionalContext);
    };
    
    childLogger.logger = childLogger.createLogger();
    return childLogger;
  }

  // Structured query for log analysis
  query(filters: {
    level?: string;
    context?: string;
    audit?: boolean;
    security?: boolean;
    compliance?: boolean;
    business?: boolean;
    fromTimestamp?: string;
    toTimestamp?: string;
  }): Promise<any[]> {
    // This would integrate with log aggregation service like ELK Stack
    // For now, return empty array
    return Promise.resolve([]);
  }

  // Log statistics
  getStats(): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    auditEvents: number;
    securityEvents: number;
  } {
    // This would integrate with log analytics
    return {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      auditEvents: 0,
      securityEvents: 0
    };
  }
}

// Global logger instance
export const logger = new Logger('BuffrSign');

// Logger middleware for Express
export const createLoggerMiddleware = (context: string = 'HTTP') => {
  const httpLogger = new Logger(context);
  
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    
    // Add request ID to request for downstream use
    req.requestId = requestId;
    
    // Log request start
    httpLogger.info(`${req.method} ${req.url} - START`, {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    });

    // Capture response end
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - start;
      
      httpLogger.apiRequest(
        req.method,
        req.url,
        res.statusCode,
        duration,
        {
          requestId,
          userId: req.user?.id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      );

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log rotation utility
export const setupLogRotation = () => {
  // This would set up log rotation with logrotate or similar
  // For now, winston handles file rotation with maxsize and maxFiles
};

// Emergency logging for critical failures
export const emergencyLog = (message: string, error?: Error) => {
  console.error(`EMERGENCY: ${new Date().toISOString()} - ${message}`);
  if (error) {
    console.error(error.stack);
  }
  
  // Could also send to external monitoring service
  // like Sentry, DataDog, or PagerDuty
};

export default Logger;