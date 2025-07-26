export interface CropPrice {
    id: string;
    crop: string;
    year: number;
    month: number;
    price: number;
    unit: string;
    source: string;
    region?: string;
    quality?: string;
    isPrediction?: boolean;
    confidenceInterval?: {
        lower: number;
        upper: number;
    };
}

export interface CropTrend {
    crop: string;
    year: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    unit: string;
    changePercent?: number;
}

export interface ApiResponse<T> {
    data: T[];
    success: boolean;
    message?: string;
    totalRecords?: number;
    page?: number;
    limit?: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill?: boolean;
        tension?: number;
    }[];
}

export interface CropOption {
    value: string;
    label: string;
    category?: string;
}

export interface FilterOptions {
    selectedCrop: string;
    selectedYear: number;
    startYear: number;
    endYear: number;
    region?: string;
    showPredictions: boolean;
    predictionMonths: number;
}

export type ChartType = 'line' | 'bar' | 'doughnut' | 'area';

export interface PriceStatistics {
    crop: string;
    year: number;
    average: number;
    min: number;
    max: number;
    median: number;
    trend: 'up' | 'down' | 'stable';
    volatility: number;
}

export interface PredictionModel {
    name: string;
    accuracy: number;
    description: string;
    lastUpdated: Date;
}

export interface ForecastResult {
    predictions: CropPrice[];
    confidence: number;
    model: string;
    accuracy: number;
    metadata: {
        methodsUsed: string[];
        dataPoints: number;
        forecastHorizon: number;
    };
}
