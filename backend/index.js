const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer"); 
const path = require("path");
const cors = require("cors");
const { error } = require("console");


app.use(express.json()); //Request from response automatically passed through json
app.use(cors); //ReactJS project connect to express app on port 4000

//Database connection with MongoDB
mongoose.connect("***REMOVED***");

//API endpoint creation
app.get("/",(req,res)=>{
    res.send("Express App is running");
})

app.listen(port,(error)=>{
    if (!error){
        console.log("Server running on port" + port);
    } 
    else {
        console.log("Error: " + error);
    }
});

