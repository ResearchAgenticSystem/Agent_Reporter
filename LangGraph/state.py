from dataclasses import dataclass, field
from typing import Optional

@dataclass
class ResearchState:
    topic: str
    research_summary: str = ""
    article: str = ""
    output_saved: bool = False
    message: str = ""
    llm: Optional[object] = field(default=None)