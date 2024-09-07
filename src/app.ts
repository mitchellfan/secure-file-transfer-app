import express from 'express';
import fileController from './fileController'; // Import the file controller

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Optional: Serve static files from the 'uploads' directory
app.use(express.static('uploads')); // This allows serving uploaded files directly from the 'uploads' folder

// Mount the file controller to handle routes under '/files'
app.use('/files', fileController); // All routes defined in fileController will be prefixed with '/files'

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log the server start
});
