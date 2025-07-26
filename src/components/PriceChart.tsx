import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { ChartData, ChartType } from '../types';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface PriceChartProps {
    data: ChartData;
    title: string;
    type?: ChartType;
    height?: number;
    loading?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({
    data,
    title,
    type = 'line',
    height = 400,
    loading = false,
}) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
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
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            }).format(context.parsed.y);
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time Period',
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
            <div
                className="chart-container"
                style={{ height: `${height}px` }}
            >
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading chart data...</p>
                </div>
            </div>
        );
    }

    if (!data.labels.length || !data.datasets.length) {
        return (
            <div
                className="chart-container no-data"
                style={{ height: `${height}px` }}
            >
                <div className="no-data-message">
                    <h3>No Data Available</h3>
                    <p>Select a crop and year range to view price trends.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="chart-container"
            style={{ height: `${height}px` }}
        >
            {type === 'line' && <Line data={data} options={options} />}
            {type === 'bar' && <Bar data={data} options={options} />}
        </div>
    );
};

export default PriceChart;
