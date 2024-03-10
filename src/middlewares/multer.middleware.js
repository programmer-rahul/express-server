import multer from "multer";

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    let fileExtention = "";

    if (file.originalname.split(".").length > 1) {
      fileExtention = file.originalname.substring(
        file.originalname.lastIndexOf(".")
      );
    }
    const filenameWithoutExtension = file.originalname
      .toLowercase()
      .split(" ")
      .join("")
      ?.split(".")[0];

    cb(null, filenameWithoutExtension + Date.now() + fileExtention);
  },
});

const upload = multer({
  multerStorage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});

export { upload };
