const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const {v4:uuid4} = require('uuid')
const http = require('http')
const app = express();
const {spawn} = require('child_process')
const server = http.createServer(app)
const io = require('socket.io')(server)
const fs = require('fs' )

app.use(express.static('public'))

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/routes/index.js', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.get('/home', (req,res) =>{
  res.render('home')
})
app.get('/home2', (req,res) =>{
  res.render('home2')
})
app.get('/contact', (req,res) =>{
  res.render('contact')
})
app.get('/', (req,res) =>{
  res.render('landing')
})
app.get('/landing', (req,res) =>{
  res.render('landing')
})

app.get('/:id', (req,res) => {
  res.render('index')
})


const PORT = process.env.PORT || 5000;


rooms_data = {}
editor_data = {}

io.sockets.on('connection', socket => {
  // io.sockets.emit('update_notes_for_new_users',notes_text)

  socket.on('update_notes_for_current_users',(data,roomId) =>{
      // console.log(roomId)
      // socket.join(roomId)
      // console.log(data)
      rooms_data[roomId] = data
      socket.broadcast.to(roomId).emit('update_notes_for_current_users',data)
      // console.log(data,roomId,socket.id)
      // var clients = io.sockets.adapter.rooms;
      // console.log(clients)
      // console.log(socket.id)
  })

  socket.on('update_editor_for_current_users',(data,roomId) =>{
      editor_data[roomId] = data
      socket.broadcast.to(roomId).emit('update_editor_for_current_users',data)
  })

  socket.on('create_new_room', (roomId) =>{
      // const roomId = uuid4()
      console.log(roomId)
      socket.join(roomId)
      if(!(roomId in editor_data)){
          editor_data[roomId] = ''
      }
      io.to(socket.id).emit('update_notes_for_new_users',rooms_data[roomId])
      io.to(socket.id).emit('update_editor_for_new_users',editor_data[roomId])
      // io.to(roomId).emit('send-roomId',roomId)
      // console.log("user created room",socket.id)
  })

  socket.on('run_python_script', (data,roomId) =>{
      const fileName = new Date().getTime().toString()+'.py'
      var output = ''
      fs.appendFile(`python/${fileName}`,data, function (err) {
          if (err) throw err;
        });
      const python = spawn('python',[`python/${fileName}`])
      python.stdout.on('data', (data) =>{
          // console.log(data.toString())
          output = output.concat(data.toString())
          // console.log(output)
      })
      python.on('close', (code) => {
          // console.log(`Exit code: ${code}`);
          output = output.concat(`\nExit code: ${code}`)
          // console.log(output)
          socket.broadcast.to(roomId).emit('update_output_for_current_users',output)
          io.to(socket.id).emit('update_output_for_current_users',output)
          fs.unlink(`python/${fileName}`, function (err) {
              if (err) throw err;
            });
      })

      
  })

})



server.listen(PORT, console.log(`Server running on  ${PORT}`));
