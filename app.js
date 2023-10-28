import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import encrypt from "mongoose-encryption";
import md5 from "md5";
import session, { Cookie } from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false, // save even if nothing changed?
    saveUninitialized: false, // save empty value?

    // cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session()); // use session here

app.listen(3000, async () => {
  console.log("Server started on port 3000");
});

mongoose
  .connect(process.env.MONGO_URL, { useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB`);
  })
  .catch((error) =>{
    console.log(`Error connecting to MongoDB: ${error.message}`);
  })

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose); // hash and salt pass

// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["Password"] }); // for multiple add more in encryptedFields array

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//POST
app.post("/register", async (req, res) => {
  // const newUser = new User({
  //   Email: req.body.username,
  //   Password: md5(req.body.password), // md5 hash algo to encrypt
  // });

  // try {
  //   const savedUser = await newUser.save();
  //   if (savedUser) {
  //     res.render("secrets");
  //   }
  // } catch (error) {
  //   console.error("Error saving user:", error);
  // }

  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        // passport.authenticate("local")(req, res, () => {
        //   res.redirect("/secrets");
        // });
        console.log(user.Email);
      }
    }
  );
});
app.post(
  "/login",
  passport.authenticate("local", {
    successFlash: true,
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    console.log(req.session);
    // usr/pass

    // const Email = req.body.username;

    // try {
    //   const result = await User.findOne({ Email: Email });
    //   if (result) {
    //     if (result["Password"] == Password) {
    //       res.render("secrets");
    //     } else {
    //       console.log("Incorrect Password!");
    //       res.render("home");
    //     }
    //   }
    //   else {
    //     console.log("User does not exist!");
    //     res.render("home");
    //   }
    // } catch (error) {
    //   console.log(`An error occurred: ${error}`);
    // }
  }
);
