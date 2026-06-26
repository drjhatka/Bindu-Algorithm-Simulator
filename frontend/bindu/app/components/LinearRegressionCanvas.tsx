// frontend/app/components/LinearRegressionCanvas.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DatasetOption } from '../config/simulation';

interface CanvasProps {
  dataset: DatasetOption;
  learningRate: number;
  epochs: number;
  isSimulating: boolean;
  onSimulationEnd: () => void;
}

interface FrameState {
  epoch: number;
  loss: number;
  predictions: number[];
}

export default function LinearRegressionCanvas({
  dataset,
  learningRate,
  epochs,
  isSimulating,
  onSimulationEnd
}: CanvasProps) {
  const [currentFrame, setCurrentFrame] = useState<FrameState | null>(null);
  const [lossHistory, setLossHistory] = useState<{ epoch: number, loss: number }[]>([]);
  
  // Ref to track if we need to abort the fetch if the component unmounts
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isSimulating) return;

    // Reset state for new run
    setCurrentFrame(null);
    setLossHistory([]);
    abortControllerRef.current = new AbortController();

    const runSimulation = async () => {
      try {
        const response = await fetch('http://localhost:8000/simulate/linear-regression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            X: dataset.X,
            y: dataset.y,
            learning_rate: learningRate,
            epochs: epochs
          }),
          signal: abortControllerRef.current?.signal
        });

        if (!response.body) throw new Error('ReadableStream not supported.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Split the stream by SSE double-newline boundaries
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // Keep the last incomplete chunk in the buffer

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.replace('data: ', '');
              const parsed: FrameState = JSON.parse(dataStr);
              
              setCurrentFrame(parsed);
              setLossHistory(prev => [...prev, { epoch: parsed.epoch, loss: parsed.loss }]);
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Simulation stream error:', error);
        }
      } finally {
        onSimulationEnd();
      }
    };

    runSimulation();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isSimulating, dataset, learningRate, epochs, onSimulationEnd]);

  // --- SVG Scaling Math ---
  // To draw points dynamically, we map the raw data coordinates to a 0-100 percentage scale.
  const xValues = dataset.X.map(x => x[0]);
  const yValues = dataset.y;
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues, ...(currentFrame?.predictions || []));
  const maxY = Math.max(...yValues, ...(currentFrame?.predictions || []));

  const scaleX = (val: number) => ((val - minX) / (maxX - minX || 1)) * 100;
  // Invert Y because SVG coordinates start top-left
  const scaleY = (val: number) => 100 - (((val - minY) / (maxY - minY || 1)) * 100);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Metrics Header */}
      <div className="flex justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div>
          <span className="text-slate-400 text-sm">Epoch: </span>
          <span className="text-white font-mono">{currentFrame?.epoch ?? 0} / {epochs}</span>
        </div>
        <div>
          <span className="text-slate-400 text-sm">Current Loss (MSE): </span>
          <span className="text-white font-mono">{currentFrame?.loss.toFixed(4) ?? '---'}</span>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-[400px]">
        {/* Main Scatter & Regression Line Plot */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 relative">
          <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-500 uppercase">Model Fit</h3>
          <svg className="w-full h-full overflow-visible mt-6" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw Scatter Points (True Data) */}
            {dataset.X.map((x, i) => (
              <circle 
                key={i} 
                cx={`${scaleX(x[0])}%`} 
                cy={`${scaleY(dataset.y[i])}%`} 
                r="1.5" 
                className="fill-blue-500" 
              />
            ))}
            
            {/* Draw Regression Line (Predictions) */}
            {currentFrame && (
              <polyline
                fill="none"
                stroke="#10b981" // emerald-500
                strokeWidth="0.8"
                points={dataset.X.map((x, i) => `${scaleX(x[0])},${scaleY(currentFrame.predictions[i])}`).join(' ')}
                className="transition-all duration-75"
              />
            )}
          </svg>
        </div>

        {/* Loss Curve Plot */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 relative">
           <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-500 uppercase">Loss Descent</h3>
           <svg className="w-full h-full overflow-visible mt-6" viewBox="0 0 100 100" preserveAspectRatio="none">
              {lossHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#ef4444" // red-500
                  strokeWidth="0.8"
                  points={lossHistory.map((pt, i) => {
                    const lx = (i / (epochs - 1)) * 100;
                    // Scale loss relative to the first (highest) loss
                    const maxLoss = lossHistory[0].loss;
                    const ly = 100 - ((pt.loss / maxLoss) * 100);
                    return `${lx},${ly}`;
                  }).join(' ')}
                />
              )}
           </svg>
        </div>
      </div>
    </div>
  );
}