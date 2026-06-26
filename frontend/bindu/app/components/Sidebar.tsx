// frontend/app/components/Sidebar.tsx
'use client';

import React from 'react';
import { ALGORITHMS, PRELOADED_DATASETS, AlgorithmType, DatasetOption } from '../config/simulation';

interface SidebarProps {
  selectedAlgo: AlgorithmType;
  onAlgoChange: (algo: AlgorithmType) => void;
  selectedDataset: DatasetOption | null;
  onDatasetChange: (dataset: DatasetOption) => void;
  learningRate: number;
  onLrChange: (lr: number) => void;
  epochs: number;
  onEpochsChange: (epochs: number) => void;
  onStartSimulation: () => void;
  isSimulating: boolean;
}

export default function Sidebar({
  selectedAlgo,
  onAlgoChange,
  selectedDataset,
  onDatasetChange,
  learningRate,
  onLrChange,
  epochs,
  onEpochsChange,
  onStartSimulation,
  isSimulating,
}: SidebarProps) {
  
  // Dynamically filter datasets based on the chosen algorithm
  const availableDatasets = PRELOADED_DATASETS.filter(d => d.type === selectedAlgo);

  return (
    <aside className="w-80 bg-slate-900 text-slate-100 p-6 flex flex-col gap-6 border-r border-slate-800 h-screen">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Bindu</h1>
        <p className="text-xs text-slate-400 mt-1">Algorithm Simulator</p>
      </div>

      {/* Algorithm Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Algorithm Type</label>
        <select
          value={selectedAlgo}
          onChange={(e) => {
            const nextAlgo = e.target.value as AlgorithmType;
            onAlgoChange(nextAlgo);
            // Auto-select the first valid dataset when switching algorithms
            const firstMatch = PRELOADED_DATASETS.find(d => d.type === nextAlgo);
            if (firstMatch) onDatasetChange(firstMatch);
          }}
          disabled={isSimulating}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {ALGORITHMS.map(algo => (
            <option key={algo.id} value={algo.id}>{algo.name}</option>
          ))}
        </select>
      </div>

      {/* Dataset Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Preloaded Dataset</label>
        <select
          value={selectedDataset?.id || ''}
          onChange={(e) => {
            const dataset = PRELOADED_DATASETS.find(d => d.id === e.target.value);
            if (dataset) onDatasetChange(dataset);
          }}
          disabled={isSimulating}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {availableDatasets.map(ds => (
            <option key={ds.id} value={ds.id}>{ds.name}</option>
          ))}
        </select>
      </div>

      {/* Conditional Hyperparameters Layout */}
      {selectedAlgo !== 'knn' && (
        <div className="flex flex-col gap-4 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hyperparameters</h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Learning Rate</span>
              <span>{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.5"
              step="0.001"
              value={learningRate}
              onChange={(e) => onLrChange(parseFloat(e.target.value))}
              disabled={isSimulating}
              className="w-full accent-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Epochs</span>
              <span>{epochs}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={epochs}
              onChange={(e) => onEpochsChange(parseInt(e.target.value, 10))}
              disabled={isSimulating}
              className="w-full accent-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Execution Trigger */}
      <button
        onClick={onStartSimulation}
        disabled={isSimulating || !selectedDataset}
        className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-2.5 font-medium text-sm transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
      >
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>
    </aside>
  );
}