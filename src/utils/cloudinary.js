import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadoncloudinary = async (localfilepath) => {
    try {
        console.log("LOCAL FILE PATH:", localfilepath);

        if (!localfilepath) {
            console.log("NO FILE PATH");
            return null;
        }

        console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("API KEY EXISTS:", !!process.env.CLOUDINARY_API_KEY);
        console.log("API SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        console.log("CLOUDINARY RESPONSE:", response);

        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        return response;

    } catch (error) {
        console.error("========== CLOUDINARY ERROR ==========");
        console.error(error);
        console.error("======================================");

        if (localfilepath && fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        return null;
    }
};


export { uploadoncloudinary };
