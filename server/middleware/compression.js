
const compression = require('compression');

/**
 * Configuration for response compression
 * @returns {Function} compression middleware
 */
const configureCompression = () => {
  return compression({
    // Only compress responses larger than 1KB
    threshold: 1024,
    // Don't compress responses with this content-type
    filter: (req, res) => {
      if (res.getHeader('Content-Type') === 'text/event-stream') {
        return false;
      }
      return compression.filter(req, res);
    },
    // compression level (0-9)
    level: 6
  });
};

module.exports = configureCompression;
