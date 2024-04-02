const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const path = require("path");
const Campground = require("./../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful++"))
  .catch((err) => console.log("ERRROOORR"));

const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
const seedDB = async () => {
  try {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;

      await Campground.create({
        //прописую id адміна
        author: "6607c5f05d6a280175f66f97",
        title: `${sample(places)} ${sample(descriptors)} ${sample(places)}`,
        location: `${cities[random1000].city}, ${cities[random1000].state},`,

        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
        price,
        images: [
          {
            url: "https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png",
            filename: "YelpCamp/ahfnenvca4tha00h2ubt",
          },
          {
            url: "https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png",
            filename: "YelpCamp/ruyoaxgf72nzpi4y6cdi",
          },
        ],
      });
    }
  } catch (err) {
    console.log(err);
  }
};
seedDB().then(() => mongoose.connection.close());
