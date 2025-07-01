import FileService from '../services/fileService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import path from 'path';
import fs from 'fs';

export const upload = async (req, res) => {
    try {
        if (!req.file) {
            errorResponse(res, 'No file uploaded', 400);
        }

        const fileData = {
            original_name: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
            file_name: req.file.filename,
            file_path: req.file.path,
            file_size: req.file.size,
            file_type: req.file.mimetype,
        };

        const file = await FileService.createFile(fileData);
        successResponse(res, 'File uploaded successfully', file, 201);
    } catch (error) {
        console.error('Error uploading file:', error);
        errorResponse(res, 'Failed to upload file', 500);
    }
};

export const download = async (req, res) => {
    try {
        const { id } = req.params;
        const fileRecord = await FileService.getFileById(id);

        if (!fileRecord) {
            errorResponse(res, 'File not found', 404);
        }

        const filePath = path.resolve(fileRecord.file_path);

        if (!fs.existsSync(filePath)) {
            errorResponse(res, 'File not found on server', 404);
        }

        res.download(filePath, fileRecord.original_name, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                errorResponse(res, 'Failed to download file', 500);
            }
        });
    } catch (error) {
        console.error('Error in download controller:', error);
        errorResponse(res, 'Failed to download file', 500);
    }
};

export const serveImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fileRecord = await FileService.getFileById(id);

        if (!fileRecord) {
            return errorResponse(res, 'Image not found', 404);
        }

        // Check if the file is an image
        if (!fileRecord.file_type.startsWith('image/')) {
            return errorResponse(res, 'Not an image file', 400);
        }

        const filePath = path.resolve(fileRecord.file_path);

        if (!fs.existsSync(filePath)) {
            return errorResponse(res, 'Image file not found on server', 404);
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving image:', error);
        next(error);
    }
};
