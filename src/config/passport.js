import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt} from "passport-jwt";
import { Strategy as FBStrategy } from "passport-facebook";
import randtoken from "rand-token";

import User from "../app/models/User";
import { jwtSECRET, fbID, fbKEY } from "./keys";
import argon2 from "argon2";

const config_passport = () => {
  passport.use(
    'login',
    new LocalStrategy(
      {
        session: false
      },
      async (username, password, done) => {
        try{
          const user = await User.findOne({username})
          if(!user) return done(null, false, {message: 'User not found'})
          const correctPassword = await argon2.verify(user.password, password)
          if(!correctPassword)  return done(null, false, {message: 'Incorrect password'})
          return done(null, user)
        } catch(err){
          return done(err)
        }
      }
    )
  )

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSECRET
  }

  passport.use(
    'jwt',
    new JWTStrategy(opts, async (jwt_payload, done) => {
      try{
        const user = await User.findOne({_id: jwt_payload._id})
        if(!user) done(null, false, {message: 'User not found'})
        done(null, user._id)
      }catch(err){
        done(err)
      }
    })
  )

  passport.use(
    'fb_login',
    new FBStrategy(
      {
        clientID: fbID,
        clientSecret: fbKEY,
        callbackURL: "https://localhost:1337/auth/facebook/callback",
        profileFields: ['id', 'displayName']
      },
      async (accessToken, refreshToken, profile, done) => {
        try{
          const user = await User.findOne({fb_id: profile.id})
          if(user) return done(null, user)
          const refresh_token = randtoken.uid(256)
          const new_user = await User.create({
            fb_id: profile.id,
            username: profile.displayName,
            refresh_token
          })
          done(null, new_user)
        }catch(err){
          done(err)
        }
      }
    )
  )
}

export default config_passport