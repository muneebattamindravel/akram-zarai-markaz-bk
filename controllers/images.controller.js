const IMAGES_STRINGS = require('../constants/images.strings')
var fs = require('fs');
/**uploads an image file to the server */
const uploadImage = async (req, res) => {
    try {
        var tmp_path = req.files.uploads[0].path;
        var target_path = process.env.IMAGES_URL + '/' + req.files.uploads[0].name;
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                res.send({message: `${IMAGES_STRINGS.IMAGE_UPLOADED} : ${target_path}`});
            });
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err.message.toString(), message: IMAGES_STRINGS.IMAGE_NOT_UPLOADED, stack: err.stack})
    }
}

const deleteImageInternal = async (path) => {
    try {
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return false
            }
            return true
        })
    }
    catch (err) {
        console.log(err)
    }
}

const deleteImage = async (req, res) => {
    try {
        const path = `${process.env.IMAGES_URL }/${req.params.path}`
        fs.exists(path, (exists) => {
            if (exists) {
                fs.unlink(path, (err) => {
                    if (err) throw err
                    res.send({message: IMAGES_STRINGS.IMAGE_DELETED})
                })
            }
            else {
                res.send({message: IMAGES_STRINGS.IMAGE_NOT_DELETED})
            }
        }) 
    }
    catch (err) {
        console.log(err)
        res.status(500).send({raw: err.message.toString(), message: IMAGES_STRINGS.IMAGE_NOT_DELETED, stack: err.stack})
    }
}

module.exports = {
    uploadImage,
    deleteImage,
    deleteImageInternal,
}