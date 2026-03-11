const { S3Client } = require('@aws-sdk/client-s3');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');

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
    
    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'seanezell-cdn-content',
        Key: key,
        Conditions: [
            ['content-length-range', 0, 5242880], // 5MB max
            ['starts-with', '$Content-Type', 'image/']
        ],
        Fields: {
            acl: 'public-read'
        },
        Expires: 300 // 5 minutes
    });
    
    return {
        upload_url: url,
        fields,
        avatar_url: `https://cdn.seanezell.com/${key}`
    };
};
