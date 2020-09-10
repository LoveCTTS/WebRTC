const express = require('express'); //기본적인 서버 구축에 필요한 express 패키지 가져오기
const app = express(); 
const server = require('http').Server(app); // http서버를 사용하기위해 http 패키지가져오고, Server메소드에 express관련기능을 사용할 수있는 app변수를 인자로 보냄

const io = require('socket.io')(server);// express와 http 기능을 사용하는 server변수를 socket.io 패키지를불러옴과 동시에 인자로 보내서 통신 준비 완료(express기능+http+통신)
const { v4: uuidV4 } = require('uuid'); // 보안을 위해 uuid 패키지 가져오기(기능상 반드시 필요한 것은 아님)

app.set('view engine', 'ejs'); //view engine을 ejs로 셋팅함으로써, app.get('view engine') 과 같이 명령할 시 ejs가 출력됨.
app.use(express.static('public')); //public 폴더 밑에 포함된 것(CSS,Image,Javascript code etc..)을 서버에 직접 제공함으로써 사용가능해지게 만듬.
//ex) 예를들어 public 폴더밑에 현재 script.js 파일이 있으니깐  URL에 127.0.0.1:3000/script.js 이와 같이 사용할 수 있게된다.
//여러개의 폴더를 포함시키려면 app.use(express.static('test folder')); 과 같이 직접 서버에 제공하고싶은 폴더를 여러번 명령하면 됨.


app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
// 사용자가 가장 main web page에 접속하면 
//req(request),res(response) 인자를 받은 콜백함수를 호출하여 express의 response.redirect를 사용해서 '/' 경로를 '/random code'로 redirection되게 설정

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
}); 
//room폴더에 있는 모든 파일중에 req.params.room의 값을 roomId에 자장해서 room이라는 ejs파일(view파일)로 값을 전송
//127.0.0.1:3000/을 치면 자동으로 뒤에 값이 uuid에 의해 랜덤값이 설정된것이 req.params.room에 초기화되어 roomdId에 저장되고, 그것이 room.ejs에 전송되어 room.ejs에서 사용할수있게됨.

io.on('connection', socket => { 
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId); //랜덤값을 가진 roomId로 room에 join
    socket.to(roomId).broadcast.emit('user-connected', userId);//나를 제외한 모든 클라이언트들에게 user-connected 됬다고 알림

    socket.on('disconnect', () => { 
      socket.to(roomId).broadcast.emit('user-disconnected', userId); //나를 제외한 다른 모든 클라이언트들에게 user-disconnected 됬다고 알림
    });
  });
});


server.listen(3000); //3000번 포트로 접속가능하도록 서버를 열어둠.
