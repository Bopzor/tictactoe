const socket = io.connect('http://localhost:3000');
let player = null;

socket.on('display-board', (size) => {
  createBoard(size);

  $('#go').attr('disabled', true);
});

socket.on('setPlayer', id => {
  player = id;

  const html = `<p>You are player ${id}.</p>`;

  $('#player').empty();
  $('#player').append(html);
});

socket.on('played', (currentPlayer, cell) => {
  $('#infos').empty();

  const td = $(`td[data-cell=${cell}]`);

  $(td).append(currentPlayer);

});

socket.on('not-empty', () => {
  $('#infos').empty();
  $('#infos').append('<p>Select an empty cell</p>');
});

socket.on('not-your-turn', () => {
  $('#infos').empty();
  $('#infos').append('<p>It is not your turn</p>');
});

socket.on('game-ended', (winner) => {
  displayWinMessage(winner);

  $('#infos').append(`<p>Game already finished.</p>`);
});

socket.on('win', (winner) => {
  displayWinMessage(winner);

  $('#go').attr('disabled', false);
});

socket.on('draw', () => {
  $('#infos').empty();
  $('#infos').append(`<p>It's a draw.</p>`);

  $('#go').attr('disabled', false);
});

socket.on('disconnected', () => {
  $('#infos').empty();
  $('#infos').append(`<p>Other player left.</p>`);
});

$('form').submit(() => {
  const size = $('#size').val();

  socket.emit('start', size);

  return false;
});

const createBoard = (size) => {
  let board = '<table>';
  let idx = 0;

  for (let i = 0; i < size; i++) {
    board += '<tr>'
    for (let j = 0; j < size; j++) {
      board +=`<td data-cell=${idx}></td>`;
      idx++
    }
    board += '</tr>'
  }

  board += '</table>'

  $('#board').empty();
  $('#infos').empty();
  $('#board').append(board);
};

const displayWinMessage = (winner) => {
  if (winner === player){
    win = 'You';

  } else {
    win = winner;
  }

  $('#infos').empty();
  $('#infos').append(`<p>${win} win the game!</p>`);
};

$('#board').on('click', 'td', function() {
  const cell = $(this).data('cell');

  socket.emit('selected', player, cell);
});
