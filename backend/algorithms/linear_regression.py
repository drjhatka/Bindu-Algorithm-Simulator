from typing import Generator, Dict, Any, List
from .base import BaseAlgorithm
from  numpy import np

class LinearRegressionStream(BaseAlgorithm):
    def __init__(self, learning_rate: float = 0.01, epochs: int = 100):

        super().__init__(learning_rate=learning_rate, epochs=epochs)
        self.learning_rate = learning_rate
        self.epochs = epochs

    def stream_steps(self, 
                     X: List[List[float]], 
                     y: List[float]) -> Generator[Dict[str, Any], None, None]:
        """
        Executes Gradient Descent for multiple linear regression.
        Yields the state at each epoch for real-time visualization.
        """

        #---total number of data points
        num_samples = len(X)
        if num_samples == 0:
            return

        #---total number of feature columns
        num_features = len(X[0])
        
        # ---initialize weights and bias to zero---
        weights = np.zeros(num_features)
        bias = 0.0

        for epoch in range(self.epochs):
            predictions = []
            
            # ---calculate predictions
            for i in range(num_samples):
                y_pred = sum(X[i][j] * weights[j] for j in range(num_features)) + bias # sum of (feature * weight) + bias
                predictions.append(y_pred)
            
            # ---calculate loss (mean squared error)
            mse_loss = sum((predictions[i] - y[i]) ** 2 for i in range(num_samples)) / num_samples

            # ---yield current state (This payload goes to Next.js)
            yield {
                "epoch": epoch,
                "weights": weights.copy(),
                "bias": bias,
                "loss": mse_loss,
                "predictions": predictions # Frontend uses this to animate the regression line
            }

            # ---compute gradients
            dw = np.zeros(num_features)
            db = 0.0
            
            for i in range(num_samples):
                error = predictions[i] - y[i]
                db += error
                for j in range(num_features):
                    dw[j] += error * X[i][j]
                    
            db = (2 / num_samples) * db
            dw = [(2 / num_samples) * grad for grad in dw]

            # 6. Update Parameters
            bias -= self.learning_rate * db
            weights = [w - self.learning_rate * grad for w, grad in zip(weights, dw)]