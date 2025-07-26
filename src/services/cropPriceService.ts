import axios from 'axios';
import type { CropPrice, ApiResponse, CropTrend } from '../types';
import { mockCropPriceData, generateMockPriceData } from '../data/mockData';

// API Configuration
const API_BASE_URL = 'https://api.worldbank.org/v2';

// Axios instance for World Bank API
const worldBankApi = axios.create({
    baseURL: API_BASE_URL,
    params: {
        format: 'json',
        per_page: 1000,
    },
});

/**
 * Service class for fetching crop price data from various APIs
 */
export class CropPriceService {
    /**
     * Fetch crop price data with fallback to mock data
     */
    static async getCropPrices(
        crop: string,
        startYear: number = 2018,
        endYear: number = 2024
    ): Promise<ApiResponse<CropPrice>> {
        try {
            // Try to fetch from World Bank API first
            const realData = await this.fetchFromWorldBank(crop, startYear, endYear);
            if (realData && realData.length > 0) {
                return {
                    data: realData,
                    success: true,
                    totalRecords: realData.length,
                };
            }
        } catch (error) {
            console.warn('Failed to fetch from World Bank API, using mock data:', error);
        }

        // Fallback to mock data
        const mockData = mockCropPriceData[crop] || generateMockPriceData(crop, startYear, endYear);
        const filteredData = mockData.filter(
            (item) => item.year >= startYear && item.year <= endYear
        );

        return {
            data: filteredData,
            success: true,
            message: 'Using mock data - API unavailable',
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
     * Fetch from World Bank Commodity Price Data API
     */
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

            const response = await worldBankApi.get(
                `/country/WLD/indicator/${commodityCode}`,
                {
                    params: {
                        date: `${startYear}:${endYear}`,
                    },
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
                    });
                }
            });

            return cropPrices;
        } catch (error) {
            console.error('World Bank API error:', error);
            throw error;
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
