import multer from 'multer';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const acceptedDocuments = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.storage.maxFileMb * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (acceptedDocuments.has((file.mimetype || '').toLowerCase())) return callback(null, true);
    return callback(new ApiError(400, 'Unsupported CV file type', 'UNSUPPORTED_MEDIA_TYPE'));
  },
});

export const uploadCvDocument = upload.single('document');

export function handleUploadError(error, _request, _response, next) {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return next(new ApiError(413, `CV file is too large (max ${config.storage.maxFileMb}MB)`, 'FILE_TOO_LARGE'));
  }
  return next(error);
}
