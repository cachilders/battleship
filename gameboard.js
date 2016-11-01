function Theater(n) {
  this.fleet = this.setFleet(n);
  this.players = {
    one: {
      player    : 'One',
      plays     : this.nMatrix(n),
      kills     : 0,
      fleet     : this.setFleet(n),
      placement : this.placeFleet(n, this.fleet)
    },
    two: {
      player    : 'Two',
      plays     : this.nMatrix(n),
      kills     : 0,
      fleet     : this.setFleet(n),
      placement : this.placeFleet(n, this.fleet)
    }
  };
}

Theater.prototype.nMatrix = (n) => {
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

Theater.prototype.setFleet = function(n) {
  let budget = Math.ceil(n * .68);
  let ships = [
    ['submarine', 1],
    ['destroyer', 2],
    ['cruiser', 3],
    ['battleship', 4],
    ['carrier', 5]
  ];
  let fleet = () => {
    let dryDock = [];
    let i = 0;
    while (budget > 0) {
      if (i > 4) {
        i = 0;
      }
      dryDock.push(ships[i]);
      budget -= 1;
      i++;
    }
    return dryDock.sort((a, b) => {
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

Theater.prototype.placeFleet = function(n, fleet) {
  let field = this.nMatrix(n);
  let boats = fleet.slice();
  for (let i = 0; i < boats.length; i++) {
    let position = this.roll(0, n - 1); // [x, y, orientation]
    let size = boats[i][1];
    let navigator = [];
    if (field[position[1]][position[0]] > 0) {
      i--;
    } else if (position[2] === 0) { // orient horizontally if 0
      if (position[1] - size >= 0) {
        for (let j = size; j > 0; j--) {
          navigator.push([position[1] - j, position[0]]);
        }
        if (navigator.reduce((sum, val) => {
          return sum + field[val[1]][val[0]];
        }, 0) > 0) {
          i--;
        } else  {
          navigator.forEach(loc => field[loc[1]][loc[0]] = i + 1);
        }
      } else {
        i--;
      }
    } else {
      if (position[0] - size >= 0) {
        for (let j = size; j > 0; j--) {
          navigator.push([position[1], position[0] - j]);
        }
        if (navigator.reduce((sum, val) => {
          return sum + field[val[1]][val[0]];
        }, 0) > 0) {
          i--;
        } else  {
          navigator.forEach(loc => field[loc[1]][loc[0]] = i + 1);
        }
      } else {
        i--;
      }
    }
  }
  return field;
};

Theater.prototype.roll = function(min, max) {
  return [
    Math.floor(Math.random() * (max - min + 1)),
    Math.floor(Math.random() * (max - min + 1)),
    Math.floor(Math.random() * (1 - 0 + 1))
  ];
};

Theater.prototype.format = function(player) {
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

Theater.prototype.print = function(player) {
  let boards = this.format(this.players[player]);
  console.log(boards);
  // return boards;
};

Theater.prototype.fire = function(x, y, player) {
  let offense = this.players[player];
  let defense = this.players[player === 'one' ? 'two' : 'one'];
  let max = defense.placement.length - 1;
  let target;
  if ((x > max || x < 0) || (y > max || y < 0)) {
    return ['Those coordinates could use some work. Try again.', 0];
  } else {
    target = defense.placement[y][x];
  }
  if (offense.plays[y][x] > 0) {
    return ['Already Taken. Try again.', 0];
  } else if (target === 0) {
    offense.plays[y][x] = 1; // The shot tracker uses a trinary marker
    return ['Miss.', 1];
  } else if (target > 0) {
    let ship = defense.fleet[target - 1];
    offense.plays[y][x] = 2; // 0 === Null; 1 === Miss; 2 === Hit
    ship[1] -= 1;
    if (ship[1] > 0) {
      defense.placement[y][x] = '❌';
      return ['Hit! Good show!', 1];
    } else if (defense.fleet.filter(boat => boat[1] > 0).length > 0) {
      defense.placement[y][x] = '❌';
      offense.kills = defense.fleet.filter(boat => boat[1] === 0).length;
      return ['Sunk! Nice, it was a ' + ship[0] + '.', 1];
    } else {
      offense.kills = defense.fleet.filter(boat => boat[1] === 0).length;
      this.print(player);
      return ['Win! You\'ve destroyed the enemy\'s last ship, a ' +
        ship[0] + '.', 2];
    }
  }
};

module.exports = size => new Theater(size);
