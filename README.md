# Research PDF Generator

A modern web application that generates comprehensive research reports on any topic and allows users to download them as PDFs.

## Features

- Generate detailed research reports on any topic
- View the research results directly in the browser
- Download reports as professionally formatted PDFs
- Light and dark mode support
- Recent topics history
- Responsive design for all devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Flask, WeasyPrint
- **AI**: LangGraph workflow for research generation

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- pip

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```
   python app.py
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

1. Build the frontend:
   ```
   npm run build
   ```
2. The built files will be in the `dist` directory, which the Flask app will serve
3. Run the Flask app:
   ```
   python app.py
   ```
4. Access the application at `http://localhost:5000`

## Deployment

The application is configured for easy deployment:

1. Build the frontend
2. The Flask app is configured to serve the static files from the `dist` directory
3. Deploy the Flask application to your preferred hosting service

## License

This project is licensed under the MIT License - see the LICENSE file for details.
