const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const red = document.getElementById('red')
const green = document.getElementById('green')
const yellow = document.getElementById('yellow')
const blue = document.getElementById('blue')
const astronaut = document.getElementById('astronaut')
const overlay = document.getElementById('overlay')
const viewScore = document.getElementById('score')
const body = document.getElementById('body')
const levelTitle = document.getElementById('level-title')
// var a = roomNamec
// let userId;
let score = 0;
let user_soc;
// $(document).ready(function () {
// });


let seq = [3]
let userClickedPattern = []


levelTitle.addEventListener('click', () => {

  socket.emit('add-seq', roomName, 3)
})
if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}



socket.on('someone-lost', data => {
  console.log(data, 'dream')
  if (userId > data.userId) {
    userId = userId - 1
  }
  appendMessage(`${data.name}: ${data.message}`, 'lost-title')
})



socket.on('you-win', data => {
  body.classList.add("you-win");
  // alert('you win')
})



socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', (name, id, user_soc) => {

  user_soc = user_soc
  appendMessage(`${name} connected`)

})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})
socket.on('seq-added', data => {

  playSound(colors[data[data.length - 1]])
  seq = [3, ...data]
  if (seq.length % 2 + 1 != Number(userId)) {

    overlay.classList.remove('no-click')

  }
  console.log(seq, 'seq from wildcard', seq.length % 2 + 1 == Number(userId))
})

  function appendMessage(message, type) {
    const messageElement = document.createElement('div')
    messageElement.innerHTML = `<p class=${type}>${message}</p>`
    messageContainer.append(messageElement)
  }




const colors = ['red', 'green', 'yellow', 'blue'];

colors.forEach(color => {
  const element = document.getElementById(color);
  element.addEventListener('click', () => {


    // if ( != Number(userId)) {
    //   alert(
    //     'not my turn'
    //   )

    // }

    console.log(seq.length % 2 + 1, 'wild')
    userClickedPattern.push(colors.indexOf(color));
    console.log(userClickedPattern, 'this is userClickedPattern')
    console.log(seq, 'this is seq')
    playSound(color);


    if (userClickedPattern.length > seq.length) {

      if (seq.length % 2 + 1 != Number(userId)) {
        overlay.classList.add('no-click')
      } else {
        overlay.classList.remove('no-click')

      }
      console.log('adding to socket.........,', seq.length % 2 + 1 != userId)
      socket.emit('add-seq', roomName, colors.indexOf(color))
      userClickedPattern = []
    } else {
      checkAnswer(userClickedPattern.length - 1)
    }

  });
});

function playSound(name) {
  const audio = new Audio(name + '.mp3');
  audio.play();
}



function checkAnswer(currentLevel) {

  if (seq[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === seq.length) {


      //pass
      score = score + 100
      viewScore.innerText = score

      console.log('pass')
    }
  } else {
    // fail

    socket.emit('del-seq', roomName)
    playSound("wrong");

    socket.emit('won-lost', roomName, userId)
    appendMessage('you: lost', 'lost-title')
    overlay.classList.add('no-click')
    body.classList.remove("background");
    body.classList.add("game-over");
    levelTitle.innerText = "Game Over, Click here  to Restart";
    userClickedPattern = []
    setTimeout(function () {
      body.classList.remove("game-over");
      body.classList.add("background");
    }, 200);

    startOver();
  }
}