function Theater(n) {
  // this.board = this.nMatrix(n);
  this.fleet = this.setFleet(n);
  this.players = {
    one: {
      plays     : this.nMatrix(n),
      fleet     : this.fleet.slice(),
      placement : this.placeFleet(n, this.fleet)
    },
    two: {
      plays     : this.nMatrix(n),
      fleet     : this.fleet.slice(),
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
    } else if (position[2] === 0) {
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

let gameBoard = new Theater(10);
console.log(gameBoard.players.one.placement);
