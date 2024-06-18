import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,    //indicates that from whre the request is accept from the frontend ex-vercel,netlify etc
    credentials: true,
}))

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
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all handler to serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

export { app }