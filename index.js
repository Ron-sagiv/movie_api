const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
//----------previous code----------------------
// setup the logger
app.use(morgan('common'));

let myTopTenMovies = [
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    released: 2008,
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    released: 1972,
  },
  {
    title: 'The Shawshenk Redemption',
    director: 'Frank Darabont',
    released: 1994,
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    director: 'Peter Jackson',
    released: 2003,
  },
  {
    title: 'Goodfellas',
    director: 'Martin Scorsese',
    released: 1990,
  },
  {
    title: 'The Matrix',
    director: 'Wachowski sisters',
    released: 1999,
  },
  {
    title: 'The Green Mile',
    director: 'Frank Darabont',
    released: 1999,
  },
  {
    title: 'Léon: The Professional',
    director: 'Luc Besson',
    released: 1994,
  },
  {
    title: 'the Skipper',
    director: 'Jacob Goldwasser',
    released: 1987,
  },
];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to my movie app!' });
});

app.get('/movies', (req, res) => {
  res.json(myTopTenMovies);
});

app.get('/movies/:title', (req, res) => {
  const movieTitle = req.params.title;
  const foundMovie = myTopTenMovies.find((m) => m.title === movieTitle);

  if (!foundMovie) {
    return res.status(404).json({ msg: `Movie ${movieTitle} is not found` });
  }
  res.json(foundMovie);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
});
//-----------------------task 2.5-----------
let users;
let movies;

//create new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuidv4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need name');
  }
});
//update user name
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user');
  }
});
//create favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});
//delete favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});
//delete user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user');
  }
});
//read
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});
//read movie title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movies = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});
//read genre

app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such movie');
  }
});
//read direcor

app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
