export interface SingleInferenceResult {
    winner: string
    probabilities: Record<string, number>
    tokens: string[]
    latency: number
    level?: string

    // NUEVOS CAMPOS REALES (deben venir del backend)
    originalText?: string
    cleanText?: string

    topTfidf?: Array<{ term: string; weight: number }>
}

export interface BatchInferenceResult {
    totalTickets: number
    processedCount: number
    rejectedCount: number

    f1Score: number
    accuracy: number

    bestModelName: string
    optimalAlpha?: number

    confusionMatrix?: number[][]
    labels?: string[]

    departmentDistribution?: Record<string, number>
    globalTfidf?: Array<{ term: string; weight: number }>

    speed: number
}