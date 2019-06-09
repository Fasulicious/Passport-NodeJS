import mongoose, { mongo } from "mongoose";

// Import models
import User from './app/models/User'

import { mongoURI } from "./config/keys";

const connectDB = () => mongoose.connect(mongoURI,{
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const models = {User}

export {connectDB}

export default models