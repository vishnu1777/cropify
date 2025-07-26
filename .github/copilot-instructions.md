# Copilot Instructions for Crop Price Detection App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript web application for crop price detection and trend analysis. The application provides interactive charts and data visualization for agricultural commodity prices.

## Key Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios for API calls
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Architecture Guidelines
- Use functional components with React hooks
- Implement proper TypeScript interfaces for all data structures
- Create reusable components for charts and UI elements
- Use proper error handling for API calls
- Implement loading states for better UX

## API Integration
- Use free APIs like USDA NASS API for US crop data
- Implement fallback data when APIs are unavailable
- Create mock data services for development and testing

## Code Style
- Use TypeScript strict mode
- Implement proper prop types and interfaces
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Follow React best practices for state management

## File Organization
- Components in `/src/components/`
- API services in `/src/services/`
- Types/interfaces in `/src/types/`
- Utilities in `/src/utils/`
- Mock data in `/src/data/`
