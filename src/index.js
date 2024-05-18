// require('dotenv').config({ path: './env' })

import dotenv from 'dotenv'
import express from 'express'
import connectDB from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})


connectDB()
    .then(() => {

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at PORt: ${process.env.PORT}`);
        })

        app.on("error",(error)=>{
            console.log("error",error)
            throw error
        })
    })
    .catch((error) => {
        console.log("MONGO db connection failed !!", error)
    })







    