import type { CropPrice, CropOption } from '../types';

export const cropOptions: CropOption[] = [
    { value: 'corn', label: 'Corn', category: 'Grains' },
    { value: 'wheat', label: 'Wheat', category: 'Grains' },
    { value: 'rice', label: 'Rice', category: 'Grains' },
    { value: 'soybeans', label: 'Soybeans', category: 'Oilseeds' },
    { value: 'cotton', label: 'Cotton', category: 'Fiber' },
    { value: 'sugar', label: 'Sugar', category: 'Sweeteners' },
    { value: 'coffee', label: 'Coffee', category: 'Beverages' },
    { value: 'cocoa', label: 'Cocoa', category: 'Beverages' },
    { value: 'palm_oil', label: 'Palm Oil', category: 'Oilseeds' },
    { value: 'rubber', label: 'Rubber', category: 'Industrial' },
];

// Generate mock historical price data
export const generateMockPriceData = (
    crop: string,
    startYear: number = 2018,
    endYear: number = 2024
): CropPrice[] => {
    const data: CropPrice[] = [];

    // Base prices per unit (USD/metric ton or USD/bushel)
    const basePrices: Record<string, number> = {
        corn: 160,
        wheat: 220,
        rice: 380,
        soybeans: 340,
        cotton: 1500,
        sugar: 350,
        coffee: 2800,
        cocoa: 2400,
        palm_oil: 800,
        rubber: 1600,
    };

    const basePrice = basePrices[crop] || 200;
    let currentPrice = basePrice;

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 1; month <= 12; month++) {
            // Add some realistic price variation
            const volatility = 0.15; // 15% volatility
            const seasonalFactor = Math.sin((month - 1) * Math.PI / 6) * 0.1; // Seasonal variation
            const trendFactor = (year - startYear) * 0.02; // Small annual increase
            const randomFactor = (Math.random() - 0.5) * volatility;

            currentPrice = basePrice * (1 + seasonalFactor + trendFactor + randomFactor);

            data.push({
                id: `${crop}-${year}-${month}`,
                crop,
                year,
                month,
                price: Math.round(currentPrice * 100) / 100,
                unit: crop === 'cotton' ? 'USD/lb' : 'USD/metric ton',
                source: 'World Bank Commodity Markets',
                region: 'Global',
                quality: 'Standard',
            });
        }
    }

    return data;
};

// Pre-generated data for multiple crops
export const mockCropPriceData: Record<string, CropPrice[]> = {};

cropOptions.forEach(crop => {
    mockCropPriceData[crop.value] = generateMockPriceData(crop.value);
});

// Recent news and market insights (mock data)
export const marketInsights = [
    {
        id: '1',
        title: 'Global Wheat Prices Rise Due to Supply Chain Disruptions',
        summary: 'Weather conditions and geopolitical factors affect global wheat supply.',
        date: '2024-01-15',
        category: 'wheat',
        impact: 'positive'
    },
    {
        id: '2',
        title: 'Corn Harvest Expected to Increase by 5% This Season',
        summary: 'Favorable weather conditions boost corn production estimates.',
        date: '2024-01-10',
        category: 'corn',
        impact: 'negative'
    },
    {
        id: '3',
        title: 'Soybean Futures Show Strong Bullish Trend',
        summary: 'Increased demand from Asian markets drives soybean prices up.',
        date: '2024-01-08',
        category: 'soybeans',
        impact: 'positive'
    },
    {
        id: '4',
        title: 'Coffee Prices Stabilize After Volatile Quarter',
        summary: 'Brazilian harvest estimates bring stability to coffee markets.',
        date: '2024-01-05',
        category: 'coffee',
        impact: 'neutral'
    }
];
