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
// особливість virtual, що ми змінену url адресу мініатюр не зберігаємо в DB
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});

// Mongoose не містить віртуальних елементів, коли ми конвертуємо документ в JSON, тому треба встановити opts
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
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
  },
  opts
);

// при створенні власних даних набір має містити geometry і properties
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
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
