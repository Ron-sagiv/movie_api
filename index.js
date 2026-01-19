const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Models = require('./models.js');
const { check, validationResult } = require('express-validator');

// Load Environment Variables
const dotenv = require('dotenv');
dotenv.config();

const Movies = Models.Movie;
const Users = Models.User;

// ------------Is DB connected-----------------
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

// Express App Init
const app = express();
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true })); Do I need this???
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// CORS Setting
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app); //import auth.js file
const passport = require('passport');
//-----------------
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to my movie app!' });
});

/* ================= USERS ROUTES ================= */

//------------------Add a user -----NEW-------------------------------------------------
/* We’ll expect JSON in this format
{
  ID: Integer,
  userName: String,
  password: String,
  email: String,
  birthday: Date
}*/
app.post(
  '/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('userName', 'userName is required').isLength({ min: 5 }),
    check(
      'userName',
      'userName contains non alphanumeric characters - not allowed.',
    ).isAlphanumeric(),
    check('password', 'password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ userName: req.body.userName }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.userName + ' already exists');
        } else {
          Users.create({
            userName: req.body.userName,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  },
);

// ---------------Get all users---NEW-------------
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  },
);

// -------Get a user by username----NEW---------------------------
app.get(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({ userName: req.params.userName })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  },
);

// ----------Update a user's info, by username-----NEW-------------
app.put(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),

  [
    check('userName', 'userName is required').isLength({ min: 5 }),
    check(
      'userName',
      'userName contains non alphanumeric characters - not allowed.',
    ).isAlphanumeric(),
    check('password', 'password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],

  async (req, res) => {
    if (req.user.userName !== req.params.userName) {
      return res.status(400).send('Permission denied');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = Users.hashPassword(req.body.password);

      const updatedUser = await Users.findOneAndUpdate(
        { userName: req.params.userName },
        {
          $set: {
            userName: req.body.userName,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday, // keep schema casing consistent
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  },
);

///------------------------------------------------------------

// Add a movie to a user's list of favorites----new----------------
app.post(
  '/users/:userName/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $push: { favoriteMovies: req.params.MovieID },
      },
      { new: true },
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  },
);

// Delete favorite movie from user by movie id------NEW-------
app.delete(
  '/users/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      { $pull: { favoriteMovies: req.params.movieId } },
      { new: true },
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send('no such user');
        }
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  },
);

// --------------Delete a user by username---NEW----

app.delete(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // 🔐 ownership check
    if (req.user.userName !== req.params.userName) {
      return res.status(403).send('Permission denied');
    }

    try {
      const user = await Users.findOneAndDelete({
        userName: req.params.userName,
      });

      if (!user) {
        return res.status(404).send(req.params.userName + ' was not found');
      }

      res.status(200).send(req.params.userName + ' was deleted.');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
  },
);

/* ================= MOVIES ROUTES ================= */

// -------------get movies with jwt auth------------
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        res.status(500).send('Error: ' + err);
      });
  },
);

// -----------get Movies by genre name--------------
app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'genre.name': req.params.genreName })
      .then((movies) => {
        if (!movies)
          return res
            .status(404)
            .send('No movies found under the genre ' + req.params.genreName);
        res.status(200).json(movies);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

// ------------Get Movies by director Name----------------------
app.get(
  '/movies/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'director.name': req.params.directorName })
      .then((movies) => {
        if (movies.length === 0)
          return res
            .status(404)
            .send(
              'No movies found under the director ' + req.params.directorName,
            );
        res.status(200).json(movies);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

// ------------Get Movies by actor name----------------------
app.get(
  '/movies/actors/:actorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ actors: req.params.actorName })
      .then((movies) => {
        if (movies.length === 0) {
          return res
            .status(404)
            .send('No movies found under the actor ' + req.params.actorName);
        }
        res.status(200).json(movies);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

// ------------Get movie by title----------------------
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        if (!movie) return res.status(404).send('no such movie');
        res.status(200).json(movie);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

// -----------get genre by name--------------
app.get(
  '/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'genre.name': req.params.genreName })
      .then((movie) => {
        if (!movie)
          return res
            .status(404)
            .send('No such genre found ' + req.params.genreName);
        res.status(200).json(movie.genre);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

// -----------get director by name--------------
app.get(
  '/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.directorName })
      .then((movie) => {
        if (!movie)
          return res
            .status(404)
            .send('No such director found ' + req.params.directorName);
        res.status(200).json(movie.director);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  },
);

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
});

// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
