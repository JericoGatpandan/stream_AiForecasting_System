# Weather Application - Full Stack Web App

# Live Preview: https://snazzy-toffee-2cae86.netlify.app/

A comprehensive weather monitoring and forecasting application built with React, Express.js, MySQL, and Node.js. This application provides detailed weather insights, interactive maps, custom alerts, and expert meteorological analysis.

## 🌟 Features

### Forecast Summaries
- Clear overviews of expected weather patterns
- 7-day detailed forecasts with hourly breakdowns
- Temperature, precipitation, wind, and visibility data
- Expert meteorological analysis and insights

### Interactive Weather Visualization
- **Interactive Maps**: Explore weather layers including temperature, precipitation, wind speed, humidity, visibility, and UV index
- **Real-time Data**: Live weather station monitoring with color-coded indicators
- **Multiple Map Layers**: Light, satellite, and terrain views
- **Weather Alerts**: Visual representation of active weather warnings

### Location-Specific Forecasts
- Detailed updates for multiple locations
- Easy-to-navigate format with comprehensive data
- Location management and favorites system
- Customizable location preferences

### Weather Notifications & Alerts
- **Severe Weather Alerts**: Real-time notifications for dangerous conditions
- **Custom Triggers**: Manually set weather conditions to track
- **Industry-Tailored Alerts**: Advanced warnings based on industry impact
- **Multiple Notification Methods**: In-app, email, SMS, and push notifications

### Advanced Analytics
- Historical weather data visualization
- Interactive charts and graphs
- Data export capabilities
- Trend analysis and forecasting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stream_workspace
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Database Configuration**
   - Create a MySQL database named `weather_app`
   - Update database credentials in `backend/config/config.json`:
     ```json
     {
       "development": {
         "username": "root",
         "password": "your_password",
         "database": "weather_app",
         "host": "localhost",
         "dialect": "mysql"
       }
     }
     ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=weather_app
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:3001`

2. **Seed the Database** (Optional)
   ```bash
   cd backend
   node seedDatabase.js
   ```

3. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
stream_workspace/
├── backend/
│   ├── config/
│   │   └── config.json          # Database configuration
│   ├── data/                    # CSV data files
│   ├── models/                  # Sequelize models
│   │   ├── environmentalData.js
│   │   ├── weatherForecast.js
│   │   ├── weatherAlert.js
│   │   ├── userLocation.js
│   │   ├── weatherTrigger.js
│   │   ├── notification.js
│   │   └── index.js
│   ├── routes/                  # API routes
│   │   ├── environmentalData.js
│   │   └── weather.js
│   ├── index.js                 # Main server file
│   ├── package.json
│   └── seedDatabase.js          # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── pages/               # React components
│   │   │   ├── Home.jsx         # Dashboard
│   │   │   ├── Forecast.jsx     # Weather forecasts
│   │   │   ├── Map.jsx          # Interactive weather map
│   │   │   ├── Analytics.jsx    # Data analytics
│   │   │   └── Alerts.jsx       # Notifications & triggers
│   │   ├── services/
│   │   │   └── weatherService.js # API service layer
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Weather Data
- `GET /weather/forecast/:location` - Get 7-day forecast
- `GET /weather/forecast/hourly/:location` - Get hourly forecast
- `GET /weather/summary/:location` - Get weather summary
- `GET /weather/analysis/:location` - Get expert analysis

### Weather Alerts
- `GET /weather/alerts` - Get all active alerts
- `GET /weather/alerts/:location` - Get location-specific alerts

### User Locations
- `GET /weather/locations` - Get user locations
- `POST /weather/locations` - Add new location
- `PUT /weather/locations/:id` - Update location
- `DELETE /weather/locations/:id` - Delete location

### Weather Triggers
- `GET /weather/triggers` - Get all triggers
- `POST /weather/triggers` - Create new trigger
- `PUT /weather/triggers/:id` - Update trigger
- `DELETE /weather/triggers/:id` - Delete trigger

### Notifications
- `GET /weather/notifications` - Get notifications
- `PUT /weather/notifications/:id/read` - Mark as read

### Environmental Data
- `GET /environmental/:barangay` - Get environmental data

## 🎨 Features Overview

### Dashboard
- Weather overview cards with key metrics
- Active alerts and notifications
- Quick action buttons
- Location selector

### Forecast Page
- **Summary View**: Current conditions and expert analysis
- **Detailed View**: 7-day forecast with comprehensive data
- **Hourly View**: 24-hour detailed breakdown table
- Interactive weather icons and severity indicators

### Interactive Weather Map
- Multiple weather layers (temperature, precipitation, wind, humidity, visibility, UV)
- Real-time weather station data
- Weather alert overlays
- Multiple map styles (light, satellite, terrain)
- Color-coded indicators based on weather conditions

### Alerts & Notifications
- **Notifications Tab**: Recent weather alerts and system notifications
- **Triggers Tab**: Custom weather condition monitoring
- **Add Trigger**: Create custom alerts for specific conditions
- **Severity Levels**: Info, warning, and critical notifications

### Analytics
- Historical data visualization
- Interactive charts and graphs
- Data export capabilities
- Environmental monitoring data

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **MySQL** - Database
- **Axios** - HTTP client
- **Moment.js** - Date manipulation
- **Node-cron** - Task scheduling

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Axios** - API calls
- **React Toastify** - Notifications
- **Date-fns** - Date utilities

## 🔐 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weather_app

# Weather API Configuration
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📊 Database Schema

The application uses the following main models:

- **EnvironmentalData**: Historical environmental monitoring data
- **WeatherForecast**: 7-day weather forecasts with expert analysis
- **WeatherAlert**: Active weather warnings and alerts
- **UserLocation**: User-managed locations and preferences
- **WeatherTrigger**: Custom weather condition monitoring
- **Notification**: System notifications and alerts

## 🚀 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm start
   ```

### Docker Deployment (Optional)

Create a `docker-compose.yml` file for containerized deployment:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: weather_app
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: your_password
      DB_NAME: weather_app

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Real-time weather API integration
- Mobile app development
- Advanced machine learning predictions
- Social sharing features
- Weather data export
- Multi-language support
- Advanced user authentication
- Weather camera integration
