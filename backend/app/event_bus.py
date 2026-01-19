"""
Simple Event Bus for Decoupled Architecture
Enables event-driven workflows and easy extensibility
"""

from typing import Dict, List, Callable, Any
from datetime import datetime
import json


class EventBus:
    """
    Lightweight event emitter/listener
    In production, replace with RabbitMQ/Kafka
    """
    
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}
        self._event_history: List[Dict] = []
    
    def on(self, event_type: str, handler: Callable):
        """
        Register event listener
        
        Example:
            event_bus.on("TICKET_CREATED", log_to_audit)
        """
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        
        self._listeners[event_type].append(handler)
        print(f"📡 Registered listener for {event_type}")
    
    def emit(self, event_type: str, data: Dict[str, Any]):
        """
        Emit event to all registered listeners
        
        Example:
            event_bus.emit("TICKET_CREATED", {"ticket_id": 1, "title": "..."})
        """
        
        # Log event
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        self._event_history.append(event)
        
        print(f"\n📡 EVENT EMITTED: {event_type}")
        print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
        
        # Call all listeners
        if event_type in self._listeners:
            for handler in self._listeners[event_type]:
                try:
                    handler(data)
                except Exception as e:
                    print(f"   ⚠️  Listener failed: {str(e)}")
    
    def get_recent_events(self, limit: int = 50) -> List[Dict]:
        """Get recent events for debugging"""
        return self._event_history[-limit:]


# Global singleton
event_bus = EventBus()
