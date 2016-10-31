const theater = require('./gameboard');

/*
Instantiate game with battle theater of n-x-n dimensions
The formatting for this limited demo doesn't hold beyond
the single digits of boats, so let's keep it between a
5 and 13 square grid for the sake of MVP.
*/
let gameBoard = theater(13);

// gameBoard.print('one');
gameBoard.print('two');
