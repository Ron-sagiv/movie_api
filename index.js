const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser');

// Import Routes
const userRoutes = require('./src/routes/user');
const movieRoutes = require('./src/routes/movie');

// Import Middlewares
const { errorHandler } = require('./src/middlewares');

// Load Environment Variables
const dotenv = require('dotenv');
dotenv.config();

// Initialize DB
const { initDB } = require('./src/utils/db');
initDB();

// Express App Init
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// CORS Setting
const cors = require('cors');
app.use(cors());

require('./auth')(app);

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to my movie app!' });
});

// Routes
app.use('/v1/users', userRoutes);
app.use('/v1/movies', movieRoutes);

app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
