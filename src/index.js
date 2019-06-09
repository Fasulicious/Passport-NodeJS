import "@babel/polyfill";

import server from './server';
import config_passport from "./config/passport";
import models, { connectDB } from "./db";

// Load models
models.User;

(async function(){
  try{
    await config_passport()
    await connectDB()
    console.log(`MongoDB connected`)
    const port = 1337
    await server.listen(port)
    console.log(`Server listening on port ${port}`)
  }catch(err){
    console.log(err)
  }
})()