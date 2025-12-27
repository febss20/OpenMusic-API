const multer = require('multer');

const uploadConfig = {
  limits: {
    fileSize: 512000,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
};

const upload = multer(uploadConfig);

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'fail',
        message: 'Ukuran file terlalu besar. Maksimal 512KB.',
      });
    }
    return res.status(400).json({
      status: 'fail',
      message: 'Error dalam upload file',
    });
  }

  if (error && error.message === 'Only image files are allowed') {
    return res.status(400).json({
      status: 'fail',
      message: 'Hanya file gambar yang diperbolehkan',
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleUploadError,
};
