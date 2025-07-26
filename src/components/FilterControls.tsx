import React from 'react';
import { Calendar, TrendingUp, Filter, Brain, Target } from 'lucide-react';
import type { FilterOptions, CropOption } from '../types';

interface FilterControlsProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    cropOptions: CropOption[];
    loading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    filters,
    onFiltersChange,
    cropOptions,
    loading = false,
}) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 2010 + 1 },
        (_, i) => currentYear - i
    );

    const handleCropChange = (selectedCrop: string) => {
        onFiltersChange({
            ...filters,
            selectedCrop,
        });
    };

    const handleYearChange = (selectedYear: number) => {
        onFiltersChange({
            ...filters,
            selectedYear,
        });
    };

    const handleStartYearChange = (startYear: number) => {
        onFiltersChange({
            ...filters,
            startYear,
            // Ensure end year is not before start year
            endYear: Math.max(startYear, filters.endYear),
        });
    };

    const handleEndYearChange = (endYear: number) => {
        onFiltersChange({
            ...filters,
            endYear,
            // Ensure start year is not after end year
            startYear: Math.min(filters.startYear, endYear),
        });
    };

    const handlePredictionToggle = (showPredictions: boolean) => {
        onFiltersChange({
            ...filters,
            showPredictions,
        });
    };

    const handlePredictionMonthsChange = (predictionMonths: number) => {
        onFiltersChange({
            ...filters,
            predictionMonths,
        });
    };

    const groupedCropOptions = cropOptions.reduce((acc, crop) => {
        const category = crop.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(crop);
        return acc;
    }, {} as Record<string, CropOption[]>);

    return (
        <div className="filter-controls">
            <div className="filter-header">
                <Filter className="filter-icon" size={20} />
                <h3>Filter Options</h3>
            </div>

            <div className="filter-grid">
                {/* Crop Selection */}
                <div className="filter-group">
                    <label htmlFor="crop-select">
                        <TrendingUp size={16} />
                        Select Crop
                    </label>
                    <select
                        id="crop-select"
                        value={filters.selectedCrop}
                        onChange={(e) => handleCropChange(e.target.value)}
                        disabled={loading}
                        className="filter-select"
                    >
                        <option value="">Choose a crop...</option>
                        {Object.entries(groupedCropOptions).map(([category, crops]) => (
                            <optgroup key={category} label={category}>
                                {crops.map((crop) => (
                                    <option key={crop.value} value={crop.value}>
                                        {crop.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Single Year Selection */}
                <div className="filter-group">
                    <label htmlFor="year-select">
                        <Calendar size={16} />
                        Focus Year
                    </label>
                    <select
                        id="year-select"
                        value={filters.selectedYear}
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        disabled={loading}
                        className="filter-select"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Range - Start */}
                <div className="filter-group">
                    <label htmlFor="start-year-select">
                        <Calendar size={16} />
                        From Year
                    </label>
                    <select
                        id="start-year-select"
                        value={filters.startYear}
                        onChange={(e) => handleStartYearChange(parseInt(e.target.value))}
                        disabled={loading}
                        className="filter-select"
                    >
                        {years.slice().reverse().map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Range - End */}
                <div className="filter-group">
                    <label htmlFor="end-year-select">
                        <Calendar size={16} />
                        To Year
                    </label>
                    <select
                        id="end-year-select"
                        value={filters.endYear}
                        onChange={(e) => handleEndYearChange(parseInt(e.target.value))}
                        disabled={loading}
                        className="filter-select"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Prediction Controls */}
                <div className="filter-group prediction-controls">
                    <label htmlFor="show-predictions">
                        <Brain size={16} />
                        Enable Predictions
                    </label>
                    <div className="toggle-container">
                        <input
                            type="checkbox"
                            id="show-predictions"
                            checked={filters.showPredictions}
                            onChange={(e) => handlePredictionToggle(e.target.checked)}
                            disabled={loading}
                            className="prediction-toggle"
                        />
                        <label htmlFor="show-predictions" className="toggle-label">
                            AI Price Forecasting
                        </label>
                    </div>
                </div>

                {/* Prediction Months */}
                {filters.showPredictions && (
                    <div className="filter-group">
                        <label htmlFor="prediction-months">
                            <Target size={16} />
                            Forecast Period
                        </label>
                        <select
                            id="prediction-months"
                            value={filters.predictionMonths}
                            onChange={(e) => handlePredictionMonthsChange(parseInt(e.target.value))}
                            disabled={loading}
                            className="filter-select"
                        >
                            <option value={3}>3 months</option>
                            <option value={6}>6 months</option>
                            <option value={12}>12 months</option>
                            <option value={18}>18 months</option>
                            <option value={24}>24 months</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Filter Summary */}
            <div className="filter-summary">
                <h4>Current Selection:</h4>
                <div className="selection-tags">
                    {filters.selectedCrop && (
                        <span className="tag crop-tag">
                            {cropOptions.find(c => c.value === filters.selectedCrop)?.label}
                        </span>
                    )}
                    <span className="tag year-tag">
                        {filters.startYear} - {filters.endYear}
                    </span>
                    <span className="tag focus-tag">
                        Focus: {filters.selectedYear}
                    </span>
                    {filters.showPredictions && (
                        <span className="tag prediction-tag">
                            AI Forecast: {filters.predictionMonths} months
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterControls;
