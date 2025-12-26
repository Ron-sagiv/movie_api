const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));

let movies = [
  {
    title: 'The Dark Knight',
    director: { name: 'Christopher Nolan' },
    released: 2008,
    genre: { name: 'action' },
  },
  {
    title: 'The Godfather',
    director: { name: 'Francis Ford Coppola' },
    released: 1972,
    genre: { name: 'crime' },
  },
  {
    title: 'The Shawshenk Redemption',
    director: { name: 'Frank Darabont' },
    released: 1994,
    genre: { name: 'thriller' },
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    director: { name: 'Peter Jackson' },
    released: 2003,
    genre: { name: 'fantasy' },
  },
  {
    title: 'Goodfellas',
    director: { name: 'Martin Scorsese' },
    released: 1990,
    genre: { name: 'crime' },
  },
  {
    title: 'The Matrix',
    director: { name: 'Wachowski sisters' },
    released: 1999,
    genre: { name: 'sci-fi' },
  },
  {
    title: 'The Green Mile',
    director: { name: 'Frank Darabont' },
    released: 1999,
    genre: { name: 'crime' },
  },
  {
    title: 'Léon: The Professional',
    director: { name: 'Luc Besson' },
    released: 1994,
    genre: { name: 'action' },
  },
  {
    title: 'the Skipper',
    director: { name: 'Jacob Goldwasser' },
    released: 1987,
    genre: { name: 'drama' },
  },
];

let users = [
  {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    id: 2,
    favoriteMovies: [],
  },
  {
    name: 'Jean Doe',
    email: 'jeanndoe@gmail.com',
    id: 1,
    favoriteMovies: [],
  },
];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to my movie app!' });
});

/* ================= USERS ================= */

// create user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuidv4();
    newUser.favoriteMovies = [];
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need name');
  }
});

// update user
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

// add favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} added to user ${id}`);
  } else {
    res.status(400).send('no such user');
  }
});

// delete favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res.status(200).send(`${movieTitle} removed from user ${id}`);
  } else {
    res.status(400).send('no such user');
  }
});

// delete user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} deleted`);
  } else {
    res.status(400).send('no such user');
  }
});

/* ================= MOVIES ================= */

// get all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// get genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;

  const movie = movies.find(
    (m) => m.genre.name.toLowerCase() === genreName.toLowerCase()
  );

  if (!movie) {
    return res.status(404).send('no such genre');
  }

  res.status(200).json(movie.genre);
});

// get director
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;

  const movie = movies.find(
    (m) => m.director.name.toLowerCase() === directorName.toLowerCase()
  );

  if (!movie) {
    return res.status(404).send('no such director');
  }

  res.status(200).json(movie.director);
});

app.get('/movies/:title', (req, res) => {
  const { title } = req.params;

  const movie = movies.find(
    (m) => m.title.toLowerCase() === title.toLowerCase()
  );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send('no such movie');
  }
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
