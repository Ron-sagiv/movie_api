const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
};

module.exports = errorHandler;
