# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# Crop Price Detection Web Application

A modern, interactive web application for analyzing agricultural commodity prices with real-time data visualization and trend analysis.

![Crop Price Detection App](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Vite](https://img.shields.io/badge/Vite-5.x-purple) ![Chart.js](https://img.shields.io/badge/Chart.js-4.x-orange)

## 🌾 Features

- **Interactive Price Charts**: Dynamic line and bar charts with hover interactions
- **Multi-Crop Comparison**: Side-by-side analysis of different agricultural commodities
- **Statistical Analysis**: Real-time calculation of price trends, volatility, and statistics
- **Time Range Filtering**: Flexible year-based filtering for historical data analysis
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices
- **Real-time Data**: Integration with World Bank and USDA APIs (with fallback to mock data)

## 🚀 Supported Crops

- **Grains**: Corn, Wheat, Rice
- **Oilseeds**: Soybeans, Palm Oil
- **Beverages**: Coffee, Cocoa
- **Others**: Cotton, Sugar, Rubber

## 📊 Data Sources

- **World Bank Commodity Markets**: Global commodity price data
- **USDA NASS API**: US agricultural statistics
- **Mock Data**: Realistic simulated data for development and fallback

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Charts**: Chart.js with React-Chartjs-2
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Styling**: Custom CSS with responsive design

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd crop-price-detection
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🏗️ Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── PriceChart.tsx  # Chart visualization component
│   ├── FilterControls.tsx # User input controls
│   └── StatsDashboard.tsx # Statistics display
├── data/               # Mock data and constants
│   └── mockData.ts     # Sample crop price data
├── services/           # API integration services
│   └── cropPriceService.ts # Data fetching service
├── types/              # TypeScript type definitions
│   └── index.ts        # Interface definitions
├── utils/              # Utility functions
│   └── dataUtils.ts    # Data processing helpers
├── App.tsx             # Main application component
├── App.css             # Application styles
└── main.tsx            # Application entry point
```

## 🎯 Usage

1. **Select a Crop**: Choose from the dropdown menu of available agricultural commodities
2. **Set Time Range**: Adjust the year range to focus on specific periods
3. **View Charts**: Analyze price trends through interactive line and bar charts
4. **Compare Crops**: Use the comparison chart to analyze multiple commodities
5. **Review Statistics**: Check the statistics panel for detailed price analytics

## 🔧 Configuration

### API Integration

To use real APIs, you can configure the following:

1. **World Bank API**: No API key required (public data)
2. **USDA NASS API**: Sign up at [USDA QuickStats](https://quickstats.nass.usda.gov/api) for an API key

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_WORLD_BANK_API_URL=https://api.worldbank.org/v2
VITE_USDA_API_URL=https://quickstats.nass.usda.gov/api
VITE_USDA_API_KEY=your_usda_api_key_here
```

## 📈 Features in Detail

### Interactive Charts
- Responsive Chart.js visualizations
- Hover tooltips with detailed price information
- Zoom and pan capabilities
- Multiple chart types (line, bar)

### Smart Data Processing
- Automatic calculation of statistical metrics
- Year-over-year change analysis
- Volatility measurement
- Price trend detection

### User Experience
- Real-time filtering and data updates
- Loading states and error handling
- Responsive design for all screen sizes
- Accessible interface with keyboard navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- World Bank for providing open commodity price data
- USDA for agricultural statistics
- Chart.js community for excellent charting library
- React and TypeScript communities

## 📞 Support

For questions, issues, or contributions, please:
1. Check the [Issues](../../issues) page
2. Create a new issue if needed
3. Contact the development team

---

**Built with ❤️ for agricultural market analysis**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
