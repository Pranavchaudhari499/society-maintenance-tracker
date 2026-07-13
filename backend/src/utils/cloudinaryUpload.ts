import cloudinary from "../config/cloudinary";

// Uploads an in-memory file buffer (from Multer) to Cloudinary and resolves with the secure URL.
export function uploadBufferToCloudinary(
    buffer: Buffer,
    folder = "society-tracker/complaints"
): Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Cloudinary upload failed"));
                }
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}