const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const photosDir = path.join(uploadDir, 'photos');
const docsDir = path.join(uploadDir, 'documents');
const staffPhotosDir = path.join(uploadDir, 'staffPhotos');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(staffPhotosDir)) fs.mkdirSync(staffPhotosDir, { recursive: true });

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'studentPhoto') {
      cb(null, photosDir);
    } else if (file.fieldname === 'photo') {
      cb(null, staffPhotosDir);
    } else {
      cb(null, docsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter (optional validation of file types)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'studentPhoto' || file.fieldname === 'photo') {
    // Images only for photo
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only images (jpg, jpeg, png, webp) are allowed for Photo!'), false);
    }
  } else {
    // Documents: PDF, images, docs
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only PDF, Word documents, or Images are allowed for documents!'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  }
});

const uploadStudentAdmissionFiles = upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'documentFiles', maxCount: 10 }
]);

const uploadAttachment = upload.single('attachment');
const uploadStaffPhoto = upload.single('photo');

module.exports = {
  uploadStudentAdmissionFiles,
  uploadStaffPhoto,
  uploadAttachment,
  upload,
  photosDir,
  staffPhotosDir,
  docsDir,
};

