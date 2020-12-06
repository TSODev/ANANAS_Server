import l from './logger'
import multer from 'multer'

//var multer = require('multer')

const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheetml")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only excel file.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/..' + "/resources/static/assets/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, `${Date.now()}-tsodev-${file.originalname}`);
    },
});

export var upload = multer({ storage: storage, fileFilter: excelFilter });
// module.exports = upload;
