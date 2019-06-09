import express, {json} from 'express';
import passport from "passport";
import morgan from "morgan";

import fs from 'fs';
import https from 'https';
import path from 'path';
import { keyDIR, certDIR } from "./config/keys";

const app = express()

// Secure local server for fb login
const options = {
  hostnamae: 'secure.local',
  key: fs.readFileSync(path.resolve(keyDIR)),
  cert: fs.readFileSync(path.resolve(certDIR))
}

const server = https.Server(options, app)


// Import Routes
import api from './routes';

// Settings
app.set('port', process.env.PORT || 1337)

// Middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(json())
app.use(passport.initialize())


// Use Routes
app.use(api)

// Error Handler
app.use((err, req, res, next) => {
  console.log('error?',err)
  if(!err.code) res.sendStatus(500);
  else if(!err.message) res.sendStatus(err.code);
  else  res.status(err.code).send({err: err.message})
  next()
})

function handleFatalError(err){
  console.log(err)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

export default server