const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  // Handle malformed JSON from express.json()
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
};

module.exports = { errorHandler };
