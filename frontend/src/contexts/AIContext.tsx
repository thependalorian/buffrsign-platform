import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documentId?: string;
  workflowId?: string;
}

interface AIAnalysis {
  id: string;
  documentId: string;
  summary: string;
  classification: string;
  signatureFields: Array<{
    id: string;
    type: string;
    page: number;
    position: { x: number; y: number; width: number; height: number };
    required: boolean;
    party?: string;
  }>;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
  riskScore: number;
  estimatedCompletionTime: number;
  timestamp: Date;
}

interface WorkflowOptimization {
  id: string;
  documentId: string;
  recommendedType: 'sequential' | 'parallel' | 'hybrid';
  optimizedOrder: Array<{
    partyId: string;
    order: number;
    estimatedTime: number;
    riskScore: number;
  }>;
  recommendations: string[];
  estimatedTotalTime: number;
  timestamp: Date;
}

interface AIContextType {
  // Chat state
  conversations: Record<string, AIMessage[]>;
  activeConversationId: string | null;
  isTyping: boolean;
  
  // Analysis state
  analyses: Record<string, AIAnalysis>;
  optimizations: Record<string, WorkflowOptimization>;
  
  // Chat actions
  sendMessage: (message: string, context?: { documentId?: string; workflowId?: string }) => Promise<void>;
  startNewConversation: (documentId?: string, workflowId?: string) => string;
  setActiveConversation: (conversationId: string) => void;
  clearConversation: (conversationId: string) => void;
  
  // Analysis actions
  analyzeDocument: (documentId: string) => Promise<AIAnalysis>;
  optimizeWorkflow: (documentId: string, parties: any[]) => Promise<WorkflowOptimization>;
  
  // Helper functions
  getDocumentAnalysis: (documentId: string) => AIAnalysis | undefined;
  getWorkflowOptimization: (documentId: string) => WorkflowOptimization | undefined;
  getConversationMessages: (conversationId: string) => AIMessage[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Record<string, AIMessage[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [optimizations, setOptimizations] = useState<Record<string, WorkflowOptimization>>({});
  
  const queryClient = useQueryClient();

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { 
      message: string; 
      context?: { documentId?: string; workflowId?: string } 
    }) => {
      const response = await api.ai.chat(message, context);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Add assistant response to conversation
      if (activeConversationId) {
        const assistantMessage: AIMessage = {
          id: data.messageId || `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          documentId: variables.context?.documentId,
          workflowId: variables.context?.workflowId
        };

        setConversations(prev => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] || []),
            assistantMessage
          ]
        }));
      }
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      setIsTyping(false);
    }
  });

  // Document analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.ai.analyzeDocument(documentId);
      return response.data;
    },
    onSuccess: (data, documentId) => {
      const analysis: AIAnalysis = {
        ...data,
        id: data.id || `analysis_${documentId}_${Date.now()}`,
        documentId,
        timestamp: new Date(data.timestamp || Date.now())
      };
      
      setAnalyses(prev => ({
        ...prev,
        [documentId]: analysis
      }));
      
      toast.success('Document analysis completed');
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze document');
    }
  });

  // Workflow optimization mutation
  const optimizationMutation = useMutation({
    mutationFn: async ({ documentId, parties }: { documentId: string; parties: any[] }) => {
      const response = await api.ai.optimizeWorkflow(documentId, parties);
      return response.data;
    },
    onSuccess: (data, { documentId }) => {
      const optimization: WorkflowOptimization = {
        ...data,
        id: data.id || `optimization_${documentId}_${Date.now()}`,
        documentId,
        timestamp: new Date(data.timestamp || Date.now())
      };
      
      setOptimizations(prev => ({
        ...prev,
        [documentId]: optimization
      }));
      
      toast.success('Workflow optimization completed');
    },
    onError: (error) => {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize workflow');
    }
  });

  // Chat actions
  const sendMessage = async (
    message: string, 
    context?: { documentId?: string; workflowId?: string }
  ) => {
    if (!activeConversationId) {
      const newConversationId = startNewConversation(context?.documentId, context?.workflowId);
      setActiveConversation(newConversationId);
    }

    // Add user message to conversation
    const userMessage: AIMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      documentId: context?.documentId,
      workflowId: context?.workflowId
    };

    if (activeConversationId) {
      setConversations(prev => ({
        ...prev,
        [activeConversationId]: [
          ...(prev[activeConversationId] || []),
          userMessage
        ]
      }));
    }

    setIsTyping(true);
    await chatMutation.mutateAsync({ message, context });
  };

  const startNewConversation = (documentId?: string, workflowId?: string): string => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setConversations(prev => ({
      ...prev,
      [conversationId]: []
    }));
    
    return conversationId;
  };

  const setActiveConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const clearConversation = (conversationId: string) => {
    setConversations(prev => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
    
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  // Analysis actions
  const analyzeDocument = async (documentId: string): Promise<AIAnalysis> => {
    const result = await analysisMutation.mutateAsync(documentId);
    return analyses[documentId] || result;
  };

  const optimizeWorkflow = async (
    documentId: string, 
    parties: any[]
  ): Promise<WorkflowOptimization> => {
    const result = await optimizationMutation.mutateAsync({ documentId, parties });
    return optimizations[documentId] || result;
  };

  // Helper functions
  const getDocumentAnalysis = (documentId: string): AIAnalysis | undefined => {
    return analyses[documentId];
  };

  const getWorkflowOptimization = (documentId: string): WorkflowOptimization | undefined => {
    return optimizations[documentId];
  };

  const getConversationMessages = (conversationId: string): AIMessage[] => {
    return conversations[conversationId] || [];
  };

  const value: AIContextType = {
    // Chat state
    conversations,
    activeConversationId,
    isTyping,
    
    // Analysis state
    analyses,
    optimizations,
    
    // Chat actions
    sendMessage,
    startNewConversation,
    setActiveConversation,
    clearConversation,
    
    // Analysis actions
    analyzeDocument,
    optimizeWorkflow,
    
    // Helper functions
    getDocumentAnalysis,
    getWorkflowOptimization,
    getConversationMessages
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};