import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import CryptoJS from 'crypto-js';
import fs from 'fs';

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir); // Create the uploads directory if it doesn't exist
}

// Set up Multer storage for handling file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
    cb(null, uploadsDir); // Set the destination for uploaded files
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
    cb(null, file.originalname); // Use the original file name for the uploaded file
  },
});

const upload = multer({ storage }); // Initialize Multer with the defined storage configuration

// Define the upload route to handle file uploads
router.post('/upload', upload.single('fileUpload'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' }); // Respond with an error if no file was uploaded
  }

  const { encryptionMethod, key } = req.body; // Extract encryption method and key from the request body
  const filePath = path.join(uploadsDir, req.file.filename); // Determine the path for the uploaded file

  // Read the file content
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file.' }); // Handle file read errors
    }

    let encryptedText: string;

    // Encrypt the file content based on the chosen method
    switch (encryptionMethod) {
      case 'AES':
        encryptedText = CryptoJS.AES.encrypt(data, key).toString();
        break;
      case 'DES':
        encryptedText = CryptoJS.DES.encrypt(data, key).toString();
        break;
      case 'RC4':
        encryptedText = CryptoJS.RC4.encrypt(data, key).toString();
        break;
      default:
        return res.status(400).json({ error: 'Invalid encryption method.' }); // Handle invalid encryption methods
    }

    // Save the encrypted text back to the file
    fs.writeFile(filePath, encryptedText, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving encrypted file.' }); // Handle file write errors
      }
      res.json({ message: `File uploaded and encrypted successfully: ${req.file!.originalname}` }); // Respond with success message
    });
  });
});

// Define a route to decrypt and download the file
router.post('/decrypt', (req: Request, res: Response) => {
  const { fileName, key, encryptionMethod } = req.body; // Extract decryption parameters from the request body
  const filePath = path.join(uploadsDir, fileName); // Determine the path for the encrypted file

  fs.readFile(filePath, 'utf8', (err, encryptedData) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading encrypted file.' }); // Handle file read errors
    }

    let decryptedText: string;

    // Decrypt the file content based on the chosen method
    try {
      switch (encryptionMethod) {
        case 'AES':
          decryptedText = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
          break;
        case 'DES':
          decryptedText = CryptoJS.DES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
          break;
        case 'RC4':
          decryptedText = CryptoJS.RC4.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
          break;
        default:
          return res.status(400).json({ error: 'Invalid decryption method.' }); // Handle invalid decryption methods
      }
    } catch (e) {
      return res.status(400).json({ error: 'Decryption failed. Invalid key or encryption method.' }); // Handle decryption failures
    }

    // Write the decrypted content to a new file
    const decryptedFilePath = path.join(uploadsDir, `decrypted_${fileName}`);
    fs.writeFile(decryptedFilePath, decryptedText, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving decrypted file.' }); // Handle file write errors
      }

      // Send the decrypted file as a download
      res.download(decryptedFilePath, `decrypted_${fileName}`, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error sending decrypted file.' }); // Handle download errors
        }
      });
    });
  });
});

export default router; // Export the router for use in the main application
