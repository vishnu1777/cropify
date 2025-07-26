import { format } from 'date-fns';
import type { CropPrice, ChartData } from '../types';

/**
 * Format price with appropriate currency symbol and decimals
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

/**
 * Format percentage change with appropriate sign and color
 */
export const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
};

/**
 * Generate chart colors for different datasets
 */
export const generateChartColors = (count: number): string[] => {
    const colors = [
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Amber
        '#8B5CF6', // Violet
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#F97316', // Orange
        '#6366F1', // Indigo
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
};

/**
 * Convert crop price data to Chart.js format
 */
export const convertToChartData = (
    priceData: CropPrice[],
    groupBy: 'month' | 'year' = 'month'
): ChartData => {
    if (priceData.length === 0) {
        return {
            labels: [],
            datasets: [],
        };
    }

    // Sort data by year and month
    const sortedData = [...priceData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    let labels: string[];
    let data: number[];

    if (groupBy === 'year') {
        // Group by year and calculate average
        const yearlyData = new Map<number, number[]>();

        sortedData.forEach((item) => {
            if (!yearlyData.has(item.year)) {
                yearlyData.set(item.year, []);
            }
            yearlyData.get(item.year)!.push(item.price);
        });

        labels = Array.from(yearlyData.keys()).map(year => year.toString());
        data = Array.from(yearlyData.values()).map(prices =>
            prices.reduce((sum, price) => sum + price, 0) / prices.length
        );
    } else {
        // Monthly data
        labels = sortedData.map((item) =>
            format(new Date(item.year, item.month - 1), 'MMM yyyy')
        );
        data = sortedData.map((item) => item.price);
    }

    const cropName = priceData[0].crop;
    const colors = generateChartColors(1);

    return {
        labels,
        datasets: [
            {
                label: `${cropName.charAt(0).toUpperCase() + cropName.slice(1)} Price`,
                data,
                borderColor: colors[0],
                backgroundColor: colors[0] + '20', // Add transparency
                fill: false,
                tension: 0.4,
            },
        ],
    };
};

/**
 * Convert multiple crop data to comparison chart format
 */
export const convertToComparisonChartData = (
    cropDataMap: Record<string, CropPrice[]>
): ChartData => {
    const crops = Object.keys(cropDataMap);
    if (crops.length === 0) {
        return { labels: [], datasets: [] };
    }

    // Get common time periods across all crops
    const allYears = new Set<number>();
    Object.values(cropDataMap).forEach(data => {
        data.forEach(item => allYears.add(item.year));
    });

    const sortedYears = Array.from(allYears).sort();
    const labels = sortedYears.map(year => year.toString());
    const colors = generateChartColors(crops.length);

    const datasets = crops.map((crop, index) => {
        const cropData = cropDataMap[crop];

        // Calculate yearly averages
        const yearlyAverages = new Map<number, number>();

        cropData.forEach(item => {
            if (!yearlyAverages.has(item.year)) {
                const yearData = cropData.filter(d => d.year === item.year);
                const average = yearData.reduce((sum, d) => sum + d.price, 0) / yearData.length;
                yearlyAverages.set(item.year, average);
            }
        });

        const data = sortedYears.map(year => yearlyAverages.get(year) || 0);

        return {
            label: crop.charAt(0).toUpperCase() + crop.slice(1),
            data,
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            fill: false,
            tension: 0.4,
        };
    });

    return { labels, datasets };
};

/**
 * Calculate price statistics
 */
export const calculateStatistics = (priceData: CropPrice[]) => {
    if (priceData.length === 0) {
        return {
            average: 0,
            min: 0,
            max: 0,
            median: 0,
            volatility: 0,
        };
    }

    const prices = priceData.map(item => item.price).sort((a, b) => a - b);
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const average = sum / prices.length;

    const median = prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    return {
        average: Math.round(average * 100) / 100,
        min: Math.min(...prices),
        max: Math.max(...prices),
        median: Math.round(median * 100) / 100,
        volatility: Math.round(volatility * 100) / 100,
    };
};

/**
 * Get year range for a given dataset
 */
export const getYearRange = (priceData: CropPrice[]): { min: number; max: number } => {
    if (priceData.length === 0) {
        const currentYear = new Date().getFullYear();
        return { min: currentYear - 5, max: currentYear };
    }

    const years = priceData.map(item => item.year);
    return {
        min: Math.min(...years),
        max: Math.max(...years),
    };
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void => {
    let timeoutId: number;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func(...args), delay);
    };
};
