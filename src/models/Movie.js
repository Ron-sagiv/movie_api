const mongoose = require('mongoose');

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

module.exports = mongoose.model('Movie', movieSchema);
