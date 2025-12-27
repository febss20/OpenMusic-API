const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const config = require('../../utils/config');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool(config.database);
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    await this._verifyAlbumExists(albumId);

    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Album sudah disukai');
    }

    const id = `like-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, userId, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);

    return result.rows[0].id;
  }

  async removeLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like tidak ditemukan');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return parseInt(result, 10);
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const count = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album_likes:${albumId}`, count.toString(), 1800);

      return count;
    }
  }

  async getLikesCountWithSource(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return {
        count: parseInt(result, 10),
        isFromCache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const count = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album_likes:${albumId}`, count.toString(), 1800);

      return {
        count,
        isFromCache: false,
      };
    }
  }

  async verifyUserLike(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async _verifyAlbumExists(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = UserAlbumLikesService;
