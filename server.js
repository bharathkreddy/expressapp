// DOT env load
require("dotenv").config();

const app = require("./app");

//app start
app.listen(process.env.PORT, () => {
  console.log(`👌 My app listening on port ${process.env.PORT}`);
});
