/***
 * 用户相关功能模块
 * 向外提供 login()和register()两个请求处理函数
 */
const qs = require('querystring');  //使用qs模块解析POST数据
const pool = require('./dbpool');   //使用连接池模块获取连接

module.exports = {
  /**
   * 接收客户端POST提交的请求数据：uname、upwd
   * 保存入数据库，向客户端返回JSON字符串，形如：{"code":1,"msg":"注册成功","uid":31}
   * @param req
   * @param res
   */
  register: (req, res)=> {
    //读取POST请求数据：req.on('data', (buf)=>{})
    req.on('data', (buf)=> {
      //console.log(buf.toString());//uname=tom&upwd=123
      //解析出请求数据
      var obj = qs.parse(buf.toString());
      //获取数据库连接，提交SQL给数据库
      pool.getConnection((err, conn)=> {
        conn.query(
          'INSERT INTO t_login VALUES(NULL,?,?)',
          [obj.uname, obj.upwd],
          (err, result)=> {
            var output = {    //要输出给客户端的数据
              code: 1,
              msg: '注册成功',
              uid: result.insertId
            };
            res.json(output); //把数据转换为JSON字符串并输出
            conn.release();
          })
      });
    })
  },
  /**
   * 接收客户端POST提交的请求数据：uname、upwd
   * 验证登录信息是否正确，向客户端返回JSON字符串，形如：
   * {"code":1,"msg":"登录成功","uid":10}
   * 或者
   * {"code":2,"msg":"用户名或密码错误"}
   * @param req
   * @param res
   */
  login: (req, res)=> {
    //从POST请求中读取数据：uname、upwd
    req.on('data', (buf)=> {
      var obj = qs.parse(buf.toString());
      pool.getConnection((err, conn)=> {
        conn.query(
          'SELECT id FROM t_login WHERE uname=? AND upwd=?',
          [obj.uname, obj.upwd],
          (err, result)=> {
            if(result.length>0){ //查询到数据了
              var output = {
                code: 1,
                msg: '登录成功',
                uid: result[0].id
              }
            }else {  //未查询到数据
              var output = {
                code: 2,
                msg: '用户名或密码错误'
              }
            }
            res.json(output); //把数据转化为JSON
            conn.release();
          })
      })
    })
  }
};