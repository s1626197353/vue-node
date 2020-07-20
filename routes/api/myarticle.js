let express = require('express')
let router = express.Router();
let mgdb = require('../../utils/mgdb');

router.get("/:table/:auth",(req,res)=>{
    let collectionName=req.params.table;
    let auth=req.params.auth;
    let _limit=Number(req.query.limit);
    // console.log(_limit);
    mgdb.findMyArticle({collectionName,auth,_limit}).then(result=>{
        // console.log("wwwwwww",result);//result.data是数组
        res.send(result);
    }).catch(err=>{
        console.log("查询失败异常：",err);
        res.send({err:1,msg:"查询失败"});
    });
});

module.exports=router;