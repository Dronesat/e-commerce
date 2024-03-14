const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer"); 
const path = require("path");
const cors = require("cors");
const { error, log } = require("console");


app.use(express.json()); //Request from response automatically passed through json
app.use(cors()); //ReactJS project connect to express app on port 4000

//Initialise database connection with MongoDB
mongoose.connect("***REMOVED***");

//API Endpoint: Create root
app.get("/",(req,res)=>{
    res.send("E-commerce Express App is running");
})

//Image storage engine
const storage = multer.diskStorage({ //Disk storage configuration
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage:storage});

//API Endpoints: Upload images
app.use('/images',express.static('upload/images')) //provide image url
app.post("/upload",upload.single('product'),(req,res) => {
    res.json({
        success:1, //if image successfully uploaded, will return success:1
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for Creating Products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
})

//API Endpoint: Create product using db schema and save to database
app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){ //Create new id by increament
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;  
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save(); //Save in mongodb
    console.log("Saved");
    res.json({ //Response for frontend
        success: true,
        name: req.body.name,
    })
})

//API Endpoint: delete products
app.post('/removeproduct', async(req,res)=>{ //Endpoint
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

//API Endpoint: Get all products
app.get('/allproducts', async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

//Schema for creating User model
const Users = mongoose.model('Users',{
    name:{
        type: String,
    },
    email:{
        type: String,
        unique: true,
    },
    password:{
        type: String,
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now(),
    }
})

//API Endpoint: Registering the user
app.post('/signup',async(req,res)=>{
    //Check if email already existed
    let check = await Users.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false,error:"Existing user found with the same email address"})
    }
    
    //If no user, create 300 empty carts
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }

    //Create user
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save(); //Save user in database

    //Create token using jwt from data object
    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token});
})

//API Endpoint: User login
app.post('/login',async(req,res)=>{
    //Find user
    let user = await Users.findOne({email: req.body.email});
    if (user) {
        //passCompare true if password existed then create new data object(user.id)
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            //Password correct generates one token
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        } else {
            res.json({success:false,errors:"Wrong Password"});
        }
    } else {
        res.json({success:false,errors:"Wrong Email Address"})
    }
})

//Middleware: Fetch user
const fetchUser = async(req,res,next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({errors:"Please authenticate using valid token"})
    } else {
        try {
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors:"Please Authenticate a valid token"})
        }
    }
}

//API Endpoint: Adding products in cartdata
app.post('/addtocart',fetchUser, async(req,res)=>{
    //console.log(req.body, req.user);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
    console.log("added",req.body.itemId);
})

//API Endpoint: Remove product from cartdata
app.post('/removefromcart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
        res.send("Removed");
        console.log("removed",req.body.itemId);
    }
})

//API Endpoint: Get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
    if (!error){
        console.log("Server running on port " + port);
    } 
    else {
        console.log("Error: " + error);
    }
});

