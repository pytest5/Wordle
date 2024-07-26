import { WORDS } from "./prod-data.js";

const BOARD_ROW_ATTRIBUTES = {
  class: "board-row",
  "aria-label": "board row",
};

const TILE_ATTRIBUTES = {
  class: "tile",
  id: "tile",
  type: "text",
  name: "tile",
  maxlength: "1",
  "aria-label": "letter",
};

/*---------------------------- Variables (state) ----------------------------*/

const game = {
  answer: "",
  dialog: {
    state: "", // victory, reset, config, insufficient, invalid
    message: "",
    buttonMessage: "",
  },
  board: [],
  evaluatedBoard: [],
  wordBank: [],
  currentRowIndex: 0,
  currentTries: 0,
  isValidGuess: false,
  wordLength: 5,
  maxTries: 7,
  currentTile: null,
  previousTiles: [],
  isBackSpace: false,
};

// TODO slider for max tries and word length
// TODO responsive design mobile

/*------------------------ Cached Element References ------------------------*/

renderInitialBoard();
const gameStatusEle = document.querySelector(".gameStatus");
const tileEles = document.querySelectorAll(".tile");
const boardRowEles = document.querySelectorAll(".board-row");
const refreshBtnEle = document.querySelector(".refresh");
const modalEle = document.querySelector(".modal");
const modalCloseBtnEle = document.querySelector(".modal-close-btn");
const resetBtnEle = document.querySelector(".reset-btn");
const configBtnEle = document.querySelector(".config-btn");
/*---------------------------- Render Functions -----------------------------*/

function setInitialBoardState() {
  game.board = [];
  for (let i = 0; i < game.maxTries; i++) {
    game.board.push([]);
  }
}

function renderTileContents() {
  const boardRowEles = document.querySelectorAll(".board-row");
  const currentBoardRow = boardRowEles[game.currentRowIndex];
  const currentRowTiles = Array.from(currentBoardRow.children);
  currentRowTiles.forEach((i, idx) => {
    i.value = game.board[game.currentRowIndex][idx]?.toUpperCase() || "";
  });
}

function renderTileColors(evaluatedGuess) {
  const boardRowEles = document.querySelectorAll(".board-row");
  const currentBoardRow = boardRowEles[game.currentRowIndex];
  const currentRowTiles = Array.from(currentBoardRow.children);
  currentRowTiles.forEach((i, idx) =>
    i.classList.add(evaluatedGuess[idx], `flip-${idx}`)
  );
}

function renderInitialBoard() {
  function setRowAttr(ele, attrObj, i) {
    Object.entries(attrObj).forEach(([k, v]) => {
      k === "aria-label"
        ? ele.setAttribute(k, `${v} ${i + 1}`)
        : ele.setAttribute(k, v);
    });
  }

  function setTileAttr(ele, attrObj, i) {
    Object.entries(attrObj).forEach(([k, v]) => {
      k === "aria-label"
        ? ele.setAttribute(k, `${v} ${i + 1}`)
        : ["id", "text"].includes(k)
        ? ele.setAttribute(k, `${v}${i + 1}`)
        : ele.setAttribute(k, v);
    });
  }
  const boardContainer = document.querySelector(".board-container");
  boardContainer.innerHTML = "";
  for (let i = 0; i < game.maxTries; i++) {
    const rowEle = document.createElement("div");
    setRowAttr(rowEle, BOARD_ROW_ATTRIBUTES, i);
    boardContainer.appendChild(rowEle);
  }
  const boardRowEles = document.querySelectorAll(".board-row");
  boardRowEles.forEach((rowEle) => {
    for (let i = 0; i < game.wordLength; i++) {
      const tileEle = document.createElement("input");
      setTileAttr(tileEle, TILE_ATTRIBUTES, i);
      rowEle.append(tileEle);
    }
  });
}

function focusFirstTile() {
  const boardRowEles = document.querySelectorAll(".board-row");
  const currentBoardRow = boardRowEles[game.currentRowIndex]; // TODO: check
  const currentRowTiles = Array.from(currentBoardRow?.children);
  currentRowTiles[0].focus();
}

/*-------------------------------- Functions --------------------------------*/

function setBoardState(type, letter) {
  if (!type)
    throw new Error(
      "Error in setBoardState: 'type' is undefined. Expected 'delete' or 'add'"
    );
  if (type === "add" && !letter)
    throw new Error(
      "Error in setBoardState: 'letter' is undefined. Expected a letter or 'e.target.value' when type is 'add'"
    );
  let currentGuess = game.board[game.currentRowIndex];
  if (type === "delete") {
    currentGuess.pop();
  } else if (type === "add") {
    currentGuess.push(letter);
  } else {
    console.log("set board state error");
  }

  game.board[game.currentRowIndex] = currentGuess;
}

// function evaluateGuess(arr) {
//   console.log("game.answer", game.answer);
//   const evaluatedGuess = arr.reduce(
//     (a, c, i) =>
//       c === game.answer[i]
//         ? a.concat("correct")
//         : game.answer.includes(c)
//         ? a.concat("exists")
//         : a.concat("wrong"),
//     []
//   );

//   game.evaluatedBoard.push(evaluatedGuess);
//   if (
//     evaluatedGuess.every((i) => i === "correct") &&
//     game.currentTries <= game.maxTries
//   ) {
//     setTimeout(() => setShowDialog("victory"), 2000);
//   } else if (game.currentTries === game.maxTries) {
//     setShowDialog("defeat");
//   }
//   renderTileColors(evaluatedGuess);
//   renderKeyBoardColors();
// }

function renderKeyBoardColors() {
  const flattenedBoard = game.board.reduce((a, c) => a.concat(c), []);
  const flattenedEvaluatedBoard = game.evaluatedBoard.reduce(
    (a, c) => a.concat(c),
    []
  );

  function findPreviousEvaluatedResults(idx, cur) {
    const prevEvaluations = flattenedEvaluatedBoard.slice(0, idx); // [wrong,exists,wrong,correct]
    const prevBoard = flattenedBoard.slice(0, idx); // [h,a,p,p]
    return prevBoard.reduce(
      (a, c, i) => (c === cur ? a.concat(prevEvaluations[i]) : a),
      // (a, c, i) => a.concat(c === cur ? prevEvaluations[i] : []),
      []
    );
  }

  const guessObj = flattenedBoard.reduce((a, c, i) => {
    if (
      flattenedEvaluatedBoard[i] !== "correct" &&
      flattenedBoard.slice(0, i).includes(c) &&
      findPreviousEvaluatedResults(i, c).includes("correct")
      // flattenedEvaluatedBoard[flattenedBoard.slice(0, i).indexOf(c)] ===
      //   "correct"
    ) {
      return { ...a, [c]: "correct" };
    } else if (
      flattenedEvaluatedBoard[i] === "correct" &&
      flattenedBoard.slice(0, i).includes(c) &&
      findPreviousEvaluatedResults(i, c).includes("exists")
      // flattenedEvaluatedBoard[flattenedBoard.slice(0, i).indexOf(c)] ===
      //   "exists"
    ) {
      return { ...a, [c]: "correct" };
    } else if (
      flattenedEvaluatedBoard[i] !== "correct" &&
      flattenedBoard.slice(0, i).includes(c) &&
      findPreviousEvaluatedResults(i, c).includes("exists")
      // flattenedEvaluatedBoard[flattenedBoard.slice(0, i).indexOf(c)] ===
      //   "exists"
    ) {
      return { ...a, [c]: "exists" };
    } else {
      return { ...a, [c]: flattenedEvaluatedBoard[i] };
    }
  }, {});
  const keyBoardKeys = document.querySelectorAll(".key");
  keyBoardKeys.forEach((i) => {
    if (Object.keys(guessObj).includes(i.innerText.toLowerCase())) {
      i.classList = `key ${guessObj[i.innerText.toLowerCase()]}`;
    } else {
      return;
    }
  });
}

function generateAnswer() {
  const randomIdx = Math.floor(Math.random() * game.wordBank.length);
  const randomAnswer = game.wordBank[randomIdx];
  game.answer = randomAnswer;
  return;
}

function cachePreviousTiles() {
  if (game.board[game.currentRowIndex].length < game.wordLength + 1) {
    game.previousTiles.push(document.activeElement);
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

function updateTries() {
  if (!game.isValidGuess) {
    return;
  }
  game.currentTries += 1;
}

function disableTiles(rowEle) {
  // TODO: convert to MVC single source?
  Array.from(rowEle.children).forEach((i) => (i.disabled = true));
}

function enableTiles(rowEle) {
  // TODO: convert to MVC single source?
  Array.from(rowEle.children).forEach((i) => {
    i.disabled = false;
  });
}

// TODO: disable slider when game in progress?
function init() {
  setInitialBoardState();
  registerTileEventListeners();
  generateWordBank(game.wordLength);
  generateAnswer(game.wordLength);
  focusFirstTile();
  // console.log(game);
}

function focusPreviousTile() {
  // TODO this needs improvement esp after closing modal...
  const lastActiveTile = game.previousTiles.at(-1);
  if (lastActiveTile) {
    lastActiveTile.focus();
  }
}

function checkGuessValidity(rowEle) {
  const currentGuessString = game.board[game.currentRowIndex].join("");
  if (game.board[game.currentRowIndex].length < game.wordLength) {
    game.isValidGuess = false;
    setShowDialog("insufficient");
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else if (!game.wordBank.includes(currentGuessString)) {
    game.isValidGuess = false;
    setShowDialog("invalid");
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else {
    disableTiles(rowEle);
    game.isValidGuess = true;
  }
}
/*----------------------------- Event Listeners -----------------------------*/

// attach functions to global scope, which is the windows object
window.wordLengthEventHandler = wordLengthEventHandler;
window.maxTriesEventHandler = maxTriesEventHandler;

document.querySelectorAll(".key").forEach((i) =>
  i.addEventListener("click", (e) => {
    if (i.dataset.value === "ENTER") {
      enterKeyHandler({ key: "Enter" }, boardRowEles[game.currentRowIndex]); // e , currentRowEle
    } else if (i.dataset.value === "BACKSPACE") {
      backSpaceHandler({ key: "Backspace" });
    } else {
      setBoardState("add", i.dataset.value);
    }
    renderTileContents();
  })
);

function wordLengthEventHandler(val) {
  game.wordLength = +val;
  renderWordLengthValue();
  renderDialog(game.dialog.state);
  renderInitialBoard();
}

function maxTriesEventHandler(val) {
  game.maxTries = +val;
  renderMaxTriesValue();
  renderDialog(game.dialog.state);
  renderInitialBoard();
}

function renderWordLengthValue() {
  const sliderValueEle = document.querySelector(".slider-word-length-value");
  sliderValueEle.innerText = game.wordLength;
}

function renderMaxTriesValue() {
  const sliderValueEle = document.querySelector(".slider-tries-value");
  sliderValueEle.innerText = game.maxTries;
}

function setShowDialog(state) {
  const modalActionBtnEle = document.querySelector(".modal-action-btn");
  switch (state) {
    case "victory":
      game.dialog = {
        state: "victory",
        header: "You win!",
        message: `Awesome job! The word is "${game.answer}". Enjoy your victory!`,
        buttonMessage: "Try another word",
      };
      renderDialog("victory");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "defeat":
      game.dialog = {
        state: "defeat",
        header: "Out of Attempts",
        message: `Sorry, you ran out of tries. The word was "${game.answer}". Better luck next time!`,
        buttonMessage: "Try again",
      };
      renderDialog("victory");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "reset":
      game.dialog = {
        state: "reset",
        header: "Reset Game?",
        message: "Do you want to reset the game?",
        buttonMessage: "Reset",
      };
      renderDialog("reset");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "config":
      game.dialog = {
        state: "config",
        header: "Configure Game",
        message: "Configuring game settings.",
        buttonMessage: "Save Settings",
      };
      renderDialog("config");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "insufficient":
      game.dialog = {
        state: "insufficient",
        header: "Incomplete Word",
        message:
          "You need more letters to complete the word. Please try again.",
        buttonMessage: "Ok",
      };
      renderDialog("insufficient");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "invalid":
      game.dialog = {
        state: "invalid",
        header: "Word not recognized",
        message: `The word "${game.board[game.currentRowIndex].join(
          ""
        )}" is not in the dictionary. Please enter a valid word.`,
        buttonMessage: "Ok",
      };
      renderDialog("invalid");
      modalActionBtnEle.addEventListener("click", dialogActionHandler);
      modalEle.showModal();
      break;
    case "false":
      game.dialog = {
        state: "",
        message: "",
        buttonMessage: "",
      };
      modalEle.close();
      break;
  }
}
wordLengthEventHandler;

function renderDialog() {
  const modalHeaderEle = document.querySelector(".modal-header");
  const modalMessageEle = document.querySelector(".modal-message");
  const modalActionBtnEle = document.querySelector(".modal-action-btn");
  if (game.dialog.state === "config") {
    modalHeaderEle.innerHTML = `<h1 class="modal-header">Configure game</h1>`;
    modalMessageEle.innerHTML = `<div class="slider-wrapper">
        <div class="slider">
          <label class="slider-label">Word length:&nbsp;</label>
          <input data-slider-type='word-length' class="slider-input" type="range" min="4" max="6" value="${game.wordLength}" step="1" oninput="wordLengthEventHandler(this.value)"
  onchange="wordLengthEventHandler(this.value)"/>
          <span class="slider-word-length-value value">${game.wordLength}</span>
        </div>
        <div class="slider">
          <label class="slider-label">Tries:&nbsp;</label>
          <input data-slider-type="tries" class="slider-input" type="range" min="4" max="7" value="${game.maxTries}" step="1" oninput="maxTriesEventHandler(this.value)"
  onchange="maxTriesEventHandler(this.value)"/>
          <span class="slider-tries-value value">${game.maxTries}</span>
        </div>
      </div>`;
    modalActionBtnEle.innerText = game.dialog.buttonMessage;
    return;
  }
  modalHeaderEle.innerText = game.dialog.header;
  modalMessageEle.innerText = game.dialog.message;
  modalActionBtnEle.innerText = game.dialog.buttonMessage;
}

function renderInitialKeyBoard() {
  const keyBoardKeys = document.querySelectorAll(".key");
  keyBoardKeys.forEach((i) => (i.classList = "key"));
}

function dialogActionHandler() {
  if (game.dialog.state === "invalid" || game.dialog.state === "insufficient") {
    modalEle.close();
    focusPreviousTile();
  } else {
    modalEle.close();
    game.currentRowIndex = 0;
    game.currentTries = 0;
    game.evaluatedBoard = [];
    renderInitialBoard();
    renderInitialKeyBoard();
    init();
  }
}

resetBtnEle.addEventListener("click", (e) => {
  setShowDialog("reset");
});

configBtnEle.addEventListener("click", (e) => {
  setShowDialog("config");
});

modalCloseBtnEle.addEventListener("click", (e) => {
  modalEle.close();
});

function registerTileEventListeners() {
  const boardRowEles = document.querySelectorAll(".board-row");
  boardRowEles.forEach((rowEle) =>
    // converts html collection to array
    Array.from(rowEle.children).forEach((tileEle) => {
      tileEle.addEventListener("keydown", (e) => keyDownHandler(e, rowEle));
      tileEle.addEventListener("input", inputEventHandler);
      tileEle.addEventListener("keyup", keyUpHandler);
    })
  );
}

function backSpaceHandler(e) {
  if (e.repeat) {
    return;
  }
  if (e.key === "Backspace") {
    game.isBackSpace = true;
    setBoardState("delete");
    renderTileContents();
  } else {
    game.isBackSpace = false;
  }
}

function enterKeyHandler(e, rowEle) {
  if (e.repeat || e.key !== "Enter") {
    return;
  }

  checkGuessValidity(rowEle);

  if (!game.isValidGuess) {
    return;
  }
  updateTries();
  // evaluateGuess(game.board[game.currentRowIndex]);
  evaluateUserGuess(game.board[game.currentRowIndex]);
  game.currentRowIndex++; //TODO put in func
  focusFirstTile();
}

function keyDownHandler(e, rowEle) {
  if (e.key === "Backspace") {
    backSpaceHandler(e);
    return;
  }
  if (e.key === "Enter") {
    enterKeyHandler(e, rowEle);
    return;
  }

  const input = String.fromCharCode(e.keyCode);
  if (!/^[a-zA-Z]*$/.test(input)) {
    /* https://stackoverflow.com/questions/2257070/detect-numbers-or-letters-with-jquery-javascript */
    return;
  }
  game.isBackSpace = false;
  cachePreviousTiles();
  if (e.target.nextElementSibling) {
    e.target.nextElementSibling.focus();
  } else {
    e.target.focus();
  }
}

function inputEventHandler(e) {
  if (game.isBackSpace) {
    return;
  }
  if (game.board[game.currentRowIndex].length < game.wordLength) {
    setBoardState("add", e.target.value);
    // e.target.nextElementSibling?.focus();
    renderTileContents();
    return;
  } else if (e.target.maxLength === e.target.value.length) {
    console.log("max length reached");
  }
}

// TODO on window focus then focus last active and disbale on focus next for non alphabets

function keyUpHandler(e) {
  if (e.key === "Backspace") {
    game.isBackSpace = true;
    e.target.previousElementSibling.focus();
    return;
  } else {
    game.isBackSpace = false;
    return;
  }
}

function evaluateUserGuess(userGuessArr) {
  // accepts user's current guess in the form of an usersGuessay
  function findDuplicateLetters(arg) {
    return arg.reduce(
      (a, c) =>
        arg.filter((i) => i === c).length > 1
          ? {
              ...a,
              [c]: arg.filter((i) => i === c).length,
            }
          : a,
      {}
    );
  }

  const duplicatedLettersInUserGuessObj = findDuplicateLetters(userGuessArr);

  const duplicatedLettersInGameAnswerObj = findDuplicateLetters(
    game.answer.split("")
  );

  function isInAnyCorrectPosition(firstArr, secondArr, letter) {
    const indexOfLetterInFirstArr = firstArr.reduce(
      (a, c, idx) => (letter === c ? a.concat(idx) : a),
      []
    );
    const indexOfLetterInSecondArr = secondArr.reduce(
      (a, c, idx) => (letter === c ? a.concat(idx) : a),
      []
    );
    return (
      indexOfLetterInFirstArr.filter((i) =>
        indexOfLetterInSecondArr.includes(i)
      ).length > 0
    );
  }

  function existsInAnswer(arr, letter) {
    return arr.includes(letter);
  }

  let hasAccountedForTwoDupeGuessLetterBothWrongPosition = false;

  const result = userGuessArr.reduce((a, c, idx) => {
    const isCurrentGuessLetterDupe = Object.keys(
      findDuplicateLetters(userGuessArr)
    ).includes(c);
    let currentGuessLetterDupeCount;
    if (isCurrentGuessLetterDupe) {
      currentGuessLetterDupeCount = duplicatedLettersInUserGuessObj[c];
    }
    const currentAnswerLetter = game.answer[idx];
    const isCurrentAnswerLetterDupe = Object.keys(
      findDuplicateLetters(game.answer.split(""))
    ).includes(game.answer.split("")[idx]);
    let currentAnswerLetterDupeCount;
    if (isCurrentAnswerLetterDupe) {
      currentAnswerLetterDupeCount =
        duplicatedLettersInGameAnswerObj[currentAnswerLetter];
    }
    function existsMoreInGuessThanAnswer() {
      return (
        currentGuessLetterDupeCount >
        game.answer
          .split("")
          .reduce((acc, cur) => (cur === c ? acc.concat(cur) : acc), []).length
      );
    }

    if (c === game.answer[idx]) {
      return a.concat("correct");
    } else if (
      !hasAccountedForTwoDupeGuessLetterBothWrongPosition &&
      isCurrentGuessLetterDupe &&
      !isInAnyCorrectPosition(game.answer.split(""), userGuessArr, c) &&
      existsInAnswer(game.answer.split(""), c)
    ) {
      hasAccountedForTwoDupeGuessLetterBothWrongPosition = true;
      return a.concat("exists");
    } else if (
      isCurrentGuessLetterDupe &&
      existsInAnswer(game.answer.split(""), c) &&
      existsMoreInGuessThanAnswer()
    ) {
      return a.concat("wrong");
    } else if (
      isCurrentGuessLetterDupe &&
      game.answer.split("").includes(c) &&
      userGuessArr.slice(0, idx + 1).filter((i) => i === c).length < 2
    ) {
      return a.concat("exists");
    } else if (existsInAnswer(game.answer.split(""), c)) {
      return a.concat("exists");
    } else if (!existsInAnswer(game.answer.split(""), c)) {
      return a.concat("wrong");
    } else {
      return a.concat("tbd");
    }
  }, []);

  game.evaluatedBoard = [...game.evaluatedBoard, result];
  if (
    result.every((i) => i === "correct") &&
    game.currentTries <= game.maxTries
  ) {
    setTimeout(() => setShowDialog("victory"), 2000);
  } else if (game.currentTries === game.maxTries) {
    setTimeout(() => setShowDialog("defeat"), 2000);
  }
  renderTileColors(result);
  renderKeyBoardColors();

  return result;
}

init();
