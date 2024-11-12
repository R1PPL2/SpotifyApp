const express = require('express');
const router = express.Router();
const app = express();

app.get('/api/greet', (req, res) => {
    res.json({ message: 'Hello from server!' });
    });

app.post('/api/data', (req, res) => {
    const data = req.body;
    res.json({ receivedData: data });
    });

module.exports = router;

