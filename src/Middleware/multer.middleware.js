import multer from "multer";
import fs from "node:fs";
import {allowedFileExtensions, fileTypes} from "../Common/constants/file.constants.js";


function checkFolder(folderPath){
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath , {recursive : true});
    }
}

export const localUpload = ({
    folderPath = 'samples'
}) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            checkFolder(`uploads/${folderPath}`)
            cb(null, `uploads/${folderPath}`)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            console.log(uniqueSuffix + file.originalname)
            cb(null, uniqueSuffix + file.originalname)
        }
    })
    
    const fileFilter = (req , file , cb) => {
        const fileKey = file.mimetype.split("/")[0].toUpperCase()
        const fileType = fileTypes[fileKey];
        if(!fileType){
            return cb(new Error("Invalid file type") , false)
        }

        const fileExtension = file.mimetype.split("/")[1];
        if(!allowedFileExtensions[fileType].includes(fileExtension)){
            return cb(new Error("Invalid file extension") , false)
        }
        cb(null , true)
    }
    
    return multer({fileFilter , storage })
}