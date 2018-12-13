// Importation de CLoudinary
const cloudinary = require("cloudinary");
// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const uid2 = require("uid2");
const _ = require("lodash");

const uploadPictures = (req, res, next) => {
  console.log("upload pictures");
  // J'initialise un tableau vide pour mes images uploadées
  const pictures = [];
  // Je récupères le tableau de fichiers
  const files = req.body.photos;
  console.log("​uploadPictures -> req.body", req.body);
  console.log("​uploadPictures -> files", files);
  // J'initialise le nombre de fichiers traités
  let filesProcessed = 0;

  // ETAG
  const etags = [];
  // Et pour chaque fichier dans le tableau, je crée un upload vers Cloudinary
  if (files.length) {
    files.forEach(file => {
      // Je crée un nom spécifique pour la photo
      const name = uid2(16);
      cloudinary.v2.uploader.upload(
        "data:image/jpeg;base64," + file,
        {
          // J'assigne un dossier spécifique dans Cloudinary pour chaque utilisateur
          public_id: `bicycly-cloud/${req.user._id}/${name}`
        },
        (error, result) => {
          console.log("result", result);
          // Si j'ai une erreur avec l'upload, je sors de ma route
          if (error) {
            console.log("​uploadPictures -> error", error);
            return res.status(500).json({ error });
          }
          // Sinon, je push mon image dans le tableau
          const { public_id, created_at, etag, secure_url } = result;
          const picture = {
            public_id,
            created_at,
            etag,
            secure_url
          };
          if (etags.indexOf(picture.etags) === -1) {
            picture.etag = undefined;
            pictures.push(picture);
          }
          etags.push(picture.etag);
          // Et j'incrémente le nombre d'upload
          filesProcessed++;
          console.log("-------\n", picture);
          // Si le nombre d'uploads est égal au nombre de fichiers envoyés...
          if (filesProcessed === files.length) {
            console.log({
              message: `You've uploaded ${pictures.length} files.`
            });
            // Je stocke les images dans l'objet `req`
            req.pictures = pictures;
            // Et je poursuis ma route avec `next()`
            next();
          }
        }
      );
    });
  } else {
    next();
  }
};

module.exports = uploadPictures;
