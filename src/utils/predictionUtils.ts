import type { CropPrice } from '../types';

/**
 * Simple Moving Average for trend prediction
 */
export const calculateMovingAverage = (prices: number[], period: number): number[] => {
    const result: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
        const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        result.push(sum / period);
    }
    return result;
};

/**
 * Linear Regression for price prediction
 */
export const linearRegression = (xValues: number[], yValues: number[]): { slope: number; intercept: number; r2: number } => {
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared (coefficient of determination)
    const yMean = sumY / n;
    const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = yValues.reduce((sum, y, i) => {
        const predicted = slope * xValues[i] + intercept;
        return sum + Math.pow(y - predicted, 2);
    }, 0);

    const r2 = 1 - (residualSumSquares / totalSumSquares);

    return { slope, intercept, r2 };
};

/**
 * Exponential Smoothing for forecasting
 */
export const exponentialSmoothing = (prices: number[], alpha: number = 0.3): number[] => {
    const smoothed: number[] = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
        const smoothedValue = alpha * prices[i] + (1 - alpha) * smoothed[i - 1];
        smoothed.push(smoothedValue);
    }

    return smoothed;
};

/**
 * Seasonal decomposition and prediction
 */
export const seasonalForecast = (priceData: CropPrice[], monthsAhead: number): CropPrice[] => {
    // Group data by month to find seasonal patterns
    const monthlyPrices = new Map<number, number[]>();

    priceData.forEach(item => {
        if (!monthlyPrices.has(item.month)) {
            monthlyPrices.set(item.month, []);
        }
        monthlyPrices.get(item.month)!.push(item.price);
    });

    // Calculate seasonal factors (average for each month)
    const seasonalFactors = new Map<number, number>();
    const overallAverage = priceData.reduce((sum, item) => sum + item.price, 0) / priceData.length;

    for (let month = 1; month <= 12; month++) {
        const monthPrices = monthlyPrices.get(month) || [];
        if (monthPrices.length > 0) {
            const monthAverage = monthPrices.reduce((sum, price) => sum + price, 0) / monthPrices.length;
            seasonalFactors.set(month, monthAverage / overallAverage);
        } else {
            seasonalFactors.set(month, 1); // No seasonal effect if no data
        }
    }

    // Get recent trend using linear regression
    const recentData = priceData.slice(-24); // Last 2 years for trend
    const xValues = recentData.map((_, index) => index);
    const yValues = recentData.map(item => item.price);
    const { slope, intercept } = linearRegression(xValues, yValues);

    // Generate future predictions
    const predictions: CropPrice[] = [];
    const lastDate = new Date(Math.max(...priceData.map(item => new Date(item.year, item.month - 1).getTime())));

    for (let i = 1; i <= monthsAhead; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setMonth(futureDate.getMonth() + i);

        const year = futureDate.getFullYear();
        const month = futureDate.getMonth() + 1;

        // Calculate base trend price
        const trendPrice = slope * (recentData.length + i) + intercept;

        // Apply seasonal factor
        const seasonalFactor = seasonalFactors.get(month) || 1;
        const predictedPrice = trendPrice * seasonalFactor;

        // Add some random variation for realism (±5%)
        const variation = (Math.random() - 0.5) * 0.1;
        const finalPrice = predictedPrice * (1 + variation);

        predictions.push({
            id: `predicted-${priceData[0]?.crop}-${year}-${month}`,
            crop: priceData[0]?.crop || 'unknown',
            year,
            month,
            price: Math.round(finalPrice * 100) / 100,
            unit: priceData[0]?.unit || 'USD/metric ton',
            source: 'ML Prediction',
            region: priceData[0]?.region || 'Global',
            quality: 'Forecasted',
        });
    }

    return predictions;
};

/**
 * ARIMA-like prediction (simplified autoregressive model)
 */
export const arimaForecast = (prices: number[], periodsAhead: number, order: number = 3): number[] => {
    if (prices.length < order + 1) {
        throw new Error('Not enough data for ARIMA forecast');
    }

    // Calculate autoregressive coefficients using least squares
    const coefficients: number[] = [];

    // Simple AR(order) model
    for (let lag = 1; lag <= order; lag++) {
        const x: number[] = [];
        const y: number[] = [];

        for (let i = order; i < prices.length; i++) {
            x.push(prices[i - lag]);
            y.push(prices[i]);
        }

        if (x.length > 0) {
            const correlation = calculateCorrelation(x, y);
            coefficients.push(correlation * 0.3); // Simplified coefficient
        }
    }

    // Generate forecasts
    const forecasts: number[] = [];
    const extendedPrices = [...prices];

    for (let i = 0; i < periodsAhead; i++) {
        let forecast = 0;

        for (let j = 0; j < order && j < extendedPrices.length; j++) {
            const coeff = coefficients[j] || 0;
            const pastValue = extendedPrices[extendedPrices.length - 1 - j];
            forecast += coeff * pastValue;
        }

        // Add trend component
        const recentPrices = extendedPrices.slice(-12);
        const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        forecast = forecast * 0.7 + avgPrice * 0.3;

        forecasts.push(forecast);
        extendedPrices.push(forecast);
    }

    return forecasts;
};

/**
 * Calculate correlation coefficient
 */
const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Ensemble prediction combining multiple methods
 */
export const ensembleForecast = (priceData: CropPrice[], monthsAhead: number): CropPrice[] => {
    try {
        // Method 1: Seasonal forecast
        const seasonalPredictions = seasonalForecast(priceData, monthsAhead);

        // Method 2: Linear regression forecast
        const prices = priceData.map(item => item.price);
        const years = priceData.map((_, index) => index);
        const { slope, intercept } = linearRegression(years, prices);

        // Method 3: Exponential smoothing
        const smoothedPrices = exponentialSmoothing(prices);
        const lastSmoothed = smoothedPrices[smoothedPrices.length - 1];

        // Method 4: ARIMA-like forecast
        let arimaForecasts: number[] = [];
        try {
            arimaForecasts = arimaForecast(prices, monthsAhead);
        } catch (error) {
            // Fallback if ARIMA fails
            arimaForecasts = new Array(monthsAhead).fill(prices[prices.length - 1]);
        }

        // Combine predictions (ensemble average)
        const combinedPredictions: CropPrice[] = [];

        for (let i = 0; i < monthsAhead; i++) {
            const seasonalPrice = seasonalPredictions[i]?.price || 0;
            const linearPrice = slope * (prices.length + i) + intercept;
            const smoothingPrice = lastSmoothed * (1 + (slope / intercept) * 0.01); // Apply trend to smoothing
            const arimaPrice = arimaForecasts[i] || linearPrice;

            // Weighted ensemble (seasonal gets higher weight)
            const ensemblePrice = (
                seasonalPrice * 0.4 +
                linearPrice * 0.25 +
                smoothingPrice * 0.2 +
                arimaPrice * 0.15
            );

            const prediction = seasonalPredictions[i];
            if (prediction) {
                combinedPredictions.push({
                    ...prediction,
                    price: Math.round(ensemblePrice * 100) / 100,
                    source: 'Ensemble ML Prediction',
                    quality: 'AI Forecasted',
                });
            }
        }

        return combinedPredictions;
    } catch (error) {
        console.error('Error in ensemble forecast:', error);
        // Fallback to simple trend prediction
        return seasonalForecast(priceData, monthsAhead);
    }
};

/**
 * Calculate prediction confidence intervals
 */
export const calculateConfidenceIntervals = (
    historicalPrices: number[],
    predictions: number[],
    confidenceLevel: number = 0.95
): { lower: number[]; upper: number[] } => {
    // Calculate historical volatility
    const returns = [];
    for (let i = 1; i < historicalPrices.length; i++) {
        returns.push((historicalPrices[i] - historicalPrices[i - 1]) / historicalPrices[i - 1]);
    }

    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);

    // Z-score for confidence level
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.645;

    const lower = predictions.map((pred, i) => {
        const timeAdjustment = Math.sqrt(i + 1); // Uncertainty increases with time
        return pred - (zScore * volatility * pred * timeAdjustment);
    });

    const upper = predictions.map((pred, i) => {
        const timeAdjustment = Math.sqrt(i + 1);
        return pred + (zScore * volatility * pred * timeAdjustment);
    });

    return { lower, upper };
};
