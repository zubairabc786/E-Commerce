import express from 'express'
import mongoose from 'mongoose';
import {APP_PORT, DB_URL} from './config'
import errorHandler from './middlewares/errorHandler';
import routes from './routes'
import path from 'path'
// import cors from 'cors'
// import mongoose from 'mongoose';

const app=express();

//Database Connection
mongoose.connect(DB_URL, {useNewUrlParser:true});
const db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', ()=>{
    console.log("DB connected")
});


global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false}))

// app.use(cors());
app.use(express.json())
app.use('/api', routes);
app.use('/uploads', express.static('uploads'))

app.use(errorHandler);
app.listen(APP_PORT, ()=> console.log(`server is run on port no ${APP_PORT}`))





