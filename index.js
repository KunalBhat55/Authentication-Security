import express from "express";


const app = express();  

const f2 = (req, res, next) => {
  console.log("This is function #2");
  next();
};
const f1 = (req, res, next) => {  // middleware
  console.log("This is function #1");
  next();
}
app.use(f1);
app.get("/", (req, res) => {
    res.send("Hello World!");
})


app.listen(3000, () => {console.log(`Listening on 3000`);})