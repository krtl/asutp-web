module.exports = (err, req, res, next) => {
  const isNotFound = ~err.message.indexOf('not found');
  const isCastError = ~err.message.indexOf('Cast to ObjectId failed');
  if (err.message && (isNotFound || isCastError)) {
    return next();
  }
  // console.log(err.stack);
  res.status(500).json({ error: err.stack });
};
