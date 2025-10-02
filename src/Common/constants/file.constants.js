
export const fileTypes = {
    IMAGE : "image",
    VIDEO : "video",
    AUDIO : "audio",
    DOCUMENT : "document",
    APPLICATION : "application"
}


export const allowedFileExtensions = {
    [fileTypes.IMAGE] : ["png" , "jpg" , "jpeg" , "gif" , "webp"],
    [fileTypes.VIDEO] : ["mp4" , "avi" , "mkv" , "mov" , "wmv"],
    [fileTypes.AUDIO] : ["mp3" , "wav" , "aac" , "flac" , "ogg"],
    [fileTypes.DOCUMENT] : ["pdf" , "doc" , "docx" , "xls" , "xlsx"],
    [fileTypes.APPLICATION] : ["zip" , "rar" , "7z" , "exe" , "msi"]   
}