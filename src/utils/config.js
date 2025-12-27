const config = {
  database: {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'openmusic',
    password: process.env.PGPASSWORD || '',
    port: process.env.PGPORT || 5432,
  },

  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE || '1h',
  },

  redis: {
    host: process.env.REDIS_SERVER,
  },

  rabbitmq: {
    server: process.env.RABBITMQ_SERVER || 'amqp://guest:guest@localhost:5672',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME,
  },

  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    localPath: process.env.STORAGE_PATH || './uploads',
  },

  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
};

module.exports = config;
