const port = 4000;
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const { type } = require("os");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());


//Database connection with mongodb
mongoose.connect("mongodb+srv://adithyan:Sakthipriya@cluster0.wfxl5zy.mongodb.net/");


//Creating an Api
app.get('/',(req,res)=>{
    res.send("Express App is running")
})

//Image storage engine
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
         cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({storage:storage});

//Creating upload endpoint for images
app.use('./images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})


//Creating schema for products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        require:true,

    },
    name:{
        type:String,
        require:true,
    },
    img:{
        type:String,
        require:true,
    },
    category:{
        type:String,
        require:true,
    },
    price:{
        type:Number,
        require:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    const product = new Product({
        id:req.body.id,
        name:req.body.name,
        img:req.body.img,
        category:req.body.category,
        price:req.body.price,
        })
        console.log(product);
        await product.save();
        console.log("Saved");
        res.json({
            success:1,
            name:req.body.name,
        })
})

//Creating Remove products Api
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed")
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating Api for getting all products for UI
app.get('/allproducts',(req,res)=>{
    const products = Product.find({})
    console.log("All products are fetched")
    res.send(products);
        
})

//Schema for users model
const Users = mongoose.model;('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,

    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }

})

//Creating endpoint for registering the user
app.post('/signup',async(req,res)=>{
    let check = await users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({success:false,error:"existing user found with same Email address"})
    }
    let cart = {};
    for (let i = 0;i < 300;i++){
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,

    })
    await user.save();

    const data = {
        user:{
            id:user.id,
        }
     }

     //Authentication using Salting algo
    const token = jwt.sign(data,'secret_ecom');
    res.json({
        success:true,
        token
    })
})


//Creating Api for login
app.post('/login',async (req,res)=>{
    let user = await Users.findOne({emaild:req.body.email});
    if(user){
    const passCompare = req.body.password === user.password;
    if (passCompare){
        const data = {
            user:{
                id:user.id
            }
        }
        const token = jwt.sign(data,'secret_ecom');
        res.json({success:true,token});
    }
    else{
        res.json({success:false,errors:"Wrong Password"})
    }
}
else{
   res.json({success:false,errors:"Wrong Email Id"}) 
}
})

//Creating Api for new collections 
app.get('/newcollections',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newCollection);
})


//creating Api for adding products in cartdata














app.listen(port,(error)=>{
    if(!error){
        console.log("server is running on port  " +  port);
    }else{
        console.log("Error"+error);
    }
});
