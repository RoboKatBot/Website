"use strict";

var socket = new WebSocket(`wss://${location.host}/Chatroom/wss`);
ready.then(()=>{
	var input = document.getElementsByClassName('chat-input')[0];
	var form = document.getElementsByClassName('chat')[0];
	form.addEventListener('submit',(event)=>{
		event.preventDefault();
		var message = document.createElement('li');
		message.innerText=input.value;
		document.getElementById('messages').append(message)
		socket.send(input.value);
		input.value='';
	});
	socket.addEventListener('message',(msg)=>{
		var message = document.createElement('li');
		message.innerText=msg.data;
		document.getElementById('messages').append(message)
	});
},{once:true});