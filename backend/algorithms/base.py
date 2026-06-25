from abc import ABC, abstractmethod
from typing import Generator, Dict, Any, List

class BaseAlgorithm(ABC):
    """
    Abstract Base Class representing the unified structural interface 
    for all simulation-capable algorithms in the Bindu Simulator.
    """
    #---initialize with hyperparameters---
    def __init__(self, **hyperparameters):
        self.hyperparameters = hyperparameters

    #---abstract method to be implemented by subclasses---
    @abstractmethod
    def stream_steps(self, X: List[List[float]], y: List[float]) -> Generator[Dict[str, Any], None, None]:
        """
        Executes the algorithm's routine and yields step-by-step metrics/states
        to feed our real-time frontend charts.
        
        Yields:
            Dict[str, Any]: A dictionary containing current epoch/step, 
                            model parameters (e.g., weights), and loss metrics.
        """
        pass