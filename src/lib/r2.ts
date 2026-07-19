import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";

export const isR2Configured = () => {
  return (
    accountId !== "" &&
    accessKeyId !== "" &&
    secretAccessKey !== "" &&
    !accountId.includes("your-") &&
    !accessKeyId.includes("your-")
  );
};

export const r2Client = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "https://placeholder.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: accessKeyId || "placeholder",
    secretAccessKey: secretAccessKey || "placeholder",
  },
});
