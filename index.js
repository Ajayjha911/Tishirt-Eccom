const app = require("./app");
const connectWithDB = require("./config/db");
require("dotenv").config();
const cloudinary = require("cloudinary");

connectWithDB();

cloudinary.config({
  cloud_name: "dt7ykrhn4",
  api_key: "793197395528276",
  api_secret: "Xtrkjdy04OxRm3Gvpq3HQFlAnVY",
});
app.listen(process.env.PORT, () => {
  console.log(`Running On ${process.env.PORT}`);
});
