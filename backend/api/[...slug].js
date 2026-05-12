/**
 * Vercel serverless catch-all under /api/* so nested routes (e.g. /api/product-ai/identify-from-image)
 * reach the Express app. api/index.js only handles the exact /api path.
 */
module.exports = require("../server");
