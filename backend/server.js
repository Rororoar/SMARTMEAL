const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/config/db");

dotenv.config();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`SmartMeal API running on port ${port}`);
});

async function connectWithRetry() {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("The API is running, but database routes will fail until MongoDB connects.");
    setTimeout(connectWithRetry, 15000);
  }
}

connectWithRetry();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("SmartMeal API stopped");
  });
});
