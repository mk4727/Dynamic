// let express = require('express');
// let bodyParser = require('body-parser');
// let dotenv = require('dotenv');
// let methodOverride = require('method-override')
// let session = require('express-session');
// let flash = require('connect-flash')
// let mongoose = require('mongoose')
// let app = express()

// // set locat variable



// app.set('view engine', 'ejs')
// dotenv.config({path:'./config.env'})
// app.use(express.static(__dirname+'/public/'))
// app.use(bodyParser.urlencoded({extended:true}))
// app.use(methodOverride('_method'))
// mongoose.connect(process.env.mongoUrl)



// app.use(session({
//     secret:'nodejs',
//     resave:true,
//     saveUninitialized:true
// }))
// app.use(flash())

// let pageModel = require('./model/pageModel')
// let productModel = require('./model/productModel')
// let catModel = require('./model/categorymodel')
// app.use((req, res, next)=>{
//     res.locals.sucess = req.flash('sucess') 
//     res.locals.err = req.flash('err')
//     //Note: yahan 'sucess' & 'err' globaly message set kiya jaa raha hai jiska use puer application men kahin bhi kiya jaa sakta hai    
    
//     //PASS PAGE DATA TO ALL FRONTENT HEADER
//         pageModel.find({})
//         .then((x) => {
//             res.locals.navdata = x;         
//         })
//         .catch((y) => {
//            // console.log(y)
//         })
//     // PASS ALL COURSERS LIST TO ALL COURESE PAGES
//         productModel.find({})
//         .then((x)=>{
//             res.locals.allcourses = x;   
//         })
        
//     //PASS ALL CATEGORY DATA ANY WHERE
//     catModel.find()
//     .then((x)=>{
//         res.locals.allcat = x
//     })
       
    
    
//     next()
//  })



// //===========BACKEND ROUTER START HERE
// let admin = require('./router/backend/admin')
// let adminpages = require('./router/backend/admin-page')
// let admincategory = require('./router/backend/admin-category')
// let adminproducts = require('./router/backend/admin-products')

// // set router
// app.use('/admin/', admin) // route admin
// app.use('/admin/pages/', adminpages) // top navigation like (home, about, contact,)
// app.use('/admin/category/', admincategory) //for category like (Java Script, NodeJs, Mongodb)
// app.use('/admin/products/', adminproducts) //for product like ( javascript related all topic || nodejs related All topic..)




// //BACKEND ROUTER END HERE
// let pages = require('./router/frontent/page')
// let course = require('./router/frontent/product')

// app.use('/course', course) 
// app.use('/', pages) 

// //===========FRONTENT ROUTER START HERE





// app.listen(process.env.PORT, ()=>{
//     console.log(process.env.PORT, 'Port Working')
// })







let express = require('express');
let bodyParser = require('body-parser');
let dotenv = require('dotenv');
let methodOverride = require('method-override');
let session = require('express-session');
let flash = require('connect-flash');
let mongoose = require('mongoose');
let app = express();

// set local variable
app.set('view engine', 'ejs');
dotenv.config({path:'./config.env'});
app.use(express.static(__dirname+'/public/'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
mongoose.connect(process.env.mongoUrl);

// Configure session (BEFORE flash)
app.use(session({
    secret: process.env.SESSION_SECRET || 'nodejs',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

app.use(flash());

// Import models
let pageModel = require('./model/pageModel');
let productModel = require('./model/productModel');
let catModel = require('./model/categorymodel');
let User = require('./model/userModel');

// Import auth middleware
const { setLocals } = require('./middleware/authMiddleware');

// Set global variables for views
app.use(setLocals);

// Set other global variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.err = req.flash('err');
    
    // PASS PAGE DATA TO ALL FRONTEND HEADER
    pageModel.find({})
        .then((x) => {
            res.locals.navdata = x;         
        })
        .catch((y) => {
            // console.log(y)
        });
        
    // PASS ALL COURSES LIST TO ALL COURSE PAGES
    productModel.find({})
        .then((x) => {
            res.locals.allcourses = x;   
        });
        
    // PASS ALL CATEGORY DATA ANYWHERE
    catModel.find()
        .then((x) => {
            res.locals.allcat = x;
        });
       
    next();
});

// Auth routes (must be before admin routes)
let auth = require('./router/backend/auth');
app.use('/auth', auth);

// BACKEND ROUTER
const { isAuthenticated } = require('./middleware/authMiddleware');
let admin = require('./router/backend/admin');
let adminpages = require('./router/backend/admin-page');
let admincategory = require('./router/backend/admin-category');
let adminproducts = require('./router/backend/admin-products');
let adminUsers = require('./router/backend/admin-users');

// Apply auth middleware to all admin routes
app.use('/admin', isAuthenticated);

// Set router
app.use('/admin', admin); // route admin
app.use('/admin/pages', adminpages); // top navigation like (home, about, contact)
app.use('/admin/category', admincategory); // for category like (JavaScript, NodeJs, MongoDB)
app.use('/admin/products', adminproducts); // for product like (javascript related all topic || nodejs related All topic)
app.use('/admin/users', adminUsers); // for managing admin users

// FRONTEND ROUTER
let pages = require('./router/frontent/page');
let course = require('./router/frontent/product');

app.use('/course', course); 
app.use('/', pages);

// Create initial admin user if none exists
const createInitialAdmin = async () => {
    try {
        const adminCount = await User.countDocuments();
        if (adminCount === 0) {
            const defaultAdmin = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: 'admin123', // Will be hashed by the pre-save hook
                role: 'super-admin'
            });
            await defaultAdmin.save();
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

// Start server
app.listen(process.env.PORT, async () => {
    console.log(process.env.PORT, 'Port Working');
    await createInitialAdmin();
    console.log('Default credentials: admin@example.com / admin123');
});