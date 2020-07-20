let mongodb = require('mongodb');
let mongodbCt = mongodb.MongoClient
let ObjectId = mongodb.ObjectId//函数，把字符转换成ObjectId的对象型_id
let sql='app';

//链接库
let open = ({ dbName=sql, collectionName, url = 'mongodb://127.0.0.1:27017' }) => {
  return new Promise((resolve, reject) => {
    mongodbCt.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        reject(err)
      } else {
        let db = client.db(dbName);
        let collection = db.collection(collectionName)
        // console.log("clienttt",client);
        resolve({ collection, client, ObjectId })
      }
    })
  })
}

//查我的博文
let findMyArticle=({collectionName,auth,dbName = sql,_page, _limit, _sort, q})=>{
  return new Promise((resolve,reject)=>{
    // const url='mongodb://127.0.0.1:27017';
    open({collectionName}).then(({collection,client,ObjectId})=>{
      // console.log(_limit);
        collection.find({"detail.auth":auth}).limit(_limit).toArray((err,result)=>{
          // console.log("eeeee",result);//数组
          if (!err && result.length > 0) {//集合操作不失败，同时数据长度存在
            resolve({ //调用外面的then,传数据出去
              err: 0,
              data: result
            })
          } else {//调用外面的then,传数据出去
            resolve({
              err: 1,
              msg: '查无数据'
            })
          }
          client.close();
        });
    }).catch(err=>{
      reject({err:1,msg:"无法连接数据库"});
      client.close();
    })
  });
}


//查列表
let findList = ({
  collectionName,//集合名
  dbName = sql,//库名 默认值
  _page, _limit, _sort, q//可选参数
}) => {
  //_sort 排序    q 检索   _page 页数  _limit:限定条数

  //生成检索条件，给collectoin.find(条件,{配置})方法 使用 
  // let rule = q ? { username: new RegExp(q,g) } : {}
  let rule = q ? { title: eval('/' + q + '/') } : {}

  return new Promise((resolve, reject) => {

    //链库
    open({
      dbName, collectionName
    }).then(
      ({ collection, client }) => {
        //查询
        collection.find(rule, {
          skip: _page * _limit,//跳过
          limit: _limit,//限定
          projection: {},//规定要显示的列
          sort: { [_sort]: -1 }//单key的排序
        }).toArray((err, result) => {
          if (!err && result.length > 0) {//集合操作不失败，同时数据长度存在
            resolve({ //调用外面的then,传数据出去
              err: 0,
              data: result
            })
          } else {//调用外面的then,传数据出去
            resolve({
              err: 1,
              msg: '查无数据'
            })
          }

          client.close();

        })
      }
    ).catch(//链库失败
      err => {
        reject({
          err: 1,
          msg: '库链接失败'
        })
        client.close()
      }
    )
  })

}




//查详情
let findDetail = ({
  collectionName,//集合名
  dbName = sql,//库名 默认bulala
  _id = null
}) => { 
  return new Promise((resolve,reject)=>{
    //1.链库
    open({
      dbName,collectionName
    }).then(
      ({collection,client})=>{
        //2.查询
        //2.1 判断 _id的长度
        if(_id.length===24){//mongodb的自动生成_id的长度 24
          
          //集合查询 查_id
          collection.find({
            _id:ObjectId(_id) //把字符id转换成ObjectId
          },{projection:{_id:0}}).toArray((err,result)=>{

            //3.返回结果(resolve,reject)
            if(!err && result.length>0){
              resolve({
                err:0,
                data:result[0]//通过id查询到的结果是个对象，result是个数组
              })
            }else{
              resolve({
                err:1,
                msg:'查无数据'
              })
            }
            //4.关闭库链接
            client.close()
          })
          
          
        }else{
          reject({
            err:1,
            msg:'id有误'
          })
          client.close()
        }
      }
    ).catch(
      err=>{
        reject({
          err:1,
          msg:'链库失败'
        })
        client.close()
      }
    )
    
  })
}

// 增加
let insertOne = ({
  collectionName,//集合名
  dbName = sql,//库名 默认bulala
  _id = null,
  insertObj,
})=>{
  return new Promise((resolve,reject)=>{
    open({
      dbName,collectionName
    }).then(({collection,client})=>{
      collection.insertOne(insertObj,(err,results)=>{
        if(err){reject({err:1,msg:"插入数据库失败"});} 
        else{
          // console.log("results",results);
          resolve({err:0,msg:"add success"});} 
        client.close();
      })
    }).catch(err=>{
      reject({err:1,msg:"连接数据库失败"});
      client.close();
    });
  });
}

exports.open = open;
exports.findMyArticle = findMyArticle;
exports.findList = findList;
exports.findDetail = findDetail;
exports.insertOne = insertOne;
