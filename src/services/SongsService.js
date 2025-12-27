const { nanoid } = require('nanoid');
const pool = require('../utils/database');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');

class SongsService {
  constructor(cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs(id, title, year, performer, genre, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result || !result.rows || !result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    const cacheKey = `songs:${title || 'all'}:${performer || 'all'}`;

    try {
      const cachedSongs = await this._cacheService.get(cacheKey);
      return JSON.parse(cachedSongs);
    } catch (error) {
      let query = 'SELECT id, title, performer FROM songs';
      const values = [];
      const conditions = [];

      if (title) {
        conditions.push(`title ILIKE $${conditions.length + 1}`);
        values.push(`%${title}%`);
      }

      if (performer) {
        conditions.push(`performer ILIKE $${conditions.length + 1}`);
        values.push(`%${performer}%`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this._pool.query({
        text: query,
        values,
      });

      await this._cacheService.set(cacheKey, JSON.stringify(result.rows), 1800);

      return result.rows;
    }
  }

  async getSongById(id) {
    try {
      const cachedSong = await this._cacheService.get(`song:${id}`);
      return JSON.parse(cachedSong);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result || !result.rows || !result.rows.length) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const song = result.rows[0];
      const formattedSong = {
        id: song.id,
        title: song.title,
        year: song.year,
        performer: song.performer,
        genre: song.genre,
        duration: song.duration,
        albumId: song.album_id,
      };

      await this._cacheService.set(`song:${id}`, JSON.stringify(formattedSong), 3600);

      return formattedSong;
    }
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result || !result.rows || !result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete(`song:${id}`);
    await this._cacheService.deletePattern('songs:*');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result || !result.rows || !result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`song:${id}`);
    await this._cacheService.deletePattern('songs:*');
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = SongsService;
