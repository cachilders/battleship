function Theater(n) {
  this.board = this.nMatrix(n);
  this.player1 = {
    placement: this.board.slice(),
    plays: this.board.slice()
  };
  this.player2 = {
    placement: this.board.slice(),
    plays: this.board.slice()
  };
}

Theater.prototype.nMatrix = function(n) {
  let matrix = [];
  let row = [];
  for (let i = 0; i < n; i++) {
    row.push(0);
  }
  for (let i = 0; i < n; i++) {
    matrix.push(row.slice());
  }
  return matrix;
};

let gameBoard = new Theater(10);

console.log(gameBoard.player1.plays);
