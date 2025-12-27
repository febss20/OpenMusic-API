const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../../utils/config');

class StorageService {
  constructor() {
    this._storageType = config.storage.type;

    if (this._storageType === 's3') {
      this._S3 = new S3Client({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
    }
  }

  writeFile(file, meta) {
    if (this._storageType === 's3') {
      return this._writeFileS3(file, meta);
    }
    return this._writeFileLocal(file, meta);
  }

  async _writeFileLocal(file, meta) {
    const filename = +new Date() + meta.filename;
    const uploadPath = path.resolve(config.storage.localPath, filename);

    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await fs.promises.writeFile(uploadPath, file);
    return filename;
  }

  async _writeFileS3(file, meta) {
    const filename = +new Date() + meta.filename;

    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: filename,
      Body: file,
      ContentType: meta.headers['content-type'],
    });

    const result = await this._S3.send(command);

    const s3Url = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${filename}`;
    return s3Url;
  }

  getFileUrl(filename) {
    if (this._storageType === 's3') {
      return filename;
    }

    return `http://${config.server.host}:${config.server.port}/upload/images/${filename}`;
  }
}

module.exports = StorageService;
