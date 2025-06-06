let express = require('express');
let bodyParser = require('body-parser');
let dotenv = require('dotenv');
let methodOverride = require('method-override')
let session = require('express-session');
let flash = require('connect-flash')
let mongoose = require('mongoose')
let app = express()

// set locat variable






app.set('view engine', 'ejs')
dotenv.config({path:'./config.env'})
app.use(express.static(__dirname+'/public/'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'))
mongoose.connect(process.env.mongoUrl)



app.use(session({
    secret:'nodejs',
    resave:true,
    saveUninitialized:true
}))
app.use(flash())

app.use((req, res, next)=>{
    res.locals.sucess = req.flash('sucess') 
    res.locals.err = req.flash('err')
    //Note: yahan 'sucess' & 'err' globaly message set kiya jaa raha hai jiska use puer application men kahin bhi kiya jaa sakta hai    
    next()
 })



//===========BACKEND ROUTER START HERE

let admin = require('./router/backend/admin')
let adminpages = require('./router/backend/admin-page')
let admincategory = require('./router/backend/admin-category')
let adminproducts = require('./router/backend/admin-products')

// set router
app.use('/admin/', admin) // route admin
app.use('/admin/pages/', adminpages) // top navigation like (home, about, contact,)
app.use('/admin/category/', admincategory) //for category like (Java Script, NodeJs, Mongodb)
app.use('/admin/products/', adminproducts) //for product like ( javascript related all topic || nodejs related All topic..)




//BACKEND ROUTER END HERE
let pages = require('./router/frontent/page')
app.use('/', pages) 


//===========FRONTENT ROUTER START HERE





app.listen(process.env.PORT, ()=>{
    console.log(process.env.PORT, 'Port Working')
})



index.js
