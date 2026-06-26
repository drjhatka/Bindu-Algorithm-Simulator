// frontend/app/page.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { AlgorithmType, DatasetOption, PRELOADED_DATASETS } from './config/simulation';

export default function SimulatorOrchestrator() {
  // 1. Initialize State
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('lr');
  
  // Default to the first dataset that matches the default algorithm
  const defaultDataset = PRELOADED_DATASETS.find(d => d.type === 'lr') || null;
  const [selectedDataset, setSelectedDataset] = useState<DatasetOption | null>(defaultDataset);
  
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [epochs, setEpochs] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 2. Execution Handler (To be connected to FastAPI later)
  const handleStartSimulation = () => {
    setIsSimulating(true);
    console.log("Starting simulation with:", { selectedAlgo, selectedDataset, learningRate, epochs });
    
    // Simulating a network request delay for now
    setTimeout(() => setIsSimulating(false), 2000); 
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* 3. Inject State and Handlers into the Sidebar */}
      <Sidebar 
        selectedAlgo={selectedAlgo}
        onAlgoChange={setSelectedAlgo}
        
        selectedDataset={selectedDataset}
        onDatasetChange={setSelectedDataset}
        
        learningRate={learningRate}
        onLrChange={setLearningRate}
        
        epochs={epochs}
        onEpochsChange={setEpochs}
        
        onStartSimulation={handleStartSimulation}
        isSimulating={isSimulating}
      />

      {/* 4. The Canvas Area (Where our charts will go) */}
      <main className="flex-1 p-8 flex flex-col relative">
         <div className="w-full h-full border border-slate-800 rounded-lg bg-slate-900 flex items-center justify-center">
            <p className="text-slate-500">
               {selectedDataset 
                 ? `Canvas ready for ${selectedDataset.name} visualization.` 
                 : "Select a dataset to begin."}
            </p>
         </div>
      </main>
    </div>
  );
}