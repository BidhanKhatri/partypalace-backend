import multer from "multer";

const storage = multer.memoryStorage(); // I am using cloudinary to upload images so, yo use gareko diskStorage ko thau ma

const upload = multer({ storage });

export default upload;
