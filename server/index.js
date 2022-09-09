const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('../client/dist'));


const state = {
  instruments: {
    'kick': null,
    'snare': null,
    'hat': null,
    'perc': null
  },
  users: [{
    id: '',
  }]
}

const getInstrument = socketId =>
  Object.keys(state.instruments)
    .find(instrument => state.instruments[instrument] === socketId);

io.on('connection', (socket) => {
  const availableInstrument = Object.keys(state.instruments)
    .filter(instrument => state.instruments[instrument] === null)[0];

  state.instruments[availableInstrument] = socket.id;
  state.users.push({ id: socket.id });

  socket.emit('setInstrument', {
    instrument: availableInstrument
  });

  socket.on('trigger', msg => {
    const instrument = getInstrument(socket.id);
    io.emit('trigger', {
      instrument
    });
  });

  socket.on('disconnect', () => {
    const instrument = getInstrument(socket.id);
    state.instruments[instrument] = null;
    state.users = state.users.filter(user => user.id !== socket.id);
  });
});


server.listen(process.env.PORT, () => {
  console.log('Listening on ', process.env.PORT);
});