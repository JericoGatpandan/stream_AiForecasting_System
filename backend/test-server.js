const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
