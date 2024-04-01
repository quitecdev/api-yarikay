const FileModel = require('../models/file.model');

let getFile = (req, res) => {
    try {
        let filename = req.params.filename;
        FileModel.findOne({ filename }).exec((err, file) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!file) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El archivo no existe'
                    }
                });
            }

            // res.json({
            //     ok: true,
            //     file
            // });

            var pdf = Buffer.from(file.metadata, 'base64');

            res.writeHead(200, {
                'Content-Type': file.contentType,
                'Content-Length': pdf.length
            });
            res.end(pdf)
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            err
        });
    }

}

let uploadFile = (req, res) => {

    const file = req.file;

    var extension = getFileExtension(file.originalname);
    let filename = `${Math.random().toString(36).substring(2, 15)}.${extension}`;

    var buffer = file.buffer;
    var data = buffer.toString('base64');

    var contentType = file.mimetype;
    var size = file.size;

    let newFile = FileModel({
        filename: filename,
        metadata: data,
        contentType: contentType,
        size: size
    });

    newFile.save((err, file) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            filename: file.filename
        });
    });
}

let getFileExtension = (filename) => {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
}


let uploadFileBase = (req, res) => {
    const base64String = req.body.base64image;

    const buffer = Buffer.from(base64String.substring(base64String.indexOf(',') + 1));
    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`;

    var contentType = "application/pdf";
    var size = buffer.length;

    let newFile = FileModel({
        filename: filename,
        metadata: base64String,
        contentType: contentType,
        size: size
    });

    newFile.save((err, file) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            filename: file.filename
        });
    });
}

let getAllFiles = (req, res) => {
    try {

        FileModel.find({}, { _id: 1, filename: 1 }).exec((err, files) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                files
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let deleteforId = (req, res) => {
    try {
        let id = req.params.id;

        FileModel.findByIdAndDelete(id, (err, file) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}


let getFileForName = (req, res) => {

    let name = req.params.filename;
    FileModel.findOne({ filename: name }, (err, file) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (file) {
            res.json({
                ok: true,
            })
        } else {
            res.json({
                ok: false,
            })
        }
    });
}


module.exports = {
    getFile,
    uploadFile,
    uploadFileBase,
    getAllFiles,
    deleteforId,
    getFileForName
}