// // src/middleware/uploadProductMedia.js
// import { uploadImages, uploadBrochure } from "./upload.js";

// export const uploadProductMedia = (req, res, next) => {
//   uploadImages(req, res, err => {
//     if (err) return next(err);

//     uploadBrochure(req, res, err2 => {
//       if (err2) return next(err2);
//       next();
//     });
//   });
// };