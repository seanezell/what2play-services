const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client();

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

exports.generateAvatarUploadUrl = async (userId) => {
    const bucket = 'seanezell-cdn-content';
    const domain = 'cdn.seanezell.com';
    const key = `what2play/${userId}/avatar.png`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'image/png'
    });

    const upload_url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
        upload_url,
        avatar_url: `https://${domain}/${key}`
    };
};
