const http = require('http');
const server = http.createServer(() => {

});
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:1234",
    methods: ["GET", "POST"]
  }
});


const state = {
  instruments: {
    'kick': null,
    'snare': null,
    'hihat': null,
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
    .filter(instrument => !state.instruments[instrument])[0];

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


server.listen(3000, () => {
  console.log('Listening on 3000');
});