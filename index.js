const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
// keep models explicit even if not yet used
const Genres = Models.Genre;
const Actors = Models.Actor;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/moviesDB');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to my movie app!' });
});

// ------------Is DB connected-----------------
mongoose.connection.on('connected', () => {
  console.log(' Mongoose connected to moviesDB');
});

mongoose.connection.on('error', (err) => {
  console.error(' Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose disconnected');
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
app.post('/users', async (req, res) => {
  await Users.findOne({ userName: req.body.userName })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.userName + ' already exists');
      } else {
        Users.create({
          userName: req.body.userName,
          password: req.body.password,
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
});

// ---------------Get all users---NEW-------------
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// -------Get a user by username----NEW---------------------------
app.get('/users/:userName', async (req, res) => {
  await Users.findOne({ userName: req.params.userName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// ----------Update a user's info, by username-----NEW-------------
app.put('/users/:userName', async (req, res) => {
  await Users.findOneAndUpdate(
    { userName: req.params.userName },
    {
      $set: {
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

///------------------------------------------------------------

///  replacement for PUT /users/:id -------NEW-----
app.put('/users/id/:id', async (req, res) => {
  await Users.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
});

// Add a movie to a user's list of favorites----new----------------
app.post('/users/:userName/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate(
    { userName: req.params.userName },
    {
      $push: { favoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete favorite movie from user by movie id------NEW-------
app.delete('/users/:userName/movies/:movieId', async (req, res) => {
  await Users.findOneAndUpdate(
    { userName: req.params.userName },
    { $pull: { favoriteMovies: req.params.movieId } },
    { new: true }
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
});

// --------------Delete a user by username---NEW----
app.delete('/users/:userName', async (req, res) => {
  await Users.findOneAndRemove({ userName: req.params.userName })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.userName + ' was not found');
      } else {
        res.status(200).send(req.params.userName + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/* ================= MOVIES ROUTES ================= */

// -------------get movies------------
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => res.status(200).json(movies))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// -----------get genre by genre name--------------
app.get('/movies/genre/:genreName', async (req, res) => {
  await Movies.findOne({ 'genre.name': req.params.genreName })
    .then((movie) => {
      if (!movie) return res.status(404).send('no such genre');
      res.status(200).json(movie.genre);
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

// ------------Get direcor by name----------------------
app.get('/movies/director/:directorName', async (req, res) => {
  await Movies.findOne({ 'director.name': req.params.directorName })
    .then((movie) => {
      if (!movie) return res.status(404).send('no such director');
      res.status(200).json(movie.director);
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

/* ================= ACTORS (NEW ENDPOINT) ================= */

// ------------Get actor by name----------------------
app.get('/movies/actors/:actorName', async (req, res) => {
  await Movies.find({ actors: req.params.actorName })
    .then((movies) => {
      if (movies.length === 0) {
        return res.status(404).send('no such actor');
      }
      res.status(200).json({
        actor: req.params.actorName,
        movies: movies.map((movie) => movie.title),
      });
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

// ------------Get movie by title----------------------
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movie) => {
      if (!movie) return res.status(404).send('no such movie');
      res.status(200).json(movie);
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
