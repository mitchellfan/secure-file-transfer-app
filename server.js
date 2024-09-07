const express = require('express');
const path = require('path');
const fileController = require('./dist/fileController').default; // Use .default to access the default export from fileController

const app = express();
const PORT = process.env.PORT || 3000; // Use the environment's PORT or default to 3000

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder for the login and upload pages
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// Use the file controller for handling file-related routes
app.use('/files', fileController); // Route for file upload and decryption

// Serve the login page at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve the login page when accessing the root
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log the server start message
});
