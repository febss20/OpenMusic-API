const { nanoid } = require('nanoid');
const pool = require('../utils/database');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = pool;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time 
             FROM playlist_song_activities psa 
             LEFT JOIN users u ON u.id = psa.user_id 
             LEFT JOIN songs s ON s.id = psa.song_id 
             WHERE psa.playlist_id = $1 
             ORDER BY psa.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
