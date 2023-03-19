from pydantic import BaseModel, Field
from typing import Union
from dataclasses import dataclass

@dataclass
class QueueInfo():
  url: str
  attributes: Union[dict, None] = None