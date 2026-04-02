const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require('dotenv').config();

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function testConnection() {
    try {
        console.log("🔄 Testing connection to:", process.env.AWS_S3_BUCKET_NAME);
        const command = new ListObjectsV2Command({ Bucket: process.env.AWS_S3_BUCKET_NAME });
        await client.send(command);
        console.log("✅ SUCCESS: Your NestJS app can talk to S3!");
    } catch (err) {
        console.error("❌ FAILED:", err.name, "-", err.message);
        if (err.name === 'SignatureDoesNotMatch') console.log("💡 Tip: Check your Secret Key for typos.");
        if (err.name === 'AccessDenied') console.log("💡 Tip: Your IAM User needs 's3:ListBucket' permission.");
    }
}

testConnection();