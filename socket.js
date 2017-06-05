/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2017-06-03 23:12:17
 * @version $Id$
 */

//引入模块
var express = require('express'),io = require('socket.io');
io=io.listen(express().listen(5230,()=>{
	console.log("服务开启！")
}));
//定义房间集合数组
var roomInfo = {};
var roomID,userID;
io.on("connection",(socket)=>{
	console.log("some one connection")
	roomID = socket.handshake.query.roomID;
	userID = socket.id;
	console.log(roomID);
	if (!roomID) {
		//房主
		roomID = "roomID" + Math.ceil(Math.random()*10);
		roomInfo.roomID = {
			roomID,userID:[userID],readyCount:1
		};
		socket.join(roomID)
		//创建房间成功
		//返回房主自己的用户信息
		socket.emit("creatroom",{roomID,Identity:"roomsOwner",userinfo : { nickName:"some one",id : userID }});
	}else {
		if (!roomInfo.roomID) {
			roomInfo.roomID = {
				roomID,userID:[userID],readyCount:1
			};
			socket.join(roomID)
			//创建房间成功
			//返回房主自己的用户信息
			socket.emit("creatroom",{roomID,Identity:"roomsOwner",userinfo : { nickName:"some one",id : userID }});
		}else {

			if (roomInfo.roomID && roomInfo.roomID.userID.length<2) {
				socket.join(roomID);
				roomInfo.roomID.userID.push(userID);
				//加入房间成功
				//接收房间其他成员的信息，并且向房间内所有用户发布自己的信息
				socket.emit("joinroom",{roomID,Identity:"roomer",userinfo : { nickName:"some one",id : userID }});
				socket.broadcast.to(roomID).emit("addroomers",{ nickName:"some one",id : userID })
			}
		}
		
	}
	console.log(roomInfo)
	//退出房间
	socket.on("disconnect",()=>{
		// console.log("some one disconnect")
		roomID = socket.handshake.query.roomID;
		userID = socket.id;
		if (roomInfo.roomID) {
			var index= roomInfo.roomID.userID.indexOf(userID);
			roomInfo.roomID.userID.splice(index,1);
			socket.leave(roomID);
			if (roomInfo.roomID.userID.length <=0) {
				delete roomInfo.roomID;
			}
		};
		console.log(roomInfo)
	})
})