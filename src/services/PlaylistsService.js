const { nanoid } = require('nanoid');
const pool = require('../utils/database');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, activitiesService, cacheService) {
    this._pool = pool;
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result || !result.rows || !result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             LEFT JOIN users u ON u.id = p.owner 
             LEFT JOIN collaborations c ON c.playlist_id = p.id 
             WHERE p.owner = $1 OR c.user_id = $1 
             GROUP BY p.id, p.name, u.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result || !result.rows || !result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._activitiesService.addActivity(playlistId, songId, userId, 'add');

    await this._cacheService.delete(`playlist_songs:${playlistId}`);

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    try {

      const cachedPlaylistSongs = await this._cacheService.get(`playlist_songs:${playlistId}`);
      return JSON.parse(cachedPlaylistSongs);
    } catch (error) {
      const playlistQuery = {
        text: `SELECT p.id, p.name, u.username 
                FROM playlists p 
                LEFT JOIN users u ON u.id = p.owner 
                WHERE p.id = $1`,
        values: [playlistId],
      };

      const playlistResult = await this._pool.query(playlistQuery);

      if (!playlistResult.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      const songsQuery = {
        text: `SELECT s.id, s.title, s.performer 
               FROM songs s 
               LEFT JOIN playlist_songs ps ON ps.song_id = s.id 
               WHERE ps.playlist_id = $1`,
        values: [playlistId],
      };

      const songsResult = await this._pool.query(songsQuery);

      const result = {
        playlist: playlistResult.rows[0],
        songs: songsResult.rows,
      };

      await this._cacheService.set(`playlist_songs:${playlistId}`, JSON.stringify(result), 1800);

      return result;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    await this._activitiesService.addActivity(playlistId, songId, userId, 'delete');

    await this._cacheService.delete(`playlist_songs:${playlistId}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
