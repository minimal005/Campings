//Якщо ми не в режимі виробництва, потрібен модуль dotenv і викликаємо функцію config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./config.env" });
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// для миттєвих повідомлень і сесії
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const app = express();
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.log("ERRROOORR"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// викор ППЗ коли працюємо з post-запитами, тобто з body запиту
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// використовувати статичний метод автентифікації моделі в LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// використовувати статичну серіалізацію та десеріалізацію моделі для паспорта підтримки сеансу
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// для створення повідомлення для користувачів, наприклад про успішне створення нового кемпінгу
app.use((req, res, next) => {
  //щоб в усіх шаблонах мати доступ до поточного користувача
  res.locals.currentUser = req.user;

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// для кожного шляху робимо виклик
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(4000, () => {
  console.log("Port 4000 are listening...");
});
