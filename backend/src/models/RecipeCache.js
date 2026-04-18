const mongoose = require("mongoose");

const recipeCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

recipeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RecipeCache", recipeCacheSchema);
