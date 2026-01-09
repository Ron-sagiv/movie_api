const express = require('express');
const router = express.Router();

const Models = require('../models');

const Movies = Models.Movie;

const passport = require('passport');

/* ================= MOVIES ROUTES ================= */

// -------------get movies with jwt auth------------
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        res.status(500).send('Error: ' + err);
      });
  }
);

// -----------get Movies by genre name--------------
router.get(
  '/genre/:genreName',
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
  }
);

// ------------Get Movies by director Name----------------------
router.get(
  '/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'director.name': req.params.directorName })
      .then((movies) => {
        if (movies.length === 0)
          return res
            .status(404)
            .send(
              'No movies found under the director ' + req.params.directorName
            );
        res.status(200).json(movies);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  }
);

// ------------Get Movies by actor name----------------------
router.get(
  '/actors/:actorName',
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
  }
);

// ------------Get movie by title----------------------
router.get(
  '/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        if (!movie) return res.status(404).send('no such movie');
        res.status(200).json(movie);
      })
      .catch((err) => res.status(500).send('Error: ' + err));
  }
);

// TODO: Move genre and director routes to separate express router
// -----------get genre by name--------------
router.get(
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
  }
);

// -----------get director by name--------------
router.get(
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
  }
);

module.exports = router;
