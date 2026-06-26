export type AlgorithmType = 'lr' | 'classification' | 'knn';

export interface DatasetOption {
  id: string;
  name: string;
  type: AlgorithmType;
  X: number[][];
  y: number[];
}

export const ALGORITHMS = [
  { id: 'lr', name: 'Linear Regression' },
  { id: 'classification', name: 'Logistic Regression' },
  { id: 'knn', name: 'K-Nearest Neighbors' },
] as const;

export const PRELOADED_DATASETS: DatasetOption[] = [
  {
    id: 'housing-simple',
    name: 'Housing Prices (1 Feature)',
    type: 'lr',
    X: [[1.1], [1.5], [1.8], [2.4], [3.0], [3.5]], 
    y: [2.1, 2.9, 3.4, 4.3, 5.2, 5.9]              
  },
  {
    id: 'synthetic-binary',
    name: 'Exam Pass/Fail Profile',
    type: 'classification',
    X: [[1.0], [2.0], [3.5], [4.0], [6.0], [8.0]], 
    y: [0, 0, 0, 1, 1, 1]                          
  }
];