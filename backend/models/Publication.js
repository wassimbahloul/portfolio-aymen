// models/Publication.js - Fixed version
const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Publication type is required"],
      enum: {
        values: [
          "journal",
          "conference",
          "book",
          "chapter",
          "thesis",
          "preprint",
        ],
        message: "{VALUE} is not a valid publication type",
      },
    },
    year: {
      type: Number,
      min: [1900, "Year must be after 1900"],
      max: [
        new Date().getFullYear() + 5,
        "Year cannot be more than 5 years in the future",
      ],
    },

    // Simple string array for authors (matches your frontend)
    authors: [
      {
        type: String,
        trim: true,
      },
    ],

    abstract: {
      type: String,
      trim: true,
    },

    // Journal-specific fields (only required for journal articles)
    journal: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "journal";
      },
    },
    volume: {
      type: String,
      trim: true,
    },
    issue: {
      type: String,
      trim: true,
    },
    pages: {
      type: String,
      trim: true,
    },

    // Conference-specific fields
    conference: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "conference";
      },
    },
    location: {
      type: String,
      trim: true,
    },

    // Book/Chapter specific fields
    publisher: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "book" || this.type === "chapter";
      },
    },
    editors: {
      type: String,
      trim: true,
    },

    // Thesis specific fields
    institution: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "thesis";
      },
    },
    degree: {
      type: String,
      trim: true,
      enum: ["PhD", "Master", "Bachelor"],
      required: function () {
        return this.type === "thesis";
      },
    },
    advisor: {
      type: String,
      trim: true,
    },

    // Common fields
    doi: {
      type: String,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    citations: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Keywords as simple string array
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // External links
    externalLinks: [
      {
        title: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              return !v || /^https?:\/\/.+/.test(v);
            },
            message: "URL must be a valid HTTP/HTTPS URL",
          },
        },
      },
    ],

    // File upload
    file: {
      type: String,
      trim: true,
    },

    // Status for workflow management
    status: {
      type: String,
      enum: ["published", "accepted", "submitted", "in_preparation"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
publicationSchema.index({ type: 1, year: -1 });
publicationSchema.index({ authors: "text", title: "text", abstract: "text" });

module.exports = mongoose.model("Publication", publicationSchema);