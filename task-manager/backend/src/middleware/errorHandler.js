const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === '22P02' || err.code === '23505' || err.code === '23514') {
    return res.status(400).json({ message: 'Invalid or conflicting data.' });
  }

  res.status(err.statusCode || 500).json({ message: err.message || 'An unexpected error occurred.' });
};

module.exports = errorHandler;
