/*-------------------------------- Constants --------------------------------*/
const WORDS = {
  fourLetters: ["like", "rest"],
  fiveLetters: ["happy", "relax", "stars", "smile", "skate"],
  sixLetters: ["clowns", "easier"],
};
/*---------------------------- Variables (state) ----------------------------*/

const game = {
  board: [],
  wordBank: [],
  answer: "",
  currentRowIndex: 0,
  currentGuess: [],
  currentTries: 0,
  isValidGuess: false,
  maxTries: 6,
  wordLength: 5,
  currentTile: null,
  previousTiles: [],
  isBackSpace: false,
};

/*------------------------ Cached Element References ------------------------*/
const gameStatusEle = document.querySelector(".gameStatus");
const tileEles = document.querySelectorAll(".tile");
const boardRowEles = document.querySelectorAll(".board-row");
const currentBoardRow = boardRowEles[game.currentRowIndex]; // TODO: check
const currentRowTiles = Array.from(currentBoardRow.children);
const nextBoardRow = boardRowEles[game.currentRowIndex + 1];
const nextRowTiles = Array.from(nextBoardRow.children);
/*---------------------------- Render Functions -----------------------------*/
function renderGameStatus() {
  gameStatusEle.innerText = JSON.stringify(game, null, 1);
}

function renderTileContents() {
  currentRowTiles.forEach(
    (i, idx) => (i.value = game.currentGuess[idx]?.toUpperCase() || "")
  );
}

function renderValidGuessRow(rowEle) {
  if (game.isValidGuess) {
    console.log("game is valid");
    rowEle.style.border = "3px solid blue";
  }
}

function renderTileColors(evaluatedGuess) {
  currentRowTiles.forEach((i, idx) => {
    console.log(i);
    i.classList.add(evaluatedGuess[idx]);
  });
}

function focusFirstTile() {
  currentRowTiles[0].focus();
}

function focusNextRowFirstTile() {
  nextRowTiles[0].focus();
}
/*-------------------------------- Functions --------------------------------*/

function evaluateGuess(arr) {
  console.log("game.answer", game.answer);
  const evaluatedGuess = arr.reduce(
    (a, c, i) =>
      c === game.answer[i]
        ? a.concat("correct")
        : game.answer.includes(c)
        ? a.concat("exists")
        : a.concat("wrong"),
    []
  );
  renderTileColors(evaluatedGuess);
}

function generateAnswer() {
  /* Generate an answer for the current game */
  const randomIdx = Math.floor(Math.random() * game.wordBank.length);
  console.log({ randomIdx });
  console.log("wordbank", game.wordBank);

  const randomAnswer = game.wordBank[randomIdx];
  game.answer = randomAnswer;
  console.log("generated answer", game.answer);
  return;
}

function cachePreviousTiles() {
  if (game.currentGuess.length < game.wordLength + 1) {
    game.previousTiles.push(document.activeElement);
    renderGameStatus();
  } else {
    console.log("Something went wrong");
  }
}

function generateWordBank(wordLength) {
  /* Generate a word bank (4 letters, 5 letters, 6 letters) based on user supplied word length */
  let key = "";
  switch (wordLength) {
    case 4:
      key = "fourLetters";
      break;
    case 5:
      key = "fiveLetters";
      break;
    case 6:
      key = "sixLetters";
      break;
    default:
      console.log("error");
  }
  game.wordBank = WORDS[key];
  return;
}

function clearCurrentGuess() {
  game.currentGuess = [];
}

function updateTries() {
  if (!game.isValidGuess) return;
  game.currentTries++;
}

function setNewRowState() {
  game.isValidGuess = false;
}

function disableTiles(rowEle) {
  // TODO: convert to MVC single source
  Array.from(rowEle.children).forEach((i) => (i.disabled = true));
}

function enableTiles(rowEle) {
  // TODO: convert to MVC single source
  Array.from(rowEle.children).forEach((i) => {
    i.disabled = false;
  });
}

// TODO: disable slider
function init() {
  focusFirstTile();
  generateWordBank(game.wordLength);
  generateAnswer(game.wordLength);
  renderGameStatus();
}

// function focusNextTile(ele) {
//   if (!ele.value) return;
//   ele.nextElementSibling?.focus();
// }

function focusPreviousTile() {
  // console.log("focusing previous tile...", game.previousTiles.at(-1));
  if (game.previousTiles.length < 2) return;
  game.previousTiles.at(-1).focus();
}

// TODO: debounce typing too fast, etc maybe disable shift focus if ele.innerText is empty !!!!!!!

// TODO: update current guess
function focusNextRow() {}

function checkGuessValidity(rowEle) {
  const currentGuessString = game.currentGuess.join("");
  if (game.currentGuess.length < game.wordLength) {
    game.isValidGuess = false;
    window.alert("Not enough letters");
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else if (!game.wordBank.includes(currentGuessString)) {
    game.isValidGuess = false;
    window.alert(`${currentGuessString} is not a word`); // check validity
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else {
    console.log("Guess is valid!");
    disableTiles(rowEle);
    game.isValidGuess = true;
    console.log("Setting guess to valid", game.isValidGuess);
    // setNewRowState();
  }
}
/*----------------------------- Event Listeners -----------------------------*/
// TODO. on init auto focus on first cell
// TODO solve bug when enter pressed too many times consecutively...

init();

//// NEW EVENT LISTENERS //////

boardRowEles.forEach((rowEle) =>
  // Array.from converts html collection to array
  Array.from(rowEle.children).forEach((tileEle) => {
    tileEle.addEventListener("keydown", (e) => keyDownHandler(e, rowEle));
    tileEle.addEventListener("input", inputEventHandler);
    tileEle.addEventListener("keyup", keyUpHandler);
  })
);

function backSpaceHandler(e) {
  if (e.key === "Backspace") {
    game.isBackSpace = true;
    game.currentGuess.pop();
    renderTileContents();
  } else {
    game.isBackSpace = false;
  }
}

function enterKeyHandler(e, rowEle) {
  if (e.key !== "Enter") return;
  console.log("enter key entered");
  checkGuessValidity(rowEle);
  if (!game.isValidGuess) return;
  evaluateGuess(game.currentGuess);
  // clearCurrentGuess();
  updateTries();
  renderGameStatus();
  // renderValidGuessRow(rowEle);
}

function keyDownHandler(e, rowEle) {
  if (e.repeat) {
    //TODO shift to keydown?
    // console.log("disabling repeating");
    return;
  }
  backSpaceHandler(e);
  enterKeyHandler(e, rowEle);
  cachePreviousTiles();
}

function inputEventHandler(e) {
  if (game.isBackSpace) {
    // console.log("input ran...");
    // console.log(game.currentGuess);
    return;
  }
  if (game.currentGuess.length < 5) {
    // console.log("input 2nd branch ran..");
    // console.log(
    //   "running for currentGuess length: ",
    //   game.currentGuess.length
    // );
    game.currentGuess.push(e.target.value);
    e.target.nextElementSibling?.focus();
    renderTileContents();
    renderGameStatus();
    // console.log("focusing after ", game.currentGuess);
    return;
  }
  // console.log("input error, isBackSpace:", game.isBackSpace);
}

function keyUpHandler(e) {
  if (e.key === "Backspace") {
    // console.log("keyup ran...");
    game.isBackSpace = true;
    e.target.previousElementSibling?.focus();
    return;
  } else {
    game.isBackSpace = false;
    return;
  }
}
