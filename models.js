const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/* =========================
   Movie Schema
========================= */

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    genre: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },

    director: {
      name: {
        type: String,
        required: true,
      },
      bio: {
        type: String,
        required: true,
      },
      birthYear: {
        type: Date,
      },
      deathYear: {
        type: Date,
        default: null,
      },
    },

    actors: [
      {
        type: String,
        required: true,
      },
    ],

    imageUrl: {
      type: String,
      required: true,
    },

    releaseYear: {
      type: Number,
      required: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   User Schema
========================= */

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    birthday: {
      type: Date,
    },

    favoriteMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
  }
);
//===Does this supposed to be here?=============================
//=========================================================
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

/* =========================
   Models
========================= */

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);
module.exports = { Movie, User };
