const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.setEx(key, expirationInSecond, value);
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan');
    return result;
  }

  async delete(key) {
    return this._client.del(key);
  }

  async deletePattern(pattern) {
    const keys = await this._client.keys(pattern);
    if (keys.length > 0) {
      return this._client.del(keys);
    }
    return 0;
  }
}

module.exports = CacheService;
