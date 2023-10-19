const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {}, sequence : [] }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  const roo1m = io.sockets.adapter.rooms[req.params.room];
    // console.log(roo1m)
    const numberOfUsers = roo1m ? roo1m.length : 0;
  res.render('room', { roomName: req.params.room, userId:numberOfUsers+1 })
})

server.listen(3000)

io.on('connection', socket => {


  socket.on('add-seq', (room, seq) => {
    // console.log( rooms[room])
    // console.log(room, seq)
    rooms[room].sequence.push(seq)

    console.log(rooms)
    socket.to(room).broadcast.emit('seq-added',rooms[room].sequence )
  })
  socket.on('del-seq', (room, seq) => {
    // console.log( rooms[room])
    // console.log(room, seq)
    rooms[room].sequence = []

  })



  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    // console.log(rooms)
    const roo1m = io.sockets.adapter.rooms[room];
    // console.log(roo1m)
    const numberOfUsers = roo1m ? roo1m.length : 0;
    // console.log(`Users in room ${roo1m}: ${numberOfUsers}`);
    socket.to(room).broadcast.emit('user-connected', name,numberOfUsers )
  })
  socket.on('send-chat-message', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}