from dataclasses import dataclass
from typing import Union


@dataclass
class QueueInfo:
    url: str
    attributes: Union[dict, None] = None
