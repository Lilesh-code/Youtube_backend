import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));


//form bhara tab data ko json me convert karne ke liye
app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true}))


app.use(express.static("public"));
//images bagera public mai rakh sakte hai

//cookies par crud operation karne ke liye cookie parser ka use karte hai

//server se user k browser mai cookie bhejne ke liye cookie parser ka use karte hai
app.use(cookieParser());


export{app};