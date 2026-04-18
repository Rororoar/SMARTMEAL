const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/config/db");

dotenv.config();

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`SmartMeal API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start SmartMeal API:", error.message);
    process.exit(1);
  });

