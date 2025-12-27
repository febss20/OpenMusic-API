exports.up = (pgm) => {
  pgm.renameColumn('albums', 'cover_url', 'coverUrl');
};

exports.down = (pgm) => {
  pgm.renameColumn('albums', 'coverUrl', 'cover_url');
};
