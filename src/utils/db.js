const { default: mongoose } = require('mongoose');

const initDB = () => {
  // mongoose.connect('mongodb://localhost:27017/moviesDB');
  mongoose.connect(process.env.CONNECTION_URI);
  mongoose.connection.on('connected', () => {
    console.log(' Mongoose connected to moviesDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(' Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log(' Mongoose disconnected');
  });
};

module.exports = {
  initDB,
};
