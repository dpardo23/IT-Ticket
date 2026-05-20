export interface TokenWeight {
    token: string;
    weight: number;
}

export interface ProbabilityData {
    name: string;
    value: number;
}

export interface SingleInferenceResult {
    title: string;
    original: string;
    tokens: string[];
    topTfidf: TokenWeight[];
    probabilities: ProbabilityData[];
    winner: string;
    level: string; // <-- AÑADIDO PARA LA UI
}

export interface BatchInferenceStats {
    name: string;
    tickets: number;
    desc: string;
    color: string;
}

export interface LevelStats {
    name: string;
    value: number;
}

export interface BatchInferenceResult {
    processedCount: number;
    totalTickets: number;
    accuracy: number;
    f1Score: number;
    confusionMatrix: number[][];
    optimalAlpha: number;
    bestModelName: string;
    speed: number;
    departmentStats: BatchInferenceStats[];
    globalTfidf: TokenWeight[];
    levelStats: LevelStats[];
}