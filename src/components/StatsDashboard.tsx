import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from 'lucide-react';
import { formatPrice, formatPercentage, calculateStatistics } from '../utils/dataUtils';
import type { CropPrice, CropTrend } from '../types';

interface StatsDashboardProps {
    priceData: CropPrice[];
    trends: CropTrend[];
    loading?: boolean;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({
    priceData,
    trends,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="stats-dashboard loading">
                <div className="stats-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="stat-card loading-card">
                            <div className="loading-placeholder"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (priceData.length === 0) {
        return (
            <div className="stats-dashboard no-data">
                <p>Select a crop to view statistics</p>
            </div>
        );
    }

    const stats = calculateStatistics(priceData);
    const latestTrend = trends[trends.length - 1];
    const previousTrend = trends[trends.length - 2];

    const yearOverYearChange = latestTrend && previousTrend
        ? ((latestTrend.averagePrice - previousTrend.averagePrice) / previousTrend.averagePrice) * 100
        : 0;

    const volatilityPercentage = stats.average > 0 ? (stats.volatility / stats.average) * 100 : 0;

    return (
        <div className="stats-dashboard">
            <div className="stats-header">
                <h3>Price Statistics</h3>
                <span className="data-period">
                    {priceData.length > 0 && (
                        <>
                            {Math.min(...priceData.map(d => d.year))} - {Math.max(...priceData.map(d => d.year))}
                        </>
                    )}
                </span>
            </div>

            <div className="stats-grid">
                {/* Average Price */}
                <div className="stat-card">
                    <div className="stat-header">
                        <DollarSign className="stat-icon" size={20} />
                        <span className="stat-label">Average Price</span>
                    </div>
                    <div className="stat-value">
                        {formatPrice(stats.average)}
                    </div>
                    <div className="stat-unit">
                        {priceData[0]?.unit || 'USD/metric ton'}
                    </div>
                </div>

                {/* Price Range */}
                <div className="stat-card">
                    <div className="stat-header">
                        <BarChart3 className="stat-icon" size={20} />
                        <span className="stat-label">Price Range</span>
                    </div>
                    <div className="stat-value range">
                        <span className="min-price">{formatPrice(stats.min)}</span>
                        <span className="range-separator">-</span>
                        <span className="max-price">{formatPrice(stats.max)}</span>
                    </div>
                    <div className="stat-unit">Min - Max</div>
                </div>

                {/* Year-over-Year Change */}
                <div className="stat-card">
                    <div className="stat-header">
                        {yearOverYearChange >= 0 ? (
                            <TrendingUp className="stat-icon positive" size={20} />
                        ) : (
                            <TrendingDown className="stat-icon negative" size={20} />
                        )}
                        <span className="stat-label">YoY Change</span>
                    </div>
                    <div className={`stat-value ${yearOverYearChange >= 0 ? 'positive' : 'negative'}`}>
                        {formatPercentage(yearOverYearChange)}
                    </div>
                    <div className="stat-unit">vs Previous Year</div>
                </div>

                {/* Volatility */}
                <div className="stat-card">
                    <div className="stat-header">
                        <Activity className="stat-icon" size={20} />
                        <span className="stat-label">Volatility</span>
                    </div>
                    <div className="stat-value">
                        {formatPercentage(volatilityPercentage)}
                    </div>
                    <div className="stat-unit">Standard Deviation</div>
                </div>
            </div>

            {/* Trends Summary */}
            {trends.length > 0 && (
                <div className="trends-summary">
                    <h4>Recent Trends</h4>
                    <div className="trends-list">
                        {trends.slice(-3).reverse().map((trend) => (
                            <div key={trend.year} className="trend-item">
                                <span className="trend-year">{trend.year}</span>
                                <span className="trend-price">{formatPrice(trend.averagePrice)}</span>
                                {trend.changePercent !== undefined && (
                                    <span className={`trend-change ${trend.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                        {formatPercentage(trend.changePercent)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Insights */}
            <div className="insights-section">
                <h4>Key Insights</h4>
                <div className="insights-list">
                    <div className="insight-item">
                        <span className="insight-label">Median Price:</span>
                        <span className="insight-value">{formatPrice(stats.median)}</span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">Price Stability:</span>
                        <span className="insight-value">
                            {volatilityPercentage < 10 ? 'Stable' :
                                volatilityPercentage < 20 ? 'Moderate' : 'Volatile'}
                        </span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-label">Market Trend:</span>
                        <span className={`insight-value ${yearOverYearChange >= 5 ? 'bullish' :
                            yearOverYearChange <= -5 ? 'bearish' : 'neutral'}`}>
                            {yearOverYearChange >= 5 ? 'Bullish' :
                                yearOverYearChange <= -5 ? 'Bearish' : 'Neutral'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
