import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import Guser1 from "./models/users.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
dotenv.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use("google", new GoogleStrategy({

    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",

  },
  async (accessToken, refreshToken, profile, done) => {
    try{
      console.log(`Profile: ${profile.displayName}`)
      console.log(`AccessToken: ${accessToken}`)
      console.log(`RefreshToken: ${refreshToken}`)

      let user = await Guser1.findOne({googleId: profile.id})
      if(!user){
        user = new Guser1({
          googleId: profile.id,
          username: profile.displayName,
        });
        await user.save();
      }
      return done(null, user);
    }

    catch(err){
        console.log(err);
        return done(err, null);
    }
  }


));
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Guser1.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
// initiates the Google OAuth authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
// scope: controls the set of resources and operations that an access token permits

// handles the callback from Google
app.get("/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/secrets");
  }
);

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
})
app.get("/register", (req, res) => {
  res.render("register");
})
// get secrets
app.get("/secrets", async (req, res) => {
  const secretsFound = await Guser1.find({secrets: {$ne: null}})
  res.render("secrets", { gotIt: secretsFound });

})

app.get("/submit", isAuthenticated, (req, res) => {
  res.render("submit");
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
app.post("/logout", (req, res) => {  // deletes req.session.passport.user
  req.logout( (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
})

app.post("/submit",async (req,res) => {
  
  const submitSecret = req.body.secret;
  try{

    const foundUser = await Guser1.findById(req.user.id)
    if (foundUser) {
      await Guser1.updateOne({_id: req.user.id}, {$push: {secrets: submitSecret}})
      res.redirect("/secrets");
    }
  }
  catch(err){
    console.log(err);
  }

})

// LOCAL

// app.post("/register", (req, res) => {
//   const {username, password } = req.body;
//   Guser1.register({username: username}, password, (err, user) => {
//     if (err) {
//       console.log(err);
//     }
//   })
// });





app.listen(3000, () => {
  console.log(`Server started on port 3000`);
});
