import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { createHash } from 'crypto';
import { Logger } from '@/utils/logger';

interface DocumentContent {
  text: string;
  metadata: {
    pageCount: number;
    wordCount: number;
    language: string;
    fileSize: number;
    mimeType: string;
    hash: string;
  };
  pages?: PageContent[];
  images?: ImageData[];
}

interface PageContent {
  pageNumber: number;
  text: string;
  layout?: LayoutInfo;
}

interface LayoutInfo {
  width: number;
  height: number;
  textBlocks: TextBlock[];
}

interface TextBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
}

interface ImageData {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data: Buffer;
  format: string;
}

export class DocumentProcessor {
  private logger: Logger;
  private supportedMimeTypes: Set<string>;

  constructor() {
    this.logger = new Logger('DocumentProcessor');
    this.supportedMimeTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html'
    ]);
  }

  /**
   * Extract content from document file
   */
  async extractContent(filePath: string): Promise<DocumentContent> {
    try {
      this.logger.info('Starting document content extraction', { filePath });

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      const mimeType = this.detectMimeType(filePath);

      if (!this.supportedMimeTypes.has(mimeType)) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const hash = this.calculateFileHash(fileBuffer);

      let content: DocumentContent;

      switch (mimeType) {
        case 'application/pdf':
          content = await this.extractPDFContent(fileBuffer);
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await this.extractWordContent(fileBuffer);
          break;
        case 'text/plain':
          content = await this.extractTextContent(fileBuffer);
          break;
        default:
          throw new Error(`Unsupported MIME type: ${mimeType}`);
      }

      // Add metadata
      content.metadata = {
        ...content.metadata,
        fileSize: stats.size,
        mimeType,
        hash,
        wordCount: this.countWords(content.text),
        language: this.detectLanguage(content.text)
      };

      this.logger.info('Document content extraction completed', {
        textLength: content.text.length,
        pageCount: content.metadata.pageCount,
        wordCount: content.metadata.wordCount
      });

      return content;

    } catch (error) {
      this.logger.error('Document content extraction failed', error);
      throw new Error(`Content extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract content from PDF file
   */
  private async extractPDFContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      const pdfData = await pdfParse(buffer);
      
      return {
        text: pdfData.text,
        metadata: {
          pageCount: pdfData.numpages,
          wordCount: 0, // Will be calculated later
          language: '', // Will be detected later
          fileSize: 0, // Will be set later
          mimeType: 'application/pdf',
          hash: '' // Will be calculated later
        },
        pages: this.extractPDFPages(pdfData)
      };

    } catch (error) {
      this.logger.error('PDF extraction failed', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract pages from PDF data
   */
  private extractPDFPages(pdfData: any): PageContent[] {
    const pages: PageContent[] = [];
    
    // This is a simplified implementation
    // In a real scenario, you'd use a more sophisticated PDF parsing library
    // to extract page-by-page content with layout information
    
    const textPerPage = Math.ceil(pdfData.text.length / pdfData.numpages);
    
    for (let i = 0; i < pdfData.numpages; i++) {
      const startIndex = i * textPerPage;
      const endIndex = Math.min((i + 1) * textPerPage, pdfData.text.length);
      
      pages.push({
        pageNumber: i + 1,
        text: pdfData.text.substring(startIndex, endIndex),
        layout: {
          width: 612, // Standard US Letter width
          height: 792, // Standard US Letter height
          textBlocks: [] // Would be populated with actual layout analysis
        }
      });
    }
    
    return pages;
  }

  /**
   * Extract content from Word document
   */
  private async extractWordContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      return {
        text: result.value,
        metadata: {
          pageCount: this.estimatePageCount(result.value),
          wordCount: 0, // Will be calculated later
          language: '', // Will be detected later
          fileSize: 0, // Will be set later
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          hash: '' // Will be calculated later
        }
      };

    } catch (error) {
      this.logger.error('Word document extraction failed', error);
      throw new Error(`Word document extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract content from plain text file
   */
  private async extractTextContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      const text = buffer.toString('utf-8');
      
      return {
        text,
        metadata: {
          pageCount: this.estimatePageCount(text),
          wordCount: 0, // Will be calculated later
          language: '', // Will be detected later
          fileSize: 0, // Will be set later
          mimeType: 'text/plain',
          hash: '' // Will be calculated later
        }
      };

    } catch (error) {
      this.logger.error('Text file extraction failed', error);
      throw new Error(`Text file extraction failed: ${error.message}`);
    }
  }

  /**
   * Detect MIME type from file extension
   */
  private detectMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.htm': 'text/html'
    };

    return mimeTypeMap[extension] || 'application/octet-stream';
  }

  /**
   * Calculate file hash for integrity verification
   */
  private calculateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Detect document language (simplified implementation)
   */
  private detectLanguage(text: string): string {
    // Simplified language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const afrikaansWords = ['die', 'en', 'van', 'in', 'op', 'vir', 'met', 'by', 'aan', 'uit', 'oor', 'onder'];
    
    const lowerText = text.toLowerCase();
    
    let englishScore = 0;
    let afrikaansScore = 0;
    
    englishWords.forEach(word => {
      const matches = (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      englishScore += matches;
    });
    
    afrikaansWords.forEach(word => {
      const matches = (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      afrikaansScore += matches;
    });
    
    if (englishScore > afrikaansScore) {
      return 'en';
    } else if (afrikaansScore > englishScore) {
      return 'af';
    } else {
      return 'en'; // Default to English
    }
  }

  /**
   * Estimate page count based on text length
   */
  private estimatePageCount(text: string): number {
    // Rough estimate: 500 words per page
    const wordsPerPage = 500;
    const wordCount = this.countWords(text);
    return Math.max(1, Math.ceil(wordCount / wordsPerPage));
  }

  /**
   * Extract metadata from document
   */
  async extractMetadata(filePath: string): Promise<Record<string, any>> {
    try {
      const stats = fs.statSync(filePath);
      const mimeType = this.detectMimeType(filePath);
      
      return {
        fileName: path.basename(filePath),
        fileSize: stats.size,
        mimeType,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(filePath)
      };

    } catch (error) {
      this.logger.error('Metadata extraction failed', error);
      return {};
    }
  }

  /**
   * Validate document format and structure
   */
  async validateDocument(filePath: string): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      if (!fs.existsSync(filePath)) {
        issues.push('File does not exist');
        return { isValid: false, issues };
      }

      const stats = fs.statSync(filePath);
      
      // Check file size (max 25MB)
      if (stats.size > 25 * 1024 * 1024) {
        issues.push('File size exceeds 25MB limit');
      }

      // Check file type
      const mimeType = this.detectMimeType(filePath);
      if (!this.supportedMimeTypes.has(mimeType)) {
        issues.push(`Unsupported file type: ${mimeType}`);
      }

      // Try to extract content to validate file integrity
      try {
        await this.extractContent(filePath);
      } catch (error) {
        issues.push(`File appears to be corrupted: ${error.message}`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      this.logger.error('Document validation failed', error);
      return {
        isValid: false,
        issues: [`Validation failed: ${error.message}`]
      };
    }
  }

  /**
   * Clean and normalize text content
   */
  cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]{2,}/g, ' ') // Remove excessive spaces
      .trim();
  }

  /**
   * Search for specific patterns in document
   */
  searchPatterns(text: string, patterns: string[]): Array<{ pattern: string; matches: number; positions: number[] }> {
    const results: Array<{ pattern: string; matches: number; positions: number[] }> = [];

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex) || [];
      const positions: number[] = [];

      let match;
      const searchRegex = new RegExp(pattern, 'gi');
      while ((match = searchRegex.exec(text)) !== null) {
        positions.push(match.index);
      }

      results.push({
        pattern,
        matches: matches.length,
        positions
      });
    });

    return results;
  }

  /**
   * Extract potential signature-related text
   */
  findSignatureText(text: string): string[] {
    const signaturePatterns = [
      /signature\s*[:_-]/gi,
      /sign\s*here/gi,
      /signed\s*by/gi,
      /date\s*[:_-]/gi,
      /initial\s*[:_-]/gi,
      /witness\s*[:_-]/gi,
      /notary\s*[:_-]/gi
    ];

    const matches: string[] = [];
    
    signaturePatterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return Array.from(new Set(matches)); // Remove duplicates
  }

  /**
   * Check if document processor is healthy
   */
  isHealthy(): boolean {
    return this.supportedMimeTypes.size > 0;
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.supportedMimeTypes);
  }
}

export default DocumentProcessor;