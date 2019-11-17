function Game() {
  turn = 0;
  gameStage = "draw";
  players = [
    { name: "Player One", points: 0 },
    { name: "Player Two", points: 0 }
  ];
  return {
    size: null,
    field: [],
    players: players,
    turn,
    gameStage
  };
}

function initGameData() {
  return new Game();
}

function initField(size) {
  for (let i = 1; i <= (size - 1) * (2 * size - 1) + size - 1; i++) {
    game.field[i] = 0;
  }
}

let game = initGameData();

function initGame() {
  let startScreenDiv = document.getElementById("choose-size-overlay");
  startScreenDiv.classList.remove("hidden");
  let sizeSubmitButton = document.getElementById("size-submit");
  document.getElementById("size").focus();
  sizeSubmitButton.addEventListener("click", function(event) {
    event.preventDefault();
    let size = document.getElementById("size").value;
    game.size = parseInt(size);
    initField(game.size);
    renderGrid();
    // renderGameInfo();
    listeners();
    startScreenDiv.classList.add("hidden");
  });
}

function lineLength() {
  let f = document.getElementById("field");
  let minSize = (Math.min(f.clientWidth, f.clientHeight) - 20) / game.size;
  return minSize;
}

function createLine(top, left, w, h) {
  let div = document.createElement("div");
  div.classList.add("line");
  div.style.top = top;
  div.style.left = left;
  div.style.width = w;
  div.style.height = h;
  return div;
}

function renderGrid() {
  let { size } = game;
  let field = document.getElementById("field");
  let w = lineLength();
  let lIndex = 1;
  for (let row = 0; row < size - 1; row++) {
    for (let column = 0; column < size - 1; column++) {
      let hLine = createLine(w * row, w * column, w, 10);
      hLine.dataset.lineNumber = row * (2 * size - 1) + column + 1;
      field.appendChild(hLine);
      let wLine = createLine(w * row, w * column, 10, w);
      wLine.dataset.lineNumber = row * (2 * size - 1) + size - 1 + column + 1;
      field.appendChild(wLine);
    }
    let wLineLast = createLine(w * row, w * (size - 1), 10, w);
    wLineLast.dataset.lineNumber = row * (2 * size - 1) + 2 * size - 1;
    lIndex++;
    field.appendChild(wLineLast);
  }
  for (let column = 0; column < size - 1; column++) {
    let hLineLast = createLine(w * (size - 1), w * column, w, 10);
    hLineLast.dataset.lineNumber = (size - 1) * (2 * size - 1) + column + 1;
    field.appendChild(hLineLast);
  }
}

function renderGameInfo() {
  document.getElementById("info").innerHTML = "";
  let plInfo = game.players.map((player, index) => {
    let activeIndicator = index == game.turn ? " < " : " ";
    let p1 = document.createElement("h2");
    let txtP1 = document.createTextNode(player.name + " ");
    let txtPS = document.createTextNode(player.points + activeIndicator);
    p1.appendChild(txtP1);
    p1.appendChild(txtPS);
    return p1;
  });
  plInfo.forEach(info => document.getElementById("info").appendChild(info));
}

function listeners() {
  let lines = document.getElementsByClassName("line");
  for (let i = 0; i < lines.length; i++) {
    lines[i].addEventListener("click", event => {
      if (game.field[+event.target.dataset.lineNumber] != 1) {
        game.field[+event.target.dataset.lineNumber] = 1;
        game.turn = +game.turn == 0 ? 1 : 0;
        event.target.classList.add("active");
        renderGameInfo();
        if (checkIfSquare() != -1) {
          console.log("there are squares");
          game.players[game.turn].points += checkIfSquare();
          let missingLinks = checkIfThree();
          console.log("missing links", missingLinks);
          while (checkIfThree() != 0) {
            console.log("field before", game.field);
            game.field[missingLinks[0]] = 1;
            console.log("field after", game.field);
            let points = checkIfSquare();
            game.players[game.turn].points += checkIfSquare();
            missingLinks = checkIfThree();
            debugger;
          }
          renderFieldByArray();
          renderGameInfo();
        }
      }
      if (didGameEnd()) {
        let winner =
          game.players[0].points > game.players[1].points
            ? game.players[0].name
            : game.players[1].name;
        document.body.innerHTML = "Game Ended" + "winner is" + winner;
      }
    });
  }
  debugger;
  renderGameInfo();
}

function checkIfSquare() {
  let field = game.field;
  let size = game.size;
  let a = 2 * size - 1;
  let answer = false;
  let squareAmount = game.players[0].points + game.players[1].points;
  let newSquareAmount = 0;
  for (let row = 0; row < size - 1; row++) {
    for (let column = 1; column < size; column++) {
      // console.log(
      //   "checkifSquare",
      //   field[a * row + column],
      //   field[a * (row + 1) + column],
      //   field[a * row + size - 1 + column],
      //   field[a * row + size + column]
      // );
      // console.log(
      //   "filter",
      //   [
      //     field[a * row + column],
      //     field[a * (row + 1) + column],
      //     field[a * row + size - 1 + column],
      //     field[a * row + size + column]
      //   ].filter(item => item == 1).length
      // );
      answer =
        [
          field[a * row + column],
          field[a * (row + 1) + column],
          field[a * row + size - 1 + column],
          field[a * row + size + column]
        ].filter(item => item == 1).length == 4
          ? true
          : answer;
      if (
        [
          field[a * row + column],
          field[a * (row + 1) + column],
          field[a * row + size - 1 + column],
          field[a * row + size + column]
        ].filter(item => item == 1).length == 4
      ) {
        newSquareAmount++;
      }
    }
  }
  console.log("square amount", squareAmount, newSquareAmount);
  if (newSquareAmount > squareAmount) {
    return newSquareAmount - squareAmount;
  } else {
    return -1;
  }
  console.log("answer", answer);
  return answer;
}

function checkIfThree() {
  let field = game.field;
  let size = game.size;
  let a = 2 * size - 1;
  let newSquareAmount = 0;
  let missingLinks = [];
  for (let row = 0; row < size - 1; row++) {
    for (let column = 1; column < size; column++) {
      let temp = [
        a * row + column,
        a * (row + 1) + column,
        a * row + size - 1 + column,
        a * row + size + column
      ].filter(item => field[item] == 0);
      console.log(
        "checkifthree",
        [
          a * row + column,
          a * (row + 1) + column,
          a * row + size - 1 + column,
          a * row + size + column
        ].filter(item => field[item] == 0)
      );

      if (temp.length == 1) {
        console.log("temp is", temp);
        missingLinks = missingLinks.concat(temp);
      }
    }
  }
  return missingLinks.length > 0 ? missingLinks : [];
}

function renderFieldByArray() {
  let lines = document.getElementsByClassName("line");
  for (let line = 0; line < lines.length; line++) {
    console.log("line for dataset", line);
    let lineNumber = lines[line].dataset.lineNumber;
    if (game.field[lineNumber] == 1) {
      lines[line].classList.remove("active");
      lines[line].classList.add("active");
    }
  }
}

function didGameEnd() {
  console.log("check", game.field.includes(0));
  return !game.field.includes(0);
}

initGame();
