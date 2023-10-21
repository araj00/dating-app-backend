const express = require("express");
const app = express();
const cors = require('cors');
const dotenv = require('dotenv')

const cookieParser = require("cookie-parser");
const router = require('./routes')

const dbConnect = require('./config/dbConnect');

dotenv.config();
app.use(cors());

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(express.json())
app.use(cookieParser());

app.use(router);

app.use((err,req,res,next) => {
  return res.status(500).json(
    {
      message : err.message
    }
  )
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
  dbConnect();
});