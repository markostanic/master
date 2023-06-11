from dataclasses import dataclass

from pydantic import Field


@dataclass
class Hpa:
    replicas: int
    minPods: int
    maxPods: int
