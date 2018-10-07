const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io').listen(http);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res, next) => {
  res.sendFile('/index.html');
});

let player = 'O';

class Game {
  constructor() {
    this.size = null;
    this.board = [];
    this.turn = null;
    this.winner = null;
  }

  init(size) {
    this.size = size;
    this.turn = 1;

    for (let i = 0; i < (this.size * this.size); i++) {
      this.board[i] = null;
    }
  }

  setCell(cell, token) {
    this.board[cell] = token;
  };

  setWinner(player) {
    this.winner = player;
  }

  setTurn() {
    this.turn += 1;
  }

  draw() {
    for (let i = 1; i < this.board.length; i++) {
      if (this.board[i] === null) {
        return false;

      } else if (this.board[i] !== null) {
        continue;
      }
    }

    return true;
  }

  win() {
    for (let i = 0; i < this.board.length; i += 4) {
      if (this.board[i] === null) {
        continue;
      }

    switch (i) {
      case 0:
        if (this.board[i] === this.board[i + 3] && this.board[i] === this.board[i + 6]) {
          return true;
        }

        if (this.board[i] === this.board[i + 1] && this.board[i] === this.board[i + 2]) {
          return true;
        }

        continue;

      case 4:
        if (this.board[i] === this.board[i - 3] && this.board[i] === this.board[i + 3]) {
         return true;
        }

        if (this.board[i] === this.board[i + 1] && this.board[i] === this.board[i - 1]) {
          return true;
        }

        if (this.board[i] === this.board[i - 4] && this.board[i] === this.board[i + 4]) {
          return true;
        }

        if (this.board[i] === this.board[i - 2] && this.board[i] === this.board[i + 2]) {
          return true;
        }

        continue;

      case 8:
        if (this.board[i] === this.board[i - 3] && this.board[i] === this.board[i - 6]) {
          return true;
        }

        if (this.board[i] === this.board[i - 1] && this.board[i] === this.board[i - 2]) {
          return true;
        }

        break;
    }
  }

    return false;
  }

}

const game = new Game();

const setPlayers = () => {
  player = 'X';
};

io.on('connection', (socket) => {

  socket.on('start', (size) => {
    game.init(size);

    io.emit('display-board', game.size);

    setPlayers();
    socket.emit('setPlayer', 'X');
    socket.broadcast.emit('setPlayer', 'O');
  });

  socket.on('selected', (currentPlayer, cell) => {
    if (game.win() || game.draw()) {
      socket.emit('game-ended', game.winner);
      return;
    }

    if (game.board[cell] !== null) {
      socket.emit('not-empty');
      return;
    }

    if (game.turn % 2 !== 0) {

      if (currentPlayer !== 'X') {
        socket.emit('not-your-turn');
        return;

      } else {
        game.setCell(cell, currentPlayer);

        io.emit('played', currentPlayer, cell);

        if (game.win()) {
          game.setWinner(currentPlayer);

          io.emit('win', game.winner);

          return;

        } else if (game.draw()) {
          game.setWinner('Nobody');

          io.emit('draw');

          return;
        }

        game.setTurn();
      }

    } else {

      if (currentPlayer !== 'O') {
        socket.emit('not-your-turn');
        return;

      } else {
        game.setCell(cell, currentPlayer);

        io.emit('played', currentPlayer, cell);

        if (game.win()) {
          game.setWinner(currentPlayer);

          io.emit('win', game.winner);

          return;

        } else if (game.draw()) {
          io.emit('draw');

          return;
        }

        game.setTurn();
      }
    }

  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnected');
  });

});

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page not found');
});

http.listen(3000, () => {
  console.log('listening on PORT 3000');
});
