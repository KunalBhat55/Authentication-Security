import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config()
mongoose
  .connect(process.env.MONGO_URL_01, { useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to MongoDB users");
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err.message}`);
  });

const authSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const googleAuth = new mongoose.Schema({
  googleId:{
    type:String,
    required:true,
    unique:true
  },
  username:{
    type:String,
  },
  secrets: String,

});

// export default mongoose.model("Auth", authSchema); // Default only for single thing to export
// const User = mongoose.model("User", authSchema);
// const Guser = mongoose.model("googleUser",authSchema)
const Guser1 = mongoose.model("googleUser",googleAuth)

export default Guser1;
// const {sayhi, Hello} = await import('./app.js'); dynamic import export
// sayhi();