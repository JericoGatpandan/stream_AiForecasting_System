require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

const PORT = process.env.PORT || 5500;

// Routes
const environmentalRouter = require("./routes/environmentalData");
const weatherRouter = require("./routes/weather");
const barangayRoutes = require("./routes/barangays");
const floodCharacteristicsRouter = require("./routes/floodCharacteristics");

app.use("/environmental", environmentalRouter);
app.use("/weather", weatherRouter);
app.use("/barangays", barangayRoutes);
app.use("/flood", floodCharacteristicsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// For Docker or local development
if (process.env.NODE_ENV !== 'vercel') {
  db.sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
      console.log(`Weather App Server running on http://localhost:${PORT}`);
      console.log("Database connected successfully");
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
} else {
  // For Vercel deployment - don't sync database on every request
  console.log('Running in Vercel mode');
}

// Export for Vercel
module.exports = app;
