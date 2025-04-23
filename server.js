const dotenv = require("dotenv").config();
require("dotenv").config(); // console.log(process.env.PORT); // remove this after you've confirmed it is working
const mongoose = require("mongoose");

console.log(process.env.MONGOURL);

mongoose
  .connect(process.env.MONGOURL, {
    tls: true,
    // location of a local .pem file that contains both the client's certificate and key
    tlsCertificateKeyFile: process.env.MONGOCERTPATH,
    authMechanism: "MONGODB-X509",
    authSource: "$external",
    dbName: "sample_mflix", // specify the database here!
  })
  //   .then((con) => {
  //     return con.connection.db.listCollections().toArray();
  //   })
  .then((coll) => console.log("🥭 Mongo connection Successful"))
  .catch((err) => console.error(`💥 ${err.message}`));

const app = require("./_5_mvc.js");

const port = app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
