require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

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

db.sequelize.sync({ force: false }).then(() => {
  app.listen(3001, () => {
    console.log("Weather App Server running on https://localhost:3001");
    console.log("Database connected successfully");
  });
}).catch(err => {
  console.error("Database connection failed:", err);
});
