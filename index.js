const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));

/* ================= MOVIES DATA ================= */

let movies = [
  {
    title: 'The Dark Knight',
    director: { name: 'Christopher Nolan' },
    released: 2008,
    genre: { name: 'action' },

    actors: ['Christian Bale', 'Heath Ledger', 'Gary Oldman'],
  },
  {
    title: 'The Godfather',
    director: { name: 'Francis Ford Coppola' },
    released: 1972,
    genre: { name: 'crime' },

    actors: ['Marlon Brando', 'Al Pacino'],
  },
  {
    title: 'The Shawshenk Redemption',
    director: { name: 'Frank Darabont' },
    released: 1994,
    genre: { name: 'thriller' },

    actors: ['Tim Robbins', 'Morgan Freeman'],
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    director: { name: 'Peter Jackson' },
    released: 2003,
    genre: { name: 'fantasy' },

    actors: ['Elijah Wood', 'Viggo Mortensen'],
  },
  {
    title: 'Goodfellas',
    director: { name: 'Martin Scorsese' },
    released: 1990,
    genre: { name: 'crime' },

    actors: ['Robert De Niro', 'Ray Liotta'],
  },
  {
    title: 'The Matrix',
    director: { name: 'Wachowski sisters' },
    released: 1999,
    genre: { name: 'sci-fi' },

    actors: ['Keanu Reeves', 'Laurence Fishburne'],
  },
  {
    title: 'The Green Mile',
    director: { name: 'Frank Darabont' },
    released: 1999,
    genre: { name: 'crime' },

    actors: ['Tom Hanks', 'Michael Clarke Duncan'],
  },
  {
    title: 'Léon: The Professional',
    director: { name: 'Luc Besson' },
    released: 1994,
    genre: { name: 'action' },

    actors: ['Jean Reno', 'Natalie Portman'],
  },
  {
    title: 'the Skipper',
    director: { name: 'Jacob Goldwasser' },
    released: 1987,
    genre: { name: 'drama' },

    actors: ['Yehuda Barkan'],
  },
];

/* ================= USERS ================= */

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

/* ================= USERS ROUTES ================= */

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

/* ================= MOVIES ROUTES ================= */

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

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

/* ================= ACTORS (NEW ENDPOINT) ================= */

app.get('/movies/actors/:actorName', (req, res) => {
  const { actorName } = req.params;

  const actorMovies = movies.filter((movie) =>
    movie.actors.some(
      (actor) => actor.toLowerCase() === actorName.toLowerCase()
    )
  );

  if (actorMovies.length === 0) {
    return res.status(404).send('no such actor');
  }

  res.status(200).json({
    actor: actorName,
    movies: actorMovies.map((movie) => movie.title),
  });
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
