import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import passportUser from "./models/passportDB.js"; // mongodb
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

dotenv.config();
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


const startPassport = async () => {
  
  // When user tries to login (actual auth logic)->
  passport.use(new LocalStrategy(async (username, password, done) => {

    const findUser = await passportUser.findOne({ username: username });
    if (!findUser) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (findUser.password != password) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, findUser);

    })
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const findUser = await passportUser.findById(id);
    done(null, findUser);
  });
  
};
startPassport();

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24, // 1 day
    // },
    // Store: store,
  })
);

// always after session
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// secrets
app.get("/secrets", isAuthenticated, (req, res) => {
  res.render("secrets");
});

// POST

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await passportUser.findOne({ username: username });
    if (!user) {
      //   const createUser = await passportUser.create(username, password)
      const createUser = new passportUser({
        username,
        password: password,
      });
      createUser.save();
      res.redirect("login");
    } else {
      res.redirect("login");
    }
  } catch (err) {
    console.log(`An error occured while trying to register ${err.message}`);
  }
});

app.post("/login",
  passport.authenticate("local", { // isAuthenticated = true (here),
    failureRedirect: "/login",
    successRedirect: "/secrets",
  })
);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed
  }
  res.redirect("/login"); // User is not authenticated, redirect to login
}
app.post("/logout", (req, res) => {  // deletes req.session.passport.user
  req.logout( (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
})

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
