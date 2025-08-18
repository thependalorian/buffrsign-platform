"""
Base Agent Class for BuffrSign AI Agents

Provides common functionality and interfaces for all BuffrSign agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AgentEvent(BaseModel):
    """Base event model for agent communications"""
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agent_id: str
    data: Dict[str, Any] = Field(default_factory=dict)


class AgentState(BaseModel):
    """Base state model for agent state management"""
    agent_id: str
    status: str = "idle"
    current_task: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BaseBuffrSignAgent(ABC):
    """
    Base class for all BuffrSign AI agents.
    
    Provides common functionality for:
    - State management
    - Event handling
    - Logging and monitoring
    - Error handling
    - LlamaIndex integration
    """
    
    def __init__(self, agent_id: str, config: Optional[Dict[str, Any]] = None):
        self.agent_id = agent_id
        self.config = config or {}
        self.state = AgentState(agent_id=agent_id)
        self.event_history: List[AgentEvent] = []
        
        # LlamaIndex components
        self._llama_index_available = False
        self._query_engine = None
        self._knowledge_base = None
        
        self._initialize_llama_index()
    
    def _initialize_llama_index(self):
        """Initialize LlamaIndex components if available"""
        try:
            from llama_index.core import VectorStoreIndex
            from llama_index.core.schema import Document
            from llama_index.core.agent import ReActAgent
            from llama_index.core.tools import FunctionTool
            
            self._llama_index_available = True
            logger.info(f"LlamaIndex initialized for agent {self.agent_id}")
            
        except ImportError as e:
            logger.warning(f"LlamaIndex not available for agent {self.agent_id}: {e}")
            self._llama_index_available = False
    
    def update_state(self, status: str, task: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
        """Update agent state"""
        self.state.status = status
        if task:
            self.state.current_task = task
        if metadata:
            self.state.metadata.update(metadata)
        self.state.updated_at = datetime.utcnow()
        
        logger.info(f"Agent {self.agent_id} state updated: {status}")
    
    def emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit an agent event"""
        event = AgentEvent(
            event_type=event_type,
            agent_id=self.agent_id,
            data=data
        )
        self.event_history.append(event)
        
        logger.info(f"Agent {self.agent_id} emitted event: {event_type}")
        return event
    
    def get_events(self, event_type: Optional[str] = None) -> List[AgentEvent]:
        """Get agent events, optionally filtered by type"""
        if event_type:
            return [e for e in self.event_history if e.event_type == event_type]
        return self.event_history
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return results.
        
        Args:
            input_data: Input data for processing
            
        Returns:
            Processing results
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Return list of agent capabilities"""
        pass
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "agent_id": self.agent_id,
            "state": self.state.dict(),
            "capabilities": self.get_capabilities(),
            "llama_index_available": self._llama_index_available,
            "event_count": len(self.event_history)
        }
    
    def _create_llama_index_tool(self, name: str, description: str, func) -> Any:
        """Create a LlamaIndex tool from a function"""
        if not self._llama_index_available:
            return None
            
        try:
            from llama_index.core.tools import FunctionTool
            return FunctionTool.from_defaults(
                fn=func,
                name=name,
                description=description
            )
        except Exception as e:
            logger.error(f"Failed to create LlamaIndex tool {name}: {e}")
            return None
    
    def _create_llama_index_agent(self, tools: List[Any], system_prompt: str) -> Any:
        """Create a LlamaIndex agent with tools"""
        if not self._llama_index_available:
            return None
            
        try:
            from llama_index.core.agent import ReActAgent
            return ReActAgent.from_tools(
                tools=tools,
                system_prompt=system_prompt
            )
        except Exception as e:
            logger.error(f"Failed to create LlamaIndex agent: {e}")
            return None
