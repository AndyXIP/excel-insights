# Excel Insights

![Status](https://img.shields.io/badge/Status-Complete-success) ![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=06192E) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![License](https://img.shields.io/badge/License-MIT-green)

Full-stack web application for analyzing and visualizing Excel and CSV data. Upload your files, explore with interactive tables, and generate insightful visualizations instantly. Built with Express, React, and TypeScript for fast, modern data analysis.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development Notes](#development-notes)
- [Suggested Future Directions](#suggested-future-directions)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

Excel Insights is a lightweight data analysis tool that lets you upload Excel (.xlsx, .xls) or CSV files and instantly view interactive tables and charts. No sign-up required—just drag, drop, and explore. Perfect for quick data reviews, demos, and portfolio projects.

---

## Features

### Data Visualization

- **Interactive Charts**: Bar charts, line charts, pie charts, and scatter plots
- **Customizable Views**: Select specific columns to visualize with dropdown selectors
- **Trend Detection**: Automatic identification of increasing, decreasing, or stable trends
- **Smart Analysis**: Intelligent detection of numeric and categorical data types

### Data Table

- **Advanced Filtering**: Global search and per-column filtering
- **Dynamic Sorting**: Click column headers to sort ascending/descending
- **Responsive Design**: Horizontal and vertical scrolling for large datasets
- **Real-time Updates**: Instant filtering and sorting without page reload

### User Experience

- **Drag & Drop Upload**: Easy file upload for Excel (.xlsx, .xls) and CSV files
- **Tabbed Interface**: Switch seamlessly between data table and visualizations
- **Scroll to Top**: Quick navigation button for long data sets
- **Mobile Responsive**: Optimized for desktop and mobile devices

---

## Architecture

```
┌──────────────────────────────┐
│ Frontend (Vite + React 19)   │
│  TypeScript, Axios, Recharts │
└───────────────┬──────────────┘
                │  HTTP (Axios)
                ▼
┌──────────────────────────────┐
│ Backend (Express 5)          │
│ Multer, xlsx, Papaparse      │
└───────────────┬──────────────┘
                │  File parsing
                ▼
┌──────────────────────────────┐
│   In-Memory Data Processing  │
└──────────────────────────────┘
```

---

## Tech Stack

### Frontend

- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Recharts** - Beautiful, responsive charts
- **Axios** - HTTP client for API requests

### Backend

- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **Multer** - File upload handling
- **xlsx** - Excel file parsing
- **Papaparse** - CSV file parsing
- **CORS** - Cross-origin resource sharing

---

## Project Structure

```
excel-insights/
├── backend/
│   ├── server.js           # Express server and API endpoints
│   ├── package.json        # Backend dependencies
│   └── node_modules/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── ScrollToTop.tsx
│   │   ├── App.tsx         # Main application component
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── config.ts       # API configuration
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── README.md
└── LICENSE
```

---

## Getting Started

### Backend Setup

**Prerequisites:** Node.js 16+

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

**Prerequisites:** Node.js 16+

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

---

## Configuration

### Backend Environment Variables

- `PORT` - Server port (default: 5000)

### Frontend Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000/api)

---

## Usage

1. **Start the Backend**: Open a terminal in the `backend` directory and run `npm run dev`
2. **Start the Frontend**: Open another terminal in the `frontend` directory and run `npm run dev`
3. **Open Your Browser**: Navigate to `http://localhost:5173`
4. **Upload a File**: Click on the upload area or drag and drop an Excel/CSV file
5. **Explore Your Data**:
   - View data in the **Data Table** tab with filtering and sorting
   - Switch to **Visualizations** tab to see charts and trends
   - Use dropdown selectors to customize which columns are displayed in charts

---

## Development Notes

- **No Authentication**: Simplified for demo and portfolio use
- **In-Memory Processing**: Files are parsed on upload, no database storage
- **CORS Enabled**: Configured for local development
- **Smart Type Detection**: Automatically identifies numeric vs categorical columns
- **Error Handling**: User-friendly error messages for upload failures
- **File Support**: 
  - Excel: .xlsx, .xls
  - CSV: UTF-8 encoded with automatic delimiter detection
- **Data Limits**: 
  - Bar chart: first 10 rows
  - Line chart: first 20 rows
  - Scatter plot: first 50 data points
  - Table: displays all rows with virtual scrolling

---

## Suggested Future Directions

- Add data export (download filtered/sorted data as CSV/Excel)
- Implement data persistence (save analyses to database)
- Add user authentication for saved workspaces
- More chart types (heatmaps, box plots, histograms, area charts)
- Backend pagination for very large datasets (1000+ rows)
- Advanced statistics (mean, median, std deviation, correlation matrix)
- Column data type override (manual numeric/categorical selection)
- Custom chart color schemes
- PDF/PNG export of charts
- Shareable analysis links
- Unit tests (Jest for backend, React Testing Library for frontend)
- Docker containerization for easy deployment

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Express](https://expressjs.com/) - Fast, minimalist web framework
- [React](https://react.dev/) - Powerful frontend library
- [Recharts](https://recharts.org/) - Beautiful, composable charts
- [SheetJS (xlsx)](https://sheetjs.com/) - Robust Excel parsing
- [Papaparse](https://www.papaparse.com/) - Fast CSV parsing
- [Vite](https://vitejs.dev/) - Lightning-fast frontend tooling