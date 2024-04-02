const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png
const ImageSchema = new Schema({
  url: String,
  filename: String,
});
// щоб додати до зображень віртуальну властивість їх треба зробити окремою схемою
// ми до url адреси додаємо фіксовану ширину (це особливість cloudinary)
// особливість virtual, що ми змінену url адресу (маленькі зображення) не зберігаємо в DB
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  //шаблон GeoJSON — це формат для зберігання географічних точок, інфо https://mongoosejs.com/docs/geojson.html
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// при видаленні campground видаляються всі відгуки, які створилися для нього, використовуємо post, а не pre для того, щоб мати доступ до видаленого обєкта
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
module.exports = mongoose.model("Campground", CampgroundSchema);
