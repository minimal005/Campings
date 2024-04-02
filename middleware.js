const Campground = require("./models/campground");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");

// перевіряємо чи користувач авторизований
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Зберігаємо в сесії інформацію про попередню URL адресу, щоб була змога перенаправитись назад при авторизації
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Спочатку вам треба авторизуватись!");
    return res.redirect("/login");
  }
  next();
};

// Робимо вибірково валідацію, тільки при створенні і при редагуванні, цю функцію викликатимемо в потрібних маршрутах
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// перевіряємо, чи користувач є автором публікації
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "Ви не маєте на це дозволу!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// перевіряємо, чи користувач є автором відгуку
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// використання проміжного програмного забезпечення storeReturnTo для збереження значення returnTo із сеансу в res.locals
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
