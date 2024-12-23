import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path';
import passport from 'passport';
import initializingPassport from './middlewares/passportConfig.js';


const app = express()


// Initialize Passport
initializingPassport(passport);
app.use(passport.initialize());


const allowedOrigins = [
  'http://localhost:5173', // Vite default development server
  process.env.CORS_ORIGIN, // Your deployment origin, e.g., Vercel, Netlify
];



app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,    //indicates that from whre the request is accept from the frontend ex-vercel,netlify etc
//     credentials: true,
// }))

app.use(express.json({ limit: "16kb" }))                            //form data-accept the 16kb of json
app.use(express.urlencoded({ extended: true, limit: "16kb" }))      //url data-allow nested objects,and the limit is 16kb
app.use(express.static("public"))                                   //store the files public assets
app.use(cookieParser())                                             //access the browser cookie by server


//routes import 
import userRouter from "./routes/user.routes.js"
import videoRouter from './routes/video.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import playListRouter from './routes/playlist.rouets.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.route.js'
import dashBordRouter from './routes/dashbord.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter) //http://localhost:800/api/v1/users/register

app.use("/api/v1/video",videoRouter)

app.use("/api/v1/tweet",tweetRouter)

app.use("/api/v1/subscription",subscriptionRouter)

app.use("/api/v1/playlist",playListRouter)

app.use("/api/v1/like",likeRouter)

app.use("/api/v1/comment",commentRouter)

app.use("/api/v1/dashbord",dashBordRouter)


// Serve static files from the React app
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public/dist')));

// Catch-all handler for any request that doesn't match API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});





export { app }