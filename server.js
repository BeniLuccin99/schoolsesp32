// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS for frontend
app.use(cors());
app.use(express.json());

// In-memory storage
let sensorData = {};

// Alert thresholds
const THRESHOLDS = {
  temperature: { min: 15, max: 35 },
  humidity: { min: 30, max: 80 },
  pressure_hpa: { min: 950, max: 1050 },
  sound: { max: 4000 },
  smoke: { max: 1500 }
};

// Check alerts based on thresholds
function checkAlerts(data) {
  const alerts = [];
  
  if (data.temperature < THRESHOLDS.temperature.min || data.temperature > THRESHOLDS.temperature.max) {
    alerts.push('Temperature out of range');
  }
  if (data.humidity < THRESHOLDS.humidity.min || data.humidity > THRESHOLDS.humidity.max) {
    alerts.push('Humidity out of range');
  }
  if (data.pressure_hpa < THRESHOLDS.pressure_hpa.min || data.pressure_hpa > THRESHOLDS.pressure_hpa.max) {
    alerts.push('Pressure out of range');
  }
  if (data.sound > THRESHOLDS.sound.max) {
    alerts.push('High noise level');
  }
  if (data.smoke > THRESHOLDS.smoke.max) {
    alerts.push('Smoke detected');
  }
  
  return alerts.length > 0 ? alerts : null;
}

// ESP32 pushes data
app.post('/api/sensor/data', (req, res) => {
  const data = req.body;
  const alerts = checkAlerts(data);
  
  sensorData = {
    ...data,
    timestamp: new Date().toISOString(),
    alerts: alerts,
    alertStatus: alerts ? true : false
  };
  
  console.log('Received from ESP32:', sensorData);
  res.status(200).json({ status: 'ok', alertStatus: sensorData.alertStatus });
});

// Get latest sensor data
app.get('/api/sensor/data', (req, res) => {
  if (Object.keys(sensorData).length === 0) {
    return res.status(404).json({ error: 'No sensor data available' });
  }
  res.json(sensorData);
});

// Get alert status and thresholds
app.get('/api/alerts', (req, res) => {
  res.json({
    alertStatus: sensorData.alertStatus || false,
    alerts: sensorData.alerts || null,
    thresholds: THRESHOLDS,
    lastUpdate: sensorData.timestamp || null
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ESP32 Environment Monitor API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
