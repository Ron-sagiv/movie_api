const express = require('express');
const router = express.Router();
const Models = require('../models');

const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');
const passport = require('passport');

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
router.post(
  '/',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('userName', 'userName is required').isLength({ min: 5 }),
    check(
      'userName',
      'userName contains non alphanumeric characters - not allowed.'
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
  }
);

// ---------------Get all users---NEW-------------
router.get(
  '/',
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
  }
);

// -------Get a user by username----NEW---------------------------
router.get(
  '/:userName',
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
  }
);

// ----------Update a user's info, by username-----NEW-------------
router.put(
  '/:userName',
  passport.authenticate('jwt', { session: false }),

  [
    check('userName', 'userName is required').isLength({ min: 5 }),
    check(
      'userName',
      'userName contains non alphanumeric characters - not allowed.'
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
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);

///------------------------------------------------------------

// Add a movie to a user's list of favorites----new----------------
router.post(
  '/:userName/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const movie = await Movies.findById(req.params.MovieID);
    if (!movie) {
      return res
        .status(404)
        .send({ error: 'No such movie with the id ' + req.params.MovieID });
    }

    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $addToSet: { favoriteMovies: req.params.MovieID },
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
  }
);

// Delete favorite movie from user by movie id------NEW-------
router.delete(
  '/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

// --------------Delete a user by username---NEW----

router.delete(
  '/:userName',
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
  }
);

module.exports = router;
