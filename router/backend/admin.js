let express = require('express')
let productModel = require('../../model/productModel')
let catModel = require('../../model/categorymodel')
let pageModel = require('../../model/pageModel')
let router = express()

router.use((req, res, next)=>{

    catModel.find({}).count()
    .then((x)=>{
        res.locals.noofcat =x
    })


    pageModel.find({}).count()
    .then((x)=>{
        res.locals.noOfPage =x
    })


    next()
})

router.get('/', (req, res)=>{
    productModel.find({}).count()
    .then((noofcourse)=>{
        res.render('../views/backend/admin-File.ejs',{noofcourse})
    })
})



// router.use((req, res, next)=>{
  
//     next()

// })

module.exports = router