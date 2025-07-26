import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import type { CropPrice, ForecastResult } from '../types';
import { formatPrice } from '../utils/dataUtils';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface PredictionChartProps {
    historicalData: CropPrice[];
    forecastResult?: ForecastResult;
    loading?: boolean;
    title: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
    historicalData,
    forecastResult,
    loading = false,
    title,
}) => {
    // Prepare chart data
    const prepareChartData = () => {
        if (historicalData.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Sort historical data
        const sortedHistorical = [...historicalData].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        // Create labels for historical data
        const historicalLabels = sortedHistorical.map(item =>
            `${item.year}-${item.month.toString().padStart(2, '0')}`
        );

        // Historical prices
        const historicalPrices = sortedHistorical.map(item => item.price);

        // Prediction data
        let predictionLabels: string[] = [];
        let predictionPrices: number[] = [];
        let confidenceLower: number[] = [];
        let confidenceUpper: number[] = [];

        if (forecastResult && forecastResult.predictions.length > 0) {
            const sortedPredictions = [...forecastResult.predictions].sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });

            predictionLabels = sortedPredictions.map(item =>
                `${item.year}-${item.month.toString().padStart(2, '0')}`
            );
            predictionPrices = sortedPredictions.map(item => item.price);
            confidenceLower = sortedPredictions.map(item => item.confidenceInterval?.lower || item.price);
            confidenceUpper = sortedPredictions.map(item => item.confidenceInterval?.upper || item.price);
        }

        // Combine labels
        const allLabels = [...historicalLabels, ...predictionLabels];

        // Create datasets
        const datasets = [
            {
                label: 'Historical Prices',
                data: [...historicalPrices, ...new Array(predictionLabels.length).fill(null)],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
            {
                label: 'Predicted Prices',
                data: [...new Array(historicalLabels.length).fill(null), ...predictionPrices],
                borderColor: '#EF4444',
                backgroundColor: '#EF4444',
                fill: false,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderDash: [5, 5],
            },
        ];

        // Add confidence interval if available
        if (confidenceLower.length > 0 && confidenceUpper.length > 0) {
            datasets.push(
                {
                    label: 'Confidence Lower',
                    data: [...new Array(historicalLabels.length).fill(null), ...confidenceLower],
                    borderColor: '#FCA5A5',
                    backgroundColor: '#FCA5A5',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 2,
                    borderDash: [2, 2],
                },
                {
                    label: 'Confidence Upper',
                    data: [...new Array(historicalLabels.length).fill(null), ...confidenceUpper],
                    borderColor: '#FCA5A5',
                    backgroundColor: '#FCA5A5',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 2,
                    borderDash: [2, 2],
                }
            );
        }

        return {
            labels: allLabels,
            datasets,
        };
    };

    const chartData = prepareChartData();

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    filter: (legendItem: any) => {
                        // Hide confidence interval labels from legend
                        return !legendItem.text.includes('Confidence');
                    },
                },
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label.includes('Confidence')) return ''; // Hide confidence tooltips

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatPrice(context.parsed.y);
                        }
                        return label;
                    },
                    afterLabel: function (context: any) {
                        if (context.dataset.label === 'Predicted Prices' && forecastResult) {
                            return `Confidence: ${(forecastResult.confidence * 100).toFixed(1)}%`;
                        }
                        return '';
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time Period (Year-Month)',
                },
                ticks: {
                    maxTicksLimit: 12,
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Price (USD)',
                },
                beginAtZero: false,
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    };

    if (loading) {
        return (
            <div className="prediction-chart-container">
                <div className="loading-state">
                    <Brain className="loading-icon" size={32} />
                    <h3>Generating AI Predictions...</h3>
                    <p>Analyzing historical patterns and trends</p>
                    <div className="loading-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="prediction-chart-container">
            {/* Prediction Info Header */}
            {forecastResult && (
                <div className="prediction-info">
                    <div className="model-info">
                        <Brain size={20} />
                        <div>
                            <h4>{forecastResult.model}</h4>
                            <p>Accuracy: {(forecastResult.accuracy * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="forecast-summary">
                        <div className="summary-item">
                            <TrendingUp size={16} />
                            <span>
                                {forecastResult.predictions.length} months forecast
                            </span>
                        </div>
                        <div className="summary-item">
                            <AlertCircle size={16} />
                            <span>
                                Based on {forecastResult.metadata.dataPoints} data points
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="chart-wrapper" style={{ height: '400px' }}>
                {chartData.labels.length > 0 ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="no-data-message">
                        <h3>No Data Available</h3>
                        <p>Select a crop and enable predictions to view forecasts.</p>
                    </div>
                )}
            </div>

            {/* Methodology Info */}
            {forecastResult && (
                <div className="methodology-info">
                    <h5>Prediction Methods Used:</h5>
                    <div className="methods-list">
                        {forecastResult.metadata.methodsUsed.map((method, index) => (
                            <span key={index} className="method-tag">
                                {method}
                            </span>
                        ))}
                    </div>
                    <p className="disclaimer">
                        <AlertCircle size={14} />
                        Predictions are based on historical data and statistical models.
                        Actual prices may vary due to market conditions, weather, and other factors.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PredictionChart;
