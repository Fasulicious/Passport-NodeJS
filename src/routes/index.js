import { Router } from "express";
import passport from "passport";
import { randomBytes } from "crypto";
import randtoken from "rand-token";
import argon2 from 'argon2';
import jwt from "jsonwebtoken";

import { jwtSECRET } from "../config/keys";
import { AppError } from "../utils";
import User from "../app/models/User";
import { verify_jwt } from "../utils/middlewares";

const router = Router()
/**
 * @param {String} username username for the user
 * @param {String} password password for the user
 * @return {Object} including jwt_token, refresh_token, user_id
 * @throws {UserAlreadyExists}
 * @description create a new user
 */
router.route('/register')
  .post(async (req, res, next) => {
    const {username, password} = req.body
    try{
      const user = await User.findOne({username})
      if(user)  throw new AppError(409, 'Username already exists')
      const salt = randomBytes(32)
      const passwordHashed = await argon2.hash(password, {salt})
      const refresh_token = randtoken.uid(256)
      const new_user = await User.create({
        username,
        password: passwordHashed,
        salt: salt.toString('hex'),
        refresh_token
      })
      const user_info = {
        _id: new_user._id
      }
      const token = jwt.sign(user_info, jwtSECRET, {expiresIn: '1h'})
      res.json({token, refresh_token, _id: new_user._id})
    } catch(err){
      next(err)
    } 
  })

/**
 * @param {String} username username of the user 
 * @param {String} password password of the user
 * @returns {Object} including jwt_token, refresh_token, user_id
 * @throws {User not found || Incorrect password}
 * @description Login system
 */
router.route('/login')
  .post((req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if(err) next(err)
      if(info && info.message === 'User not found')  next(new AppError(404))
      if(info && info.message === 'Incorrect password') next(new AppError(401))
      const user_info = {
        _id:user._id
      }
      const token = jwt.sign(user_info, jwtSECRET, {expiresIn: '1h'})
      const {refresh_token} = user
      res.json({token, refresh_token, _id: user._id})
    })(req, res, next)
  })

/**
 * @param {String}  _id id for the user
 * @param {String}  refresh_token refresh token of the user
 * @returns {Object}  inclufing new jwt and new refresh token
 * @throws  {User missmatch}
 * @description Verify if the refresh token belong to the user and return
 * a new jwt and new refresh token
 */
router.route('/refresh_token')
  .post(async (req, res, next) => {
    try{
      const {_id, refresh_token} = req.body
      const user = await User.findById({_id})
      if(refresh_token !== user.refresh_token)  throw new AppError(401)
      const new_refresh_token = randtoken.uid(256)
      await User.findByIdAndUpdate({_id}, {refresh_token: new_refresh_token})
      const user_info = {
        _id: user._id
      }
      const token = jwt.sign(user_info, jwtSECRET, {expiresIn: '1h'})
      res.json({token, refresh_token: new_refresh_token})
    }catch(err){
      next(err)
    }
  })

/**
 * @param {String}  token jwt sent in the header as Bearer
 * @returns {Object}  do whatever you want after verify token
 */
router.route('/protected')
  .get(verify_jwt, (req, res, next) => {
  //if res.locals.id exists you pass the token verification
  //do whatever you want
  res.sendStatus(200)
})

router.route('/auth/facebook')
  .get(passport.authenticate('fb_login'))

router.route('/auth/facebook/callback')
  .get((req, res, next) => {
    passport.authenticate('fb_login', (err, user) => {
      if(err) next(err)
      const user_info = {
        _id: user._id
      }
      const token = jwt.sign(user_info, jwtSECRET, {expiresIn: '1h'})
      const {refresh_token} = user
      res.json({token, refresh_token, _id: user._id})
    })(req, res, next)
  })

export default router