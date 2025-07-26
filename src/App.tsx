import { useState, useEffect } from 'react';
import { TrendingUp, Database, BarChart3, RefreshCw, Brain } from 'lucide-react';
import PriceChart from './components/PriceChart';
import PredictionChart from './components/PredictionChart';
import FilterControls from './components/FilterControls';
import StatsDashboard from './components/StatsDashboard';
import { CropPriceService } from './services/cropPriceService';
import PredictionService from './services/predictionService';
import { convertToChartData, convertToComparisonChartData } from './utils/dataUtils';
import { cropOptions } from './data/mockData';
import type { CropPrice, CropTrend, FilterOptions, ChartData, ForecastResult } from './types';
import './App.css';

function App() {
  // State management
  const [filters, setFilters] = useState<FilterOptions>({
    selectedCrop: 'corn',
    selectedYear: new Date().getFullYear(),
    startYear: 2020,
    endYear: new Date().getFullYear(),
    showPredictions: false,
    predictionMonths: 12,
  });

  const [priceData, setPriceData] = useState<CropPrice[]>([]);
  const [trends, setTrends] = useState<CropTrend[]>([]);
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [comparisonData, setComparisonData] = useState<ChartData>({ labels: [], datasets: [] });
  const [forecastResult, setForecastResult] = useState<ForecastResult | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch data when filters change
  useEffect(() => {
    if (filters.selectedCrop) {
      fetchCropData();
    }
  }, [filters.selectedCrop, filters.startYear, filters.endYear]);

  // Generate predictions when prediction settings change
  useEffect(() => {
    if (filters.showPredictions && priceData.length > 0) {
      generatePredictions();
    } else {
      setForecastResult(undefined);
    }
  }, [filters.showPredictions, filters.predictionMonths, priceData]);

  // Generate comparison data for multiple crops
  useEffect(() => {
    generateComparisonChart();
  }, [filters.startYear, filters.endYear]);

  const fetchCropData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch price data
      const priceResponse = await CropPriceService.getCropPrices(
        filters.selectedCrop,
        filters.startYear,
        filters.endYear
      );

      if (priceResponse.success) {
        setPriceData(priceResponse.data);

        // Convert to chart format
        const chartData = convertToChartData(priceResponse.data, 'month');
        setChartData(chartData);

        // Fetch trends
        const trendsResponse = await CropPriceService.getCropTrends(filters.selectedCrop, 5);
        if (trendsResponse.success) {
          setTrends(trendsResponse.data);
        }

        setLastUpdated(new Date());
      } else {
        setError(priceResponse.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('Error fetching crop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonChart = async () => {
    try {
      const topCrops = ['corn', 'wheat', 'soybeans', 'rice'];
      const cropDataMap: Record<string, CropPrice[]> = {};

      // Fetch data for multiple crops
      for (const crop of topCrops) {
        const response = await CropPriceService.getCropPrices(
          crop,
          filters.startYear,
          filters.endYear
        );
        if (response.success) {
          cropDataMap[crop] = response.data;
        }
      }

      const comparisonChartData = convertToComparisonChartData(cropDataMap);
      setComparisonData(comparisonChartData);
    } catch (err) {
      console.error('Error generating comparison chart:', err);
    }
  };

  const generatePredictions = async () => {
    if (!filters.showPredictions || priceData.length === 0) return;

    setPredictionLoading(true);
    setError(null);

    try {
      // Validate data for prediction
      const validation = PredictionService.validateDataForPrediction(priceData);

      if (!validation.isValid) {
        setError(validation.message);
        setPredictionLoading(false);
        return;
      }

      // Generate predictions using ensemble model
      const forecast = await PredictionService.generatePredictions(
        priceData,
        filters.predictionMonths,
        'ensemble'
      );

      setForecastResult(forecast);
    } catch (err) {
      setError('Failed to generate predictions: ' + (err as Error).message);
      console.error('Error generating predictions:', err);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCropData();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <TrendingUp className="app-logo" size={32} />
            <div>
              <h1>Crop Price Detection</h1>
              <p>Interactive Agricultural Market Analysis</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
              title="Refresh data"
            >
              <RefreshCw
                className={`refresh-icon ${loading ? 'spinning' : ''}`}
                size={20}
              />
              Refresh
            </button>

            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="content-layout">
          {/* Sidebar - Filters and Stats */}
          <aside className="sidebar">
            <FilterControls
              filters={filters}
              onFiltersChange={setFilters}
              cropOptions={cropOptions}
              loading={loading}
            />

            <StatsDashboard
              priceData={priceData}
              trends={trends}
              loading={loading}
            />
          </aside>

          {/* Main Charts Area */}
          <section className="charts-section">
            {/* Error Display */}
            {error && (
              <div className="error-message">
                <Database size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h2>
                  {filters.selectedCrop
                    ? `${cropOptions.find(c => c.value === filters.selectedCrop)?.label} Price Trends`
                    : 'Select a crop to view trends'
                  }
                </h2>
                <span className="chart-period">
                  {filters.startYear} - {filters.endYear}
                </span>
              </div>

              <PriceChart
                data={chartData}
                title={`Price History (${filters.startYear}-${filters.endYear})`}
                type="line"
                height={400}
                loading={loading}
              />
            </div>

            {/* Prediction Chart */}
            {filters.showPredictions && (
              <div className="chart-card prediction-card">
                <div className="chart-header">
                  <Brain size={24} />
                  <h2>AI Price Predictions</h2>
                  <span className="chart-period">
                    Next {filters.predictionMonths} months
                  </span>
                </div>

                <PredictionChart
                  historicalData={priceData}
                  forecastResult={forecastResult}
                  loading={predictionLoading}
                  title={`${filters.selectedCrop.charAt(0).toUpperCase() + filters.selectedCrop.slice(1)} Price Forecast`}
                />

                {/* Prediction Accuracy Info */}
                {forecastResult && (
                  <div className="prediction-accuracy">
                    <div className="accuracy-item">
                      <span className="accuracy-label">Model Accuracy:</span>
                      <span className="accuracy-value">
                        {(forecastResult.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="accuracy-item">
                      <span className="accuracy-label">Data Points Used:</span>
                      <span className="accuracy-value">
                        {forecastResult.metadata.dataPoints}
                      </span>
                    </div>
                    <div className="accuracy-item">
                      <span className="accuracy-label">Forecast Model:</span>
                      <span className="accuracy-value">
                        {forecastResult.model}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comparison Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <BarChart3 size={24} />
                <h2>Multi-Crop Comparison</h2>
                <span className="chart-period">
                  Average Annual Prices
                </span>
              </div>

              <PriceChart
                data={comparisonData}
                title="Crop Price Comparison (Annual Averages)"
                type="line"
                height={350}
                loading={false}
              />
            </div>

            {/* Market Insights */}
            <div className="insights-card">
              <h3>Market Insights</h3>
              <div className="insights-grid">
                <div className="insight-box">
                  <h4>Data Sources</h4>
                  <ul>
                    <li>World Bank Commodity Markets</li>
                    <li>USDA National Agricultural Statistics Service</li>
                    <li>Historical price data (2018-2024)</li>
                  </ul>
                </div>

                <div className="insight-box">
                  <h4>Features</h4>
                  <ul>
                    <li>Interactive price trend charts</li>
                    <li>Multi-crop comparison analysis</li>
                    <li>Statistical insights and volatility metrics</li>
                    <li>Year-over-year change tracking</li>
                  </ul>
                </div>

                <div className="insight-box">
                  <h4>How to Use</h4>
                  <ul>
                    <li>Select a crop from the dropdown menu</li>
                    <li>Choose your desired year range</li>
                    <li>View interactive charts and statistics</li>
                    <li>Compare multiple crops side-by-side</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Crop Price Detection App | Built with React, TypeScript, and Chart.js
          </p>
          <p>
            Data sources: World Bank, USDA NASS |
            For educational and research purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
