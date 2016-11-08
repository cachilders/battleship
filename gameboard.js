function Theater(n, playerCount) {
  this.fleet = this.setFleet(n);
  this.players = this.addPlayers(n, playerCount, this);
}

Theater.prototype.addPlayers = (n, count, theater) => {
  let players = {};
  for (let i = 1; i <= count; i++) {
    players[i] = {
      player    : i,
      plays     : theater.nMatrix(n),
      kills     : 0,
      fleet     : theater.setFleet(n),
      placement : theater.placeFleet(n, theater.fleet)
    };
  }
  return players;
};

Theater.prototype.nMatrix = (n) => { // Build a matrix (2n)
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

Theater.prototype.setFleet = function(n) { // Assign ships (n, not including sort, also n)
  let budget = Math.ceil(n * .68); // Match 7/10 boat ratio for model game
  let ships = [
    ['submarine', 1],
    ['destroyer', 2],
    ['cruiser', 3],
    ['battleship', 4],
    ['carrier', 5]
  ];
  let fleet = () => { // Loop over ships to insert proper classes, smallest first
    let dryDock = [];
    let i = 0;
    while (budget > 0) {
      if (i > 4) { // Reset loop
        i = 0;
      }
      dryDock.push(ships[i]);
      budget -= 1;
      i++;
    }
    return dryDock.sort((a, b) => { // Sort ships left to right in ascending size
      if (a[1] > b[1]) {
        return -1;
      } else if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    });
  };
  return fleet();
};

Theater.prototype.placeFleet = function(n, fleet) { // Randomly place ships on board (n^n? It's complex)
  let field = this.nMatrix(n);
  let boats = fleet.slice();
  for (let i = 0; i < boats.length; i++) {
    let position = this.roll(0, n - 1); // [x, y, orientation]
    let size = boats[i][1];
    let navigator = [];
    if (field[position[1]][position[0]] > 0) { // Occupied? Reroll.
      i--;
    } else if (position[2] === 0) { // orient horizontally if 0
      if (position[1] - size >= 0) { // We're only checking right to left from the anchor
        for (let j = size; j > 0; j--) {
          navigator.push([position[1] - j, position[0]]);
        }
        if (navigator.reduce((sum, val) => { // Is one of the blocks occupied? Reroll.
          return sum + field[val[1]][val[0]];
        }, 0) > 0) {
          i--;
        } else  {
          navigator.forEach(loc => field[loc[1]][loc[0]] = i + 1); // Ship ID is one greater than ship index
        }
      } else {
        i--;
      }
    } else {
      if (position[0] - size >= 0) { // We're only checking down to up from the anchor
        for (let j = size; j > 0; j--) {
          navigator.push([position[1], position[0] - j]);
        }
        if (navigator.reduce((sum, val) => { // Is one of the blocks occupied? Reroll.
          return sum + field[val[1]][val[0]];
        }, 0) > 0) {
          i--;
        } else  {
          navigator.forEach(loc => field[loc[1]][loc[0]] = i + 1); // Ship ID is one greater than ship index
        }
      } else {
        i--;
      }
    }
  }
  return field;
};

Theater.prototype.roll = function(min, max) { // Just generate a few random numbers (Constant)
  return [
    Math.floor(Math.random() * (max - min + 1)),
    Math.floor(Math.random() * (max - min + 1)),
    Math.floor(Math.random() * (1 - 0 + 1)) // This shouldn't be written like this. Should just be 2.
  ];
};
// This one could also be improved algorithmically
Theater.prototype.format = function(player) { // Draws game board. Should be abstracted elsewhere. (Linear)
  let prettified = '\n' +
    ' Player ' +
    player.player +
    '\n\n' +
    ' \/\/SHOTS' +
    '   '.repeat(player.plays.length - 2) +
    '\/\/FLEET' +
    '\n' +
    '╔' +
    '═══'.repeat(player.plays.length) +
    '╦' +
    '═══'.repeat(player.plays.length) +
    '╗' +
    '\n';
  for (let i = 0; i < player.plays.length; i++) {
    prettified += '║ ' +
    player.plays[i].join('  ')
      .replace(/0/g, ' ')
      .replace(/1/g, '⦵')
      .replace(/2/g, '❌') +
    ' ║ ' +
    player.placement[i].join('  ').replace(/0/g, ' ') +
    ' ║\n';
  }
  prettified += '╠' +
    '═══'.repeat(player.plays.length) +
    '╬' +
    '═══'.repeat(player.plays.length) +
    '╣' + '\n' +
    '║ ' +
    'YOUR KILLS: '
    + player.kills +
    '   '.repeat(player.plays.length - 5) +
    ' ║ ' +
    'YOUR SHIPS: '
    + player.fleet.filter(boat => boat[1] > 0).length +
    '   '.repeat(player.plays.length - 5) +
    ' ║\n' +
    '╚' +
    '═══'.repeat(player.plays.length) +
    '╩' +
    '═══'.repeat(player.plays.length) +
    '╝' + '\n';
  return prettified;
};

Theater.prototype.print = function(player) { // Just a logging method. Pretty weak.
  let boards = this.format(this.players[player]);
  console.log(boards);
  // return boards;
};

Theater.prototype.fire = function(x, y, player, count) { // Actual gameplay. Probably belongs elsewhere, more broken up (Constant)
  let offense = this.players[player];
  let next = parseInt(player) + 1;
  let getDefense = () => {
    if (next <= count) {
      return this.players[next.toString()]; // This is where it ended
    } else {
      return this.players['1'];
    }
  };
  let defense = getDefense();
  let max = defense.placement.length - 1;
  let target;
  if ((x > max || x < 0) || (y > max || y < 0)) {
    return ['Those coordinates could use some work. Try again.', 0];
  } else {
    target = defense.placement[y][x];
  }
  if (offense.plays[y][x] > 0) { // Check whether user has attacked this block
    return ['Already Taken. Try again.', 0];
  } else if (target === 0) {
    offense.plays[y][x] = 1; // The shot tracker uses a trinary marker
    return ['Miss.', 1];
  } else if (target > 0) {
    let ship = defense.fleet[target - 1];
    offense.plays[y][x] = 2; // 0 === Null; 1 === Miss; 2 === Hit
    ship[1] -= 1;
    if (ship[1] > 0) { // The oneth index is the ship's remaining hit points
      defense.placement[y][x] = '❌'; // Place damage on enemy hud
      return ['Hit! Good show!', 1];
    } else if (defense.fleet.filter(boat => boat[1] > 0).length > 0) { // Check if enemy has any ships left
      defense.placement[y][x] = '❌'; // Place damage on enemy hud
      offense.kills = defense.fleet.filter(boat => boat[1] === 0).length; // Update kill count
      return ['Sunk! Nice, it was a ' + ship[0] + '.', 1];
    } else { // If it equals zero, the ship is destroyed
      offense.kills = defense.fleet.filter(boat => boat[1] === 0).length;
      this.print(player); // Log final gameboard
      return ['Win! You\'ve destroyed the enemy\'s last ship, a ' +
        ship[0] + '.', 2]; // Return message
    }
  }
};

module.exports = (size, playerCount) => new Theater(size, playerCount);
