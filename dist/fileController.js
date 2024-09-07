"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Ensure the uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir);
}
// Set up Multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
// Define the upload route
router.post('/upload', upload.single('fileUpload'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { encryptionMethod, key } = req.body;
    const filePath = path_1.default.join(uploadsDir, req.file.filename);
    // Read the file content
    fs_1.default.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading file.' });
        }
        let encryptedText;
        // Encryption based on the chosen method
        switch (encryptionMethod) {
            case 'AES':
                encryptedText = crypto_js_1.default.AES.encrypt(data, key).toString();
                break;
            case 'DES':
                encryptedText = crypto_js_1.default.DES.encrypt(data, key).toString();
                break;
            case 'RC4':
                encryptedText = crypto_js_1.default.RC4.encrypt(data, key).toString();
                break;
            default:
                return res.status(400).json({ error: 'Invalid encryption method.' });
        }
        // Save the encrypted text back to the file
        fs_1.default.writeFile(filePath, encryptedText, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error saving encrypted file.' });
            }
            res.json({ message: `File uploaded and encrypted successfully: ${req.file.originalname}` });
        });
    });
});
// Define a route to decrypt and download the file
router.post('/decrypt', (req, res) => {
    const { fileName, key, encryptionMethod } = req.body;
    const filePath = path_1.default.join(uploadsDir, fileName);
    fs_1.default.readFile(filePath, 'utf8', (err, encryptedData) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading encrypted file.' });
        }
        let decryptedText;
        // Decryption based on the chosen method
        try {
            switch (encryptionMethod) {
                case 'AES':
                    decryptedText = crypto_js_1.default.AES.decrypt(encryptedData, key).toString(crypto_js_1.default.enc.Utf8);
                    break;
                case 'DES':
                    decryptedText = crypto_js_1.default.DES.decrypt(encryptedData, key).toString(crypto_js_1.default.enc.Utf8);
                    break;
                case 'RC4':
                    decryptedText = crypto_js_1.default.RC4.decrypt(encryptedData, key).toString(crypto_js_1.default.enc.Utf8);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid decryption method.' });
            }
        }
        catch (e) {
            return res.status(400).json({ error: 'Decryption failed. Invalid key or encryption method.' });
        }
        // Write the decrypted content to a new file
        const decryptedFilePath = path_1.default.join(uploadsDir, `decrypted_${fileName}`);
        fs_1.default.writeFile(decryptedFilePath, decryptedText, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error saving decrypted file.' });
            }
            // Send the decrypted file as a download
            res.download(decryptedFilePath, `decrypted_${fileName}`, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error sending decrypted file.' });
                }
            });
        });
    });
});
exports.default = router;
