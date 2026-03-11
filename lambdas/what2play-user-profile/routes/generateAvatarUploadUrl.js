const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client();

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.generateAvatarUploadUrl = async (userId, filename) => {
    if (!filename) {
        throw new HttpError(400, 'filename is required');
    }
    
    // Validate PNG extension
    if (!filename.toLowerCase().endsWith('.png')) {
        throw new HttpError(400, 'Only PNG files are allowed');
    }
    
    const key = `what2play/${userId}/avatar.png`;
    
    const command = new PutObjectCommand({
        Bucket: 'seanezell-cdn-content',
        Key: key,
        ContentType: 'image/png',
        ACL: 'public-read'
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    return {
        upload_url: uploadUrl,
        avatar_url: `https://cdn.seanezell.com/${key}`
    };
};
