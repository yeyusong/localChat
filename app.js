var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// 记录已经登录的用户
const users = [];

server.listen(3000,()=>{
	console.log('服务器启动成功');
});

// 处理静态资源
app.use(require('express').static('public'))

app.get('/',function(req,res){
	res.redirect('/index.html')
});

io.on('connection',function(socket){
	socket.on('login',data=>{
		let user = users.find(item => item.username === data.username)
		if(user){
			// 用户已存在
			socket.emit('loginError',{msg:'登录失败'})
		}else{
			// 该用户不存在
			users.push(data)
			socket.emit('loginSuccess',data)
			// 广播事件，告诉所有用户
			io.emit('addUser',data)
			// 当前聊天室人数
			io.emit('userList',users)
			// 存储登陆成功的用户名和头像
			socket.username = data.username
			socket.avatar = data.avatar
		}
	})
	// 用户断开连接
	socket.on('disconnect',()=>{
		let idx = users.findIndex(item => item.username === socket.username)
		users.splice(idx,1)
		io.emit('delUser',{
			username:socket.username,
			avatar:socket.avatar
		})
		io.emit('userList',users)
	})
	
	// 监听聊天的消息
	socket.on('sendMessage',data=>{
		// console.log(data);
		io.emit('receiveMsg',data)
	})
	
	// 接收图片信息
	socket.on('sendImage',data=>{
		io.emit('receiveImage',data)
	})
});