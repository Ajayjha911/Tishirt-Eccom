const mongoose = require("mongoose");
const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log(`Connected To Db`))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDB;
