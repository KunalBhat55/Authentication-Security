import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose, { trusted } from "mongoose";
import MongoDBStoreFactory from "connect-mongodb-session";
import User from "./models/users.js";
import md5 from "md5";
import session from "express-session";

dotenv.config();
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const MongoDBStore = MongoDBStoreFactory(session);

// Connect to mongoose
mongoose
  .connect(process.env.MONGO_URL_01, { useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB session");
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err.message}`);
  });

// Create a store in mongodb
const store = new MongoDBStore({
  uri: process.env.MONGO_URL_01,
  collection: "session",
  // expires: 1000 * 60 * 60 * 24 * 7, // 7 days
}); 

// Use session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store, // redis best
    
  })
);
// Check if user is authenticated (middleware)
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};


app.get("/", (req, res) =>   {
  res.render("home");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/secrets", isAuth, (req, res) => {
  res.render("secrets");
});




// POST
app.post("/register", async (req, res) => {
     
  const {username, password } = req.body;
  try{

    let user = await User.findOne({username: username})
    if(user){
      // user exist try logging in
      return res.redirect("login");
    }
    
    // register user
    user = new User({
      username,
      password: md5(password),
    });
    await user.save();
    res.redirect("login");
  }

  catch(err){
    console.log(err);
  }

}); 



app.post("/login", async (req, res) => {
 
  const {username, password } = req.body;
  try {
    if (username && password) {
      let user = await User.findOne({ username: username });
      if (user) {
        if (user["password"] == md5(password)) {

          req.session.isAuth = true; // session start
          res.redirect("secrets");

        } 
        else {
          // wrong pass
          res.redirect("login");
        }
      } 
      else {
        // user not exist
        res.redirect("register");
      }
    }
  } 
  catch (err) {
    console.log(`An error occured ${err}`);
  }

});



app.post("/logout", (req, res) => {
  req.session.destroy(); // deletes the session from db
  res.redirect("/");
});
  
app.listen(3000, () => {    
  console.log("Server started on 3000");
});
