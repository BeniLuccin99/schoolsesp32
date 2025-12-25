// server.js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

let sensorData = {};

app.post('/api/sensor/data', (req, res) => {
  sensorData = req.body; // Save latest data
  console.log('Received from ESP32:', sensorData);
  res.status(200).send({status: 'ok'});
});

app.get('/api/sensor/data', (req, res) => {
  res.json(sensorData); // Serve latest data
});

app.get('/', (req, res) => {
  res.send('Esp32 Sensor Data Server is running');
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
