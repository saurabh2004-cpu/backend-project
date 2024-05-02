// require('dotenv').config({ path: './' })

import dotenv from 'dotenv'
import express from 'express'
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})








































































































































// const app = express()

// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("ERROR", error)
//             throw error
//         })

//         app.listrn(process.env.PORT, () => {
//             console.log(`app is listening on port ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.error("ERROR", error)
//         throw error
//     }
// })()