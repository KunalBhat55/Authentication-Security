import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL_01, { useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB passport users");
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err.message}`);
  });

const passportSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const passportUser = mongoose.model("passportUser", passportSchema);
export default passportUser;    
