const socket = io('/');
const videoGrid = document.getElementById('video-grid');//ejs내의 ID가 video-grid인 것을 찾아서 videoGrid변수에 저장
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3003'
});
//클라이언트 PeerJS에서 3003 포트의 서버에 연결
const myVideo = document.createElement('video'); //video 요소 생성해서 myVideo에 반환
myVideo.muted = true; //비디오켜지면 기본적으로 오디오는 음소거로 세팅 (false로 바꾸면 음소거 해제)
const peers = {}; 
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);//Webcam의 stream을 myVideo에 추가

  myPeer.on('call', call => { //peer로 부터 call이 들어오면
    call.answer(stream); //자신의 stream과함께 답장
    const video = document.createElement('video'); //video 요소를 만들어서 vido변수에 저장
    call.on('stream', userVideoStream => { //call이 연결되면
      addVideoStream(video, userVideoStream); //자신이 아닌 다른 user의 stream을 video에 저장하고 브라우저에 webcam 출력
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream); //유저가 연결되면 userId를 인자로받아서 connectToNewUser함수에 userId와 자신의 stream을 인자로보냄
  });
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close(); //유저와의 연결이 끊기면(if(peer[userId])), peerJS의 peers[uuserId].close를 통해 연결 종료
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id); //PeerJS를 통해 클라이언트가 room에 접속
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream); //PeerJS의 call 메소드에 userId와 자신의 stream(webcam)을 인자로보내서 반환값을 call에 저장
  const video = document.createElement('video');//video요소 생성
  call.on('stream', userVideoStream => { //call이 성공하면
    addVideoStream(video, userVideoStream);//자신의 stream을 비디오에 추가
  });
  call.on('close', () => { //call이 끊어지면
    video.remove(); //video를 remove
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream; //자신의 webcam stream을 video.srcObject에 초기화
  video.addEventListener('loadedmetadata', () => { //동영상과같은 데이터가 event로 발생하면 video.play()함수 실행
    video.play();// webcam의 stream을 video요소에 넣었기때문에 play해주면 video를 통해 webcam이 동작이됨.
  });
  videoGrid.append(video);//ejs에 추가해놓은 style 옵션대로 video를 출력해라.
}