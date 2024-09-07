"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = __importDefault(require("./fileController")); // Adjust the path as necessary
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the uploads directory (optional)
app.use(express_1.default.static('uploads')); // Optional: to serve uploaded files
// Use the file controller
app.use('/files', fileController_1.default); // This mounts the fileController to /files
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
