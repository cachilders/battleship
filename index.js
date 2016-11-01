const readline = require('readline');
const theater  = require('./gameboard');

let round = 1;
let gridRange;
let gameBoard;

let player = () => round % 2 !== 0 ? 'one' : 'two';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('\nTo begin a new game enter a grid size between 4 and 13.\n> ');
/*
Instantiate game with battle theater of n-x-n dimensions
The formatting for this limited demo doesn't hold beyond
the single digits of boats, so let's keep it between a
5 and 13 square grid for the sake of MVP.
*/
rl.prompt();
rl.on('line', (line) => {
  let command = line.replace(/\s/g, '');
  if (!gameBoard) {
    if (4 < parseInt(command) && parseInt(command) < 14) {
      gameBoard = theater(command);
      gridRange = command - 1;
      rl.setPrompt('\nPlayer ' + player() + ' >>\n' +
        'Choose the coordinates for your attack salvo —\n' +
        'two numbers between 0 and ' + gridRange + ' like so: > 5, 3\n' +
        'Use "peek" to display your game board.\n> ');
    } else {
      rl.setPrompt('\nWeird. Let\'s give that another shot.' +
        'Should be a number between 5 and 13.\n> ');
    }
  } else {
    switch(true) {
      case /[0-99],[0-99]/.test(command):
        let solution = command.split(',').concat(player());
        let result = gameBoard.fire(...solution);
        console.log('\n' + result[0]);
        if (result[1] === 2) {
          rl.setPrompt('\nTo begin a new game enter a grid size between 4 and 13.\n> ');
          gameBoard = null;
        } else {
          round += result[1];
          rl.setPrompt('\nPlayer ' + player() + ' >>\n' +
            'Choose the coordinates for your attack salvo —\n' +
            'Use "peek" to display your game board.\n> ');
        }
        break;
      case /peek/.test(command):
        gameBoard.print(player());
        break;
      default:
        rl.setPrompt('\nPlayer ' + player() + ' >>\n' +
          'Hmm. Didn\'t catch that. Try "peek" for a look at your board or give' +
          'two numbers between 0 and ' + gridRange + ' like so: > 5, 3\n' + '\n> ');
        break;
    }
  }
  rl.prompt();
});
