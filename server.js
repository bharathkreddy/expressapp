// DOT env load
require("dotenv").config();

//this moves on top of code to capture all errors from app.js as well, if defined at bottom of file then app.js runs before we start listning to this.
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION 🔥🔥🔥 Shutting down....");
  console.log("🔥", err.name, err.message);
  process.exit(1); // we dont need to close the server as these errors come from synchronous functions.
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION 🔥🔥🔥 Shutting down....");
  console.log("🔥", err.name, err.message);
  server.close(() => process.exit(1)); //gracefully close the server, to manage all asynch requests in flight and then only exit the process.
});

const app = require("./app");

//app start
const server = app.listen(process.env.PORT, () => {
  console.log(`👌 My app listening on port ${process.env.PORT}`);
});
