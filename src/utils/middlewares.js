import passport from "passport";

// Using passport jwt as middleware to verify the token
export const verify_jwt = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if(err) res.sendStatus(500)
    if(info && info.message === 'User not found') res.sendStatus(404)
    if(info && info.message === 'jwt expired') res.sendStatus(401)
    res.locals.id = user
    next()
  })(req, res, next)
}
