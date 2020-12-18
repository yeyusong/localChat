// 连接socketio服务
var socket = io('http://localhost:3000/')
var username,avatar

// 登录
$('#login_avatar li').on('click',function(){
	$(this).addClass('now').siblings().removeClass('now')
})
$('#loginBtn').on('click',function(){
	var username = $('#username').val().trim()
	if(!username){
		alert('请输入用户名！')
		return
	}
	
	var avatar = $('#login_avatar li.now img').attr('src')
	
	socket.emit('login',{
		username : username,
		avatar : avatar
	})
})

// 监听登录失败的请求
socket.on('loginError',data=>{
	alert('此用户已经存在')
})
// 监听登录成功的请求
socket.on('loginSuccess',data=>{
	$('.login_box').fadeOut()
	$('.container').fadeIn()
	$('.avatar_url').attr('src',data.avatar)
	$('.user-list .username').text(data.username)
	
	username = data.username
	avatar = data.avatar
})

socket.on('addUser',data=>{
	$('.box-bd').append(`
		<div class="system">
		  <p class="message_system">
		    <span class="content">${data.username}加入了群聊</span>
		  </p>
		</div>
	`)
	scrollIntoView()
})

socket.on('userList',data=>{
	$('.user-list ul').html('')
	data.forEach(item=>{
		$('.user-list ul').append(`
			<li class="user">
			  <div class="avatar"><img src="${item.avatar}" alt=""></div>
			  <div class="name">${item.username}</div>
			</li>
		`)
	})
	
	$('#userTotalNumber').text(data.length)
})

socket.on('delUser',data=>{
	$('.box-bd').append(`
		<div class="system">
		  <p class="message_system">
		    <span class="content">${data.username}离开了群聊</span>
		  </p>
		</div>
	`)
	scrollIntoView()
})

$('.btn-send').on('click',()=>{
	let result = document.querySelector('#content').innerText.trim()
	    if (!result) return alert('请输入内容');
	    $('#content').html('')
	    $('#content').focus();
	
	socket.emit('sendMessage',{
		msg:result,
		username:username,
		avatar:avatar
	})
})

socket.on('receiveMsg',data=>{
	if(data.username === username){
		// 自己的消息
		$('.box-bd').append(`
			<div class="message-box">
			  <div class="my message">
			    <img src="${data.avatar}" alt="" class="avatar">
			    <div class="content">
			      <div class="bubble">
			        <div class="bubble_cont">${data.msg}</div>
			      </div>
			    </div>
			  </div>
			</div>
		`)
	}else{
		// 别人的消息
		$('.box-bd').append(`
			<div class="message-box">
			  <div class="other message">
			    <img src="${data.avatar}" alt="" class="avatar">
			    <div class="content">
			      <div class="nickname">${data.username}</div>
			      <div class="bubble">
			        <div class="bubble_cont">${data.msg}</div>
			      </div>
			    </div>
			  </div>
			</div>
		`)
	}
	scrollIntoView()
	
})
// 默认滚到底部
function scrollIntoView(){
	$('.box-bd').children(':last').get(0).scrollIntoView(false)
}

// 发送图片功能
$('#file').on('change',function(){
	var file = this.files[0]
	var fr = new FileReader()
	fr.readAsDataURL(file)
	fr.onload = function(){
		socket.emit('sendImage',{
			username:username,
			avatar:avatar,
			img:fr.result
		})
	}
})


socket.on('receiveImage',data=>{
	if(data.username === username){
		// 自己的消息
		$('.box-bd').append(`
			<div class="message-box">
			  <div class="my message">
			    <img src="${data.avatar}" alt="" class="avatar">
			    <div class="content">
			      <div class="bubble">
			        <div class="bubble_cont">
						<img src="${data.img}">
					</div>
			      </div>
			    </div>
			  </div>
			</div>
		`)
	}else{
		// 别人的消息
		$('.box-bd').append(`
			<div class="message-box">
			  <div class="other message">
			    <img src="${data.avatar}" alt="" class="avatar">
			    <div class="content">
			      <div class="nickname">${data.username}</div>
			      <div class="bubble">
			        <div class="bubble_cont">
						<img src="${data.img}">
					</div>
			      </div>
			    </div>
			  </div>
			</div>
		`)
	}
	$('.box-bd img:last').on('load',function(){
		scrollIntoView()
	})
	
})