import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return null;

        const response = await cloudinary.uploader.destroy(public_id);

        // Check if the deletion was successful
        if (response.result === 'ok') {
            console.log(`File with public_id: ${public_id} successfully deleted from Cloudinary.`);
            return true;  
        } else {
            console.log(`Failed to delete file with public_id: ${public_id}.`);
            return false;  
        }
    } catch (error) {
        console.error("Error while deleting file from Cloudinary:", error);
        return null; 
    }
};

export {uploadOnCloudinary, deleteFromCloudinary};