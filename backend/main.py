from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import asyncio

#---import our engine---
from algorithms.linear_regression import LinearRegressionStream

#---setup FastAPI app---
app = FastAPI(title="Bindu Algorithm Simulator API")

#---setup CORS to allow Next.js (running on port 3000) to communicate with FastAPI---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#---define the input payload structure---
class SimulationRequest(BaseModel):
    X: List[List[float]]
    y: List[float]
    learning_rate: float = 0.01
    epochs: int = 100

#---define the endpoint for linear regression simulation---
@app.post("/simulate/linear-regression")
async def simulate_linear_regression(request: SimulationRequest):
    """
    Initializes the linear regression engine and streams the state
    back to the client using Server-Sent Events (SSE).
    """
    
    # --- instantiate linear regression model---
    model = LinearRegressionStream(
        learning_rate=request.learning_rate, 
        epochs=request.epochs
    )

    # --- define the asynchronous generator for SSE---
    async def event_generator():
        # Get the pure Python generator we built in Phase 2
        step_generator = model.stream_steps(request.X, request.y)
        
        for state in step_generator:
            # SSE requires data to be formatted as a string starting with "data: " 
            # and ending with two newline characters "\n\n"
            yield f"data: {json.dumps(state)}\n\n"
            
            # Artificial delay so the frontend animation isn't instantaneous.
            # We want to actually watch the line converge!
            await asyncio.sleep(0.05) 

    # 3. Return the StreamingResponse
    return StreamingResponse(event_generator(), media_type="text/event-stream")