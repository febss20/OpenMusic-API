const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService) {
    this._userAlbumLikesService = userAlbumLikesService;

    autoBind(this);
  }

  async postLikeHandler(request, res) {
    try {
      const { albumId } = request.params;
      const { id: userId } = request.auth;

      await this._userAlbumLikesService.addLike(userId, albumId);

      return res.status(201).json({
        status: 'success',
        message: 'Album berhasil disukai',
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async deleteLikeHandler(request, res) {
    try {
      const { albumId } = request.params;
      const { id: userId } = request.auth;

      await this._userAlbumLikesService.removeLike(userId, albumId);

      return res.status(200).json({
        status: 'success',
        message: 'Album batal disukai',
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async getLikesHandler(request, res) {
    try {
      const { albumId } = request.params;
      const result = await this._userAlbumLikesService.getLikesCountWithSource(albumId);

      const response = {
        status: 'success',
        data: {
          likes: result.count,
        },
      };

      if (result.isFromCache) {
        res.set('X-Data-Source', 'cache');
      }

      return res.status(200).json(response);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }
}

module.exports = UserAlbumLikesHandler;
