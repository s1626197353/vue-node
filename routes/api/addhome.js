let express = require('express')
let router = express.Router();
let fs = require('fs');
let pathLib = require('path');
let mgdb = require('../../utils/mgdb');
const utils=require("../../utils/utils");
var uploadUrl = require('../../config/global').upload.product;

router.post("/:goodsname",(req,res,next)=>{
    // console.log('....');
    // console.log(req.files);
    let collectionName = req.params.goodsname;
    // console.log("req.params",req.params);
    // console.log("req.body",req.body.auth_icon);
    // console.log("数组",req.files[0]);
    if(req.body.title==='' || req.body.des==='' ||req.body.auth===''||req.body.content===''){
        res.send({err:1,msg:"除图片外不得为空"});
    }else{
        //图片存储
        let auth_icon = req.files.length ? uploadUrl + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext : '';
        if(auth_icon){
            fs.renameSync(
            req.files[0].path,
            req.files[0].path+pathLib.parse(req.files[0].originalname).ext
            )
        }else{
            auth_icon = '/upload/noimage.png';
        }
        // console.log(req.body);
        mgdb.insertOne({
            collectionName,
            insertObj:{
                title:req.body.title,
                des:req.body.des,
                time:Date.now(),
                detail:{
                    auth:req.body.auth,
                    content:req.body.content,
                    auth_icon:auth_icon,
                }
            }
        }).then(result=>{
            // console.log("ressss",result);
            res.send(result);
        }).catch(err=>{
            // console.log("errrrr",err);
            res.send(err);
        })
    }
    
});

module.exports = router;