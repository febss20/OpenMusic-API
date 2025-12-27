require('dotenv').config();

const express = require('express');
const path = require('path');
const ClientError = require('./exceptions/ClientError');
const config = require('./utils/config');

const albumsService = require('./services/AlbumsService');
const AlbumsHandler = require('./handlers/AlbumsHandler');
const albumsRoutes = require('./routes/albums');
const AlbumsValidator = require('./validators/albums');

const songsService = require('./services/SongsService');
const SongsHandler = require('./handlers/SongsHandler');
const songsRoutes = require('./routes/songs');
const SongsValidator = require('./validators/songs');

const UsersService = require('./services/UsersService');
const UsersHandler = require('./handlers/UsersHandler');
const usersRoutes = require('./routes/users');
const UsersValidator = require('./validators/users');

const AuthenticationsService = require('./services/AuthenticationsService');
const AuthenticationsHandler = require('./handlers/AuthenticationsHandler');
const authenticationsRoutes = require('./routes/authentications');
const AuthenticationsValidator = require('./validators/authentications');

const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsHandler = require('./handlers/CollaborationsHandler');
const collaborationsRoutes = require('./routes/collaborations');
const CollaborationsValidator = require('./validators/collaborations');

const PlaylistsService = require('./services/PlaylistsService');
const PlaylistsHandler = require('./handlers/PlaylistsHandler');
const playlistsRoutes = require('./routes/playlists');
const PlaylistsValidator = require('./validators/playlists');

const PlaylistSongActivitiesService = require('./services/PlaylistSongActivitiesService');
const PlaylistSongActivitiesHandler = require('./handlers/PlaylistSongActivitiesHandler');
const activitiesRoutes = require('./routes/activities');

const CacheService = require('./services/redis/CacheService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const UserAlbumLikesHandler = require('./handlers/UserAlbumLikesHandler');
const userAlbumLikesRoutes = require('./routes/userAlbumLikes');

const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validators/uploads');

const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsHandler = require('./handlers/ExportsHandler');
const exportsRoutes = require('./routes/exports');
const ExportsValidator = require('./validators/exports');

const init = async () => {
  const app = express();

  app.use(express.json());

  app.use('/upload/images', express.static(path.resolve(config.storage.localPath)));

  const cacheService = new CacheService();

  const albumsServiceInstance = new albumsService(cacheService);
  const songsServiceInstance = new songsService(cacheService);
  const usersServiceInstance = new UsersService();
  const authenticationsServiceInstance = new AuthenticationsService();
  const collaborationsServiceInstance = new CollaborationsService();
  const activitiesServiceInstance = new PlaylistSongActivitiesService();
  const playlistsServiceInstance = new PlaylistsService(collaborationsServiceInstance, activitiesServiceInstance, cacheService);
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);
  const storageService = new StorageService();
  const producerService = ProducerService;

  const albumsHandler = new AlbumsHandler(albumsServiceInstance, AlbumsValidator, storageService, UploadsValidator);
  const songsHandler = new SongsHandler(songsServiceInstance, SongsValidator);
  const usersHandler = new UsersHandler(usersServiceInstance, UsersValidator);
  const authenticationsHandler = new AuthenticationsHandler(
    authenticationsServiceInstance,
    usersServiceInstance,
    AuthenticationsValidator
  );
  const collaborationsHandler = new CollaborationsHandler(
    collaborationsServiceInstance,
    playlistsServiceInstance,
    usersServiceInstance,
    CollaborationsValidator
  );
  const playlistsHandler = new PlaylistsHandler(playlistsServiceInstance, PlaylistsValidator);
  const activitiesHandler = new PlaylistSongActivitiesHandler(
    activitiesServiceInstance,
    playlistsServiceInstance
  );

  const userAlbumLikesHandler = new UserAlbumLikesHandler(userAlbumLikesService);
  const exportsHandler = new ExportsHandler(producerService, playlistsServiceInstance, ExportsValidator);

  app.use('/albums', albumsRoutes(albumsHandler));
  app.use('/songs', songsRoutes(songsHandler));
  app.use('/users', usersRoutes(usersHandler));
  app.use(authenticationsRoutes(authenticationsHandler));
  app.use('/collaborations', collaborationsRoutes(collaborationsHandler));
  app.use('/playlists', playlistsRoutes(playlistsHandler));
  app.use('/playlists', activitiesRoutes(activitiesHandler));

  app.use('/albums', userAlbumLikesRoutes(userAlbumLikesHandler));
  app.use(exportsRoutes(exportsHandler));

  app.use((err, req, res, next) => {
    if (err instanceof ClientError) {
      return res.status(err.statusCode).json({
        status: 'fail',
        message: err.message,
      });
    }

    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
  });
};

init();
