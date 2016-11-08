const readline = require('readline');
const theater  = require('./gameboard');

let playerCount = null;
let currentPlayer = 0;
let gridRange;
let gameBoard;

// let player = () => round % 2 !== 0 ? 'one' : 'two';
let player = () => {
  currentPlayer += 1;
  if (currentPlayer > playerCount) {
    currentPlayer = 1;
  }
  return currentPlayer;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('\nHow many players?\n> ');
/*
Instantiate game with battle theater of n-x-n dimensions
The formatting for this limited demo doesn't hold beyond
the single digits of boats, so let's keep it between a
5 and 13 square grid for the sake of MVP.
*/
rl.prompt();
rl.on('line', (line) => {
  let command = line.replace(/\s/g, '');
  if (!playerCount) {
    if (1 < parseInt(command)) {
      playerCount = parseInt(command);
      rl.setPrompt('\nEnter a grid size between 5 and 13\n> ');
    } else {
      rl.setPrompt('\nLet\'s take another stab at that.' +
        'Should be a number greater than 2.\n> ');
    }
  } else if (!gameBoard) {
    if (4 < parseInt(command) && parseInt(command) < 14) {
      gameBoard = theater(command, playerCount);
      gridRange = command - 1;
      rl.setPrompt('\nPlayer ' + player() + ' >>\n' +
        'Attack the next player by choosing coordinates —\n' +
        'two numbers between 0 and ' + gridRange + ' like so: > 5, 3\n' +
        'Use "peek" to display your game board.\n> ');
    } else {
      rl.setPrompt('\nWeird. Let\'s give that another shot.' +
        'Should be a number between 5 and 13.\n> ');
    }
  } else {
    switch(true) {
      case /[0-99],[0-99]/.test(command):
        let solution = command.split(',').concat([currentPlayer, playerCount]);
        let result = gameBoard.fire(...solution);
        console.log('\n' + result[0]);
        if (result[1] === 2) {
          rl.setPrompt('\nTo begin a new game enter a grid size between 4 and 13.\n> ');
          gameBoard = null;
          playerCount = null;
          currentPlayer = null;
        } else {
          if (result[1] === 0) {
            rl.setPrompt('\nPlayer ' + currentPlayer + ' >>\n' +
            'You\'re on a streak!. Take another shot.\n> ');
          } else {
            rl.setPrompt('\nPlayer ' + player() + ' >>\n' +
            'Attack the next player by choosing coordinates —\n' +
            'two numbers between 0 and ' + gridRange + ' like so: > 5, 3\n' +
            'Use "peek" to display your game board.\n> ');
          }
        }
        break;
      case /peek/.test(command):
        gameBoard.print(currentPlayer);
        break;
      default:
        rl.setPrompt('\nPlayer ' + currentPlayer + ' >>\n' +
          'Hmm. Didn\'t catch that. Try "peek" for a look at your board or give' +
          'two numbers between 0 and ' + gridRange + ' like so: > 5, 3\n' + '\n> ');
        break;
    }
  }
  rl.prompt();
});
