let express = require('express')
let catModel = require('../../model/categorymodel')
let router = express()
let multer = require('multer');


//IMAGE NAME SETTING
let storage = multer.diskStorage({
    destination: 'public/backend/images/',
    filename: (req, file, cb) => {
        //cb(null, Date.now() + file.originalname) // file name setting with current –date
	cb(null ,  file.originalname) // file name setting with original name
    }
})

//IMAGE UPLOAD SETTING
let upload = multer({
    storage: storage,
    // here image validation
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
            cb(null, true)
        }
        else {
            cb(null, false)
            return cb(new Error('Only Jpg, png, jpeg, allow'))
        }
    }})  



router.get('/', (req, res)=>{   
    catModel.find({})
    .then((x)=>{
        
        res.render('../views/backend/category.ejs', {x})
    })
})
router.get('/add-category/', (req, res)=>{
    res.render('../views/backend/categoryAdd')
    //catModel
})
router.post('/add-category/',  upload.single('category_photo'), (req, res)=>{
    if(!req.file){
        catModel.create({
            category        :       req.body.category,
            categoryUrl     :       req.body.category_url,
            categoryTitle   :       req.body.category_title,
            categoryMeta    :       req.body.category_meta_keyword,
            categoryDesc    :       req.body.category_meta_desc,
            //categoryPhoto :       req.file.filename,
            categoryDetails :       req.body.category_details
        })
        .then((x)=>{
            console.log(x)
            req.flash('sucess', 'Your Data has been created on Data base')
            res.redirect('/admin/category/')
        })
    }
    else{
        catModel.create({
            category        :       req.body.category,
            categoryUrl     :       req.body.category_url,
            categoryTitle   :       req.body.category_title,
            categoryMeta    :       req.body.category_meta_keyword,
            categoryDesc    :       req.body.category_meta_desc,
            categoryPhoto   :       req.file.filename,
            categoryDetails :       req.body.category_details
        })
        .then((x)=>{
            console.log(x)
            res.redirect('/admin/category/')
        })

    }
})
router.get('/edit/:id', (req, res)=>{
    catModel.findOne({category:req.params.id})
    .then((x)=>{
        res.render('../views/backend/categoryEdit', {x})
    })
    .catch((y)=>{
        console.log(y)
    })
    
})


router.put('/edit/:id', upload.single('category_photo'), (req, res)=>{
    if(!req.file){
        catModel.updateOne({category:req.params.id}, {$set:{
            category            :   req.body.category,
            categoryUrl         :   req.body.category_url,
            categoryTitle       :   req.body.category_title,
            categoryMeta        :   req.body.category_meta_keyword,
            categoryDesc        :   req.body.category_meta_desc,
            //categoryPhoto     :   req.file.filename,
            categoryDetails     :   req.body.category_details
        }})
        .then((x)=>{
            console.log(x)
            req.flash('sucess', 'Your Data has been updated on Data base')
            res.redirect('/admin/category/')
        })
        .catch((y)=>{
            console.log(y)
        })
    }
    else{
        catModel.updateOne({category:req.params.id}, {$set:{
            category        :       req.body.category,
            categoryUrl     :       req.body.category_url,
            categoryTitle   :       req.body.category_title,
            categoryMeta    :       req.body.category_meta_keyword,
            categoryDesc    :       req.body.category_meta_desc,
            categoryPhoto   :       req.file.filename,
            categoryDetails :       req.body.category_details
        }})
        .then((x)=>{
            res.redirect('/admin/category/')
        })
        .catch((y)=>{
            console.log(y)
        })

    }
})

router.delete('/delete/:id', (req, res)=>{
    catModel.deleteMany({category:req.params.id})
    .then((x)=>{
        req.flash('sucess', 'Your Data has been Sucessfuly updated on data base')
        res.redirect('/admin/category/')
    })
    .catch((y)=>{
        console.log(y)
    })
})

module.exports = router