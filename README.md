# GlintLab App

GlintLab is a web application for uploading CSV data and generating scientific visualizations. It is built with Next.js, React, Tailwind CSS, and Python for backend data processing.

## Features
- **CSV Upload:** Upload CSV files, which are stored in the `data/` directory.
- **Visualization Generation:** Generate heatmaps, boxplots, and histograms from uploaded data using Python scripts.
- **Saved Visualizations:** View and manage previously generated visualizations.
- **Cleanup Endpoint:** Remove all data and output files via an API call.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes, Node.js, Python (for data processing)
- **Visualization:** Python scripts (matplotlib, pandas, seaborn, etc.)
- **UI Components:** Radix UI, custom components

## Directory Structure
- `app/` - Next.js app directory (pages, API routes, UI)
  - `page.tsx` - Landing/sign-in page
  - `upload/` - File upload page
  - `visualization-type/` - Visualization type selection page
  - `results/` - Visualization parameter selection and results page
  - `saved-visualizations/` - Saved visualizations page
  - `api/` - API endpoints
- `components/` - Reusable React components (UI, layout, etc.)
- `data/` - Uploaded CSV files
- `public/` - Static assets (logos, example images)
- `scripts/` - Python scripts for data processing/visualization
- `styles/` - Global styles (Tailwind CSS)
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries

## User Flow
1. **Sign In:** User enters their email to sign in (no password required).
2. **Upload:** User uploads a CSV file, which is stored in the `data/` directory.
3. **Visualization Type:** User selects the type of visualization (heatmap, boxplot, histogram, etc.).
4. **Parameters & Results:** User customizes visualization parameters and generates a chart.
5. **Saved Visualizations:** User can view and manage previously generated visualizations.
6. **Cleanup:** Users or admins can clean up all data via the cleanup endpoint.

## API Endpoints
### `/api/upload` (POST)
- **Description:** Upload a CSV file. Requires `file` in the form data.
- **Behavior:** Stores the file in the `data/` directory.

### `/api/run-visualization` (POST)
- **Description:** Runs a Python script to generate a visualization from the uploaded CSV.
- **Parameters:**
  - `type`: Visualization type (`heatmap`, `box_and_scatter`, `box_whisker`, `histogram`)
  - Additional options depending on type (see code for details)
- **Behavior:** Returns a base64-encoded image of the visualization.

### `/api/cleanup` (POST)
- **Description:** Deletes all files in the `data/` and `output/` directories.
- **Behavior:** Used for cleaning up user data and generated results.

## Python Scripts
- `scripts/Heatmap_TMA.py` - Generates heatmaps from CSV data, with customizable color maps, font styles, and sample filtering.
- `scripts/BoxPlot_Area.py` - Generates boxplots (with optional scatter overlay) for grouped data, supporting custom palettes and fonts.
- `scripts/create_histogram.py` - Generates histograms for value distributions, with support for filtering and custom colors.
- `scripts/utils.py` - Shared utilities for data loading and processing.

## UI Components
- Extensive set of reusable UI components in `components/ui/` (buttons, cards, dialogs, forms, tables, etc.)
- Custom components for navigation (hamburger menu), theming, and more.

## Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd glintlab-app
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```
3. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
4. **Build and run in production:**
   ```bash
   pnpm build && pnpm start
   # or
   npm run build && npm start
   ```
5. **Docker (optional):**
   ```bash
   docker build -t glintlab-app .
   docker run -p 3000:3000 glintlab-app
   ```

## Development Notes
- All uploaded data is stored in the `data/` directory.
- Heartbeat and session timeout/cleanup features can be added as needed.

## License
MIT (or specify your license)