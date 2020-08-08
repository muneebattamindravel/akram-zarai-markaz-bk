const app = require('..');
const imagesController = require('../controllers/images.controller');
const  multipart  =  require('connect-multiparty');
const  multipartMiddleware  =  multipart({ uploadDir:  './images' });

app.post('/images/upload', multipartMiddleware, imagesController.uploadImage);
app.delete('/images/delete/:path', multipartMiddleware, imagesController.deleteImage);