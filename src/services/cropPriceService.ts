import axios from 'axios';
import type { CropPrice, ApiResponse, CropTrend } from '../types';
import { mockCropPriceData, generateMockPriceData } from '../data/mockData';

/**
 * Enhanced service class for fetching crop price data from multiple APIs
 */
export class CropPriceService {
    /**
     * Fetch crop price data with multiple API sources and robust fallback
     */
    static async getCropPrices(
        crop: string,
        startYear: number = 2018,
        endYear: number = 2024
    ): Promise<ApiResponse<CropPrice>> {
        console.log(`Fetching data for ${crop} from ${startYear} to ${endYear}`);

        // Try multiple data sources in order of preference
        const dataSources = [
            () => this.fetchFromAlternativeAPI(crop, startYear, endYear),
            () => this.fetchFromQuandl(crop, startYear, endYear),
            () => this.fetchFromWorldBank(crop, startYear, endYear),
        ];

        for (const [index, fetchFunction] of dataSources.entries()) {
            try {
                console.log(`Trying data source ${index + 1}...`);
                const realData = await fetchFunction();
                if (realData && realData.length > 0) {
                    console.log(`Successfully fetched ${realData.length} records from source ${index + 1}`);
                    return {
                        data: realData,
                        success: true,
                        totalRecords: realData.length,
                        message: `Data from source ${index + 1}`,
                    };
                }
            } catch (error) {
                console.warn(`Source ${index + 1} failed:`, (error as Error).message);
                continue;
            }
        }

        // All APIs failed, use enhanced mock data
        console.log('All API sources failed, using enhanced mock data');
        const mockData = mockCropPriceData[crop] || generateMockPriceData(crop, startYear, endYear);
        const filteredData = mockData.filter(
            (item) => item.year >= startYear && item.year <= endYear
        );

        return {
            data: filteredData,
            success: true,
            message: 'Using realistic mock data - All external APIs unavailable',
            totalRecords: filteredData.length,
        };
    }

    /**
     * Fetch historical trends for a crop
     */
    static async getCropTrends(
        crop: string,
        years: number = 5
    ): Promise<ApiResponse<CropTrend>> {
        try {
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - years;

            const priceResponse = await this.getCropPrices(crop, startYear, currentYear);
            const trends = this.calculateTrends(priceResponse.data);

            return {
                data: trends,
                success: true,
                totalRecords: trends.length,
            };
        } catch (error) {
            console.error('Error calculating trends:', error);
            return {
                data: [],
                success: false,
                message: 'Failed to calculate trends',
            };
        }
    }

    /**
     * Get price comparison between multiple crops
     */
    static async getMultiCropComparison(
        crops: string[],
        year: number
    ): Promise<ApiResponse<CropPrice>> {
        try {
            const allData: CropPrice[] = [];

            for (const crop of crops) {
                const response = await this.getCropPrices(crop, year, year);
                allData.push(...response.data);
            }

            return {
                data: allData,
                success: true,
                totalRecords: allData.length,
            };
        } catch (error) {
            console.error('Error fetching multi-crop data:', error);
            return {
                data: [],
                success: false,
                message: 'Failed to fetch comparison data',
            };
        }
    }

    /**
     * Fetch from Alternative Free Commodity API (JSON based)
     * Currently generates realistic mock data - can be replaced with real API calls
     */
    private static async fetchFromAlternativeAPI(
        crop: string,
        startYear: number,
        endYear: number
    ): Promise<CropPrice[]> {
        try {
            // Option 1: Try Alpha Vantage API (uncomment to use real API)
            return await this.fetchFromAlphaVantage(crop, startYear, endYear);

            // Option 2: Try Commodities API (uncomment to use real API)
            // return await this.fetchFromCommoditiesAPI(crop, startYear, endYear);

            // Current: Generate realistic synthetic data for demo
            console.log(`Generating realistic synthetic data for ${crop} (no real API call)`);

            const basePrice = this.getBasePriceForCrop(crop);
            const data: CropPrice[] = [];

            for (let year = startYear; year <= endYear; year++) {
                for (let month = 1; month <= 12; month++) {
                    // Add realistic price variations
                    const seasonalFactor = 1 + Math.sin((month - 1) * Math.PI / 6) * 0.1;
                    const yearTrend = 1 + (year - 2020) * 0.02; // 2% annual increase
                    const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random

                    const price = basePrice * seasonalFactor * yearTrend * randomVariation;

                    data.push({
                        id: `alt-${crop}-${year}-${month}`,
                        crop,
                        year,
                        month,
                        price: Math.round(price * 100) / 100,
                        unit: 'USD/metric ton',
                        source: 'Alternative Commodity API',
                        region: 'Global',
                        quality: 'Standard',
                    });
                }
            }

            return data;
        } catch (error) {
            console.error('Alternative API error:', error);
            throw new Error(`Alternative API failed: ${(error as Error).message}`);
        }
    }

    /**
     * Fetch from Quandl-style API (if available)
     */
    private static async fetchFromQuandl(
        crop: string,
        _startYear: number,
        _endYear: number
    ): Promise<CropPrice[]> {
        // Quandl API requires authentication and is not free for most data
        // This is a placeholder for future implementation
        console.log(`Quandl API not implemented for ${crop}`);
        throw new Error('Quandl API not configured - requires premium access');
    }

    /**
     * Get base price for crop type
     */
    private static getBasePriceForCrop(crop: string): number {
        const basePrices: Record<string, number> = {
            corn: 165,
            wheat: 225,
            rice: 385,
            soybeans: 345,
            cotton: 1520,
            sugar: 355,
            coffee: 2850,
            cocoa: 2450,
            palm_oil: 820,
            rubber: 1650,
        };
        return basePrices[crop] || 200;
    }

    /**
     * Fetch from Alpha Vantage API (for real commodity data)
     * Note: Alpha Vantage has limited free tier - 5 calls per minute, 500 per day
     */
    private static async fetchFromAlphaVantage(
        crop: string,
        startYear: number,
        endYear: number
    ): Promise<CropPrice[]> {
        try {
            // Alpha Vantage uses different functions for different data types
            // For commodities, we need to use specific commodity symbols or ETF symbols
            const commoditySymbols: Record<string, { symbol: string; function: string }> = {
                corn: { symbol: 'CORN', function: 'TIME_SERIES_MONTHLY' }, // Corn ETF
                wheat: { symbol: 'WEAT', function: 'TIME_SERIES_MONTHLY' }, // Wheat ETF
                soybeans: { symbol: 'SOYB', function: 'TIME_SERIES_MONTHLY' }, // Soybean ETF
                cotton: { symbol: 'BAL', function: 'TIME_SERIES_MONTHLY' }, // Cotton ETF
                sugar: { symbol: 'SGG', function: 'TIME_SERIES_MONTHLY' }, // Sugar ETF
                coffee: { symbol: 'JO', function: 'TIME_SERIES_MONTHLY' }, // Coffee ETF
                rice: { symbol: 'RJA', function: 'TIME_SERIES_MONTHLY' }, // Agricultural ETF
            };

            const commodityInfo = commoditySymbols[crop];
            if (!commodityInfo) {
                throw new Error(`Alpha Vantage doesn't support ${crop} commodity data`);
            }

            console.log(`Fetching Alpha Vantage data for ${crop} using symbol ${commodityInfo.symbol}`);

            // Get API key from environment variables
            const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
            if (!apiKey) {
                throw new Error('Alpha Vantage API key not found. Please set VITE_ALPHA_VANTAGE_API_KEY in your .env file');
            }

            // Alpha Vantage API call for ETF/stock data
            const response = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: commodityInfo.function,
                    symbol: commodityInfo.symbol,
                    apikey: apiKey,
                },
                timeout: 15000,
            });

            // console.log('Alpha Vantage response:', response.data);

            // Check for API errors
            if (response.data['Error Message']) {
                throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
            }

            if (response.data['Note']) {
                throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
            }

            // Check if we have time series data
            const timeSeriesKey = 'Monthly Time Series';
            const timeSeriesData = response.data[timeSeriesKey];

            if (!timeSeriesData) {
                console.warn('No time series data found, available keys:', Object.keys(response.data));
                throw new Error('No time series data available from Alpha Vantage');
            }

            // Convert Alpha Vantage data to our format
            const cropPrices: CropPrice[] = [];
            let recordCount = 0;

            Object.entries(timeSeriesData).forEach(([dateStr, priceData]: [string, any]) => {
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                // Filter by year range
                if (year >= startYear && year <= endYear) {
                    // Use closing price and convert to commodity price estimate
                    const etfPrice = parseFloat(priceData['4. close'] || priceData.close || '0');

                    // Convert ETF price to estimated commodity price (rough approximation)
                    const estimatedCommodityPrice = this.convertETFToCommodityPrice(crop, etfPrice);

                    cropPrices.push({
                        id: `av-${crop}-${year}-${month}`,
                        crop,
                        year,
                        month,
                        price: Math.round(estimatedCommodityPrice * 100) / 100,
                        unit: 'USD/metric ton (estimated)',
                        source: `Alpha Vantage (${commodityInfo.symbol} ETF)`,
                        region: 'Global',
                        quality: 'Standard',
                    });
                    recordCount++;
                }
            });

            if (cropPrices.length === 0) {
                throw new Error('No data found in the specified date range');
            }

            console.log(`Successfully converted ${recordCount} Alpha Vantage records`);
            return cropPrices.sort((a, b) => a.year - b.year || a.month - b.month);

        } catch (error) {
            console.error('Alpha Vantage API error:', error);
            throw new Error(`Alpha Vantage API failed: ${(error as Error).message}`);
        }
    }

    /**
     * Convert ETF price to estimated commodity price
     * This is a rough approximation since ETF prices don't directly correlate to commodity prices
     */
    private static convertETFToCommodityPrice(crop: string, etfPrice: number): number {
        // Rough conversion factors (these are estimates and not accurate)
        const conversionFactors: Record<string, number> = {
            corn: 15, // Multiply ETF price by factor to get rough commodity price
            wheat: 20,
            soybeans: 25,
            cotton: 150,
            sugar: 30,
            coffee: 200,
            rice: 35,
        };

        const factor = conversionFactors[crop] || 20;
        return etfPrice * factor;
    }

    /**
     * Generate realistic commodity data for demo purposes
     */
    private static generateRealisticData(
        crop: string,
        startYear: number,
        endYear: number,
        source: string
    ): CropPrice[] {
        const basePrice = this.getBasePriceForCrop(crop);
        const data: CropPrice[] = [];

        for (let year = startYear; year <= endYear; year++) {
            for (let month = 1; month <= 12; month++) {
                // Add realistic price variations
                const seasonalFactor = 1 + Math.sin((month - 1) * Math.PI / 6) * 0.15;
                const yearTrend = 1 + (year - 2020) * 0.025; // 2.5% annual increase
                const marketVolatility = 0.85 + Math.random() * 0.3; // ±15% random

                const price = basePrice * seasonalFactor * yearTrend * marketVolatility;

                data.push({
                    id: `${source.toLowerCase().replace(' ', '_')}-${crop}-${year}-${month}`,
                    crop,
                    year,
                    month,
                    price: Math.round(price * 100) / 100,
                    unit: 'USD/metric ton',
                    source,
                    region: 'Global',
                    quality: 'Standard',
                });
            }
        }

        return data;
    }
    private static async fetchFromWorldBank(
        crop: string,
        startYear: number,
        endYear: number
    ): Promise<CropPrice[]> {
        try {
            // World Bank commodity codes mapping
            const commodityMap: Record<string, string> = {
                wheat: 'PWHEAMT',
                corn: 'PMAIZMT',
                rice: 'PRICENPQ',
                soybeans: 'PSOYB',
                sugar: 'PSUGAUSA',
                coffee: 'PCOFFROB',
                cotton: 'PCOTTIND',
                palm_oil: 'PPOIL',
                cocoa: 'PCOCO',
                rubber: 'PRUBB',
            };

            const commodityCode = commodityMap[crop];
            if (!commodityCode) {
                throw new Error(`No commodity code found for ${crop}`);
            }

            const response = await axios.get(
                `https://api.worldbank.org/v2/country/WLD/indicator/${commodityCode}`,
                {
                    params: {
                        date: `${startYear}:${endYear}`,
                        format: 'json',
                        per_page: 1000,
                    },
                    timeout: 10000,
                }
            );

            if (!response.data || !response.data[1]) {
                throw new Error('No data received from World Bank API');
            }

            const worldBankData = response.data[1];
            const cropPrices: CropPrice[] = [];

            worldBankData.forEach((item: any, index: number) => {
                if (item.value) {
                    cropPrices.push({
                        id: `wb-${crop}-${item.date}-${index}`,
                        crop,
                        year: parseInt(item.date),
                        month: 6, // World Bank data is typically annual, using mid-year
                        price: parseFloat(item.value),
                        unit: 'USD/metric ton',
                        source: 'World Bank',
                        region: 'Global',
                        quality: 'Standard',
                    });
                }
            });

            return cropPrices;
        } catch (error) {
            console.error('World Bank API error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(`World Bank API failed: ${error.response?.status} - ${error.response?.statusText || error.message}`);
            }
            throw new Error(`World Bank API failed: ${(error as Error).message}`);
        }
    }

    /**
     * Calculate yearly trends from price data
     */
    private static calculateTrends(priceData: CropPrice[]): CropTrend[] {
        const yearlyData = new Map<number, CropPrice[]>();

        // Group data by year
        priceData.forEach((item) => {
            if (!yearlyData.has(item.year)) {
                yearlyData.set(item.year, []);
            }
            yearlyData.get(item.year)!.push(item);
        });

        const trends: CropTrend[] = [];
        let previousAverage: number | null = null;

        yearlyData.forEach((yearData, year) => {
            const prices = yearData.map((item) => item.price);
            const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            let changePercent: number | undefined;
            if (previousAverage !== null) {
                changePercent = ((averagePrice - previousAverage) / previousAverage) * 100;
            }

            trends.push({
                crop: yearData[0].crop,
                year,
                averagePrice: Math.round(averagePrice * 100) / 100,
                minPrice: Math.round(minPrice * 100) / 100,
                maxPrice: Math.round(maxPrice * 100) / 100,
                unit: yearData[0].unit,
                changePercent: changePercent ? Math.round(changePercent * 100) / 100 : undefined,
            });

            previousAverage = averagePrice;
        });

        return trends.sort((a, b) => a.year - b.year);
    }
}

export default CropPriceService;
