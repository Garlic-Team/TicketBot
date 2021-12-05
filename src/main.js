// Run bot
require('./bot/index.js');

// Handle errors
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);