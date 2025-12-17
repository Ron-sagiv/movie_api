const express = require('express'),
  morgan = require('morgan');

const app = express();

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

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/movies', (req, res) => {
  res.json(myTopTenMovies);
});
app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! There is a problem');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
