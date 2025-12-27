class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(req, res) {
    try {
      this._validator.validateUserPayload(req.body);
      const { username, password, fullname } = req.body;

      const userId = await this._service.addUser({ username, password, fullname });

      return res.status(201).json({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId,
        },
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

  async getUserByIdHandler(req, res) {
    try {
      const { id } = req.params;
      const user = await this._service.getUserById(id);

      return res.json({
        status: 'success',
        data: {
          user,
        },
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
}

module.exports = UsersHandler;
