const express = require('express');
const app = express();

// Example route
app.get('/', (req, res) => {
  res.send('Hello, Cloud Run with HTTP externally!');
});

// Cloud Run provides the `PORT` environment variable
const PORT = process.env.PORT || 8080; // Default to 8080
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});