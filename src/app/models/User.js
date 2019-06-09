import mongoose, { Schema } from "mongoose";

const UserSchema = Schema({
  username: String,
  password: String,
  salt: String,
  fb_id: String,
  ggl_id: String,
  refresh_token: String
})

const User = mongoose.model('user', UserSchema)

export default User;