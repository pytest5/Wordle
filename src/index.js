// const { evaluateUserGuess } = require("./helper.js");
// import { evaluateUserGuess } from "./helper.js";

/*-------------------------------- Constants --------------------------------*/
// const WORDS = {
//   fourLetters: ["glad", "joys", "glee", "hope", "love", "hugs", "play", "good"],
//   fiveLetters: [
//     "peace",
//     "happy",
//     "relax",
//     "stars",
//     "smile",
//     "laugh",
//     "cheer",
//     "merry",
//     "alloy",
//     "annal",
//     "annul",
//     "banal",
//   ],
//   sixLetters: ["joyful", "smiley", "gaiety", "blithe", "cheery", "jovial"],
// };

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

// function setGameStatus(status) {
//   if (status === "win") {
//     game.status = { win: true, lose: false, pending: false };
//   } else if (status === "lose") {
//     game.status = { win: false, lose: true, pending: false };
//   } else if (status === "pending") {
//     game.status = { win: false, lose: false, pending: true };
//   } else if (status === "error") {
//     game.status = { win: false, lose: false, pending: true, error: true };
//   }
// }

// function sliderInputHandler(e) {
//   console.log("slider input handler ran");
//   if (e.target.dataset.sliderType === "word-length") {
//     game.wordLength = +e.target.value;
//     renderDialog();
//   } else if (e.target.dataset.sliderType === "tries") {
//     game.maxTries = +e.target.value;
//     renderDialog();
//   }
// }

// function renderGameStatus() {
//   gameStatusEle.innerText = JSON.stringify(game, null, 1);
// }

function setInitialBoardState() {
  game.board = [];
  for (let i = 0; i < game.maxTries; i++) {
    game.board.push([]);
  }
  // console.log("setting initial board state...", game);
}

function renderTileContents() {
  const boardRowEles = document.querySelectorAll(".board-row");
  const currentBoardRow = boardRowEles[game.currentRowIndex];
  const currentRowTiles = Array.from(currentBoardRow.children);
  currentRowTiles.forEach(
    (i, idx) =>
      (i.value = game.board[game.currentRowIndex][idx]?.toUpperCase() || "")
  );
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
  console.log("running render initial board..");
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
  console.log("focusing first tile", currentRowTiles[0]);

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
  type === "delete" ? currentGuess.pop() : currentGuess.push(letter);
  game.board[game.currentRowIndex] = currentGuess;
}

function evaluateGuess(arr) {
  console.log("game.answer", game.answer);
  console.log(game);
  console.log(game.currentTries);
  console.log(game.maxTries);
  const evaluatedGuess = arr.reduce(
    (a, c, i) =>
      c === game.answer[i]
        ? a.concat("correct")
        : game.answer.includes(c)
        ? a.concat("exists")
        : a.concat("wrong"),
    []
  );

  game.evaluatedBoard.push(evaluatedGuess);
  if (
    evaluatedGuess.every((i) => i === "correct") &&
    game.currentTries <= game.maxTries
  ) {
    setTimeout(() => setShowDialog("victory"), 2000);
  } else if (game.currentTries === game.maxTries) {
    setShowDialog("defeat");
  }
  renderTileColors(evaluatedGuess);
  renderKeyBoardColors();
}

function renderKeyBoardColors() {
  console.log("rendering keyboard colors");
  const flattenedBoard = game.board.reduce((a, c) => a.concat(c), []);
  console.log({ flattenedBoard });
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
    console.log("hai", c, findPreviousEvaluatedResults(i, c));
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
  // const guessObj = flattenedBoard.reduce(
  //   (a, c, i) =>
  //     flattenedEvaluatedBoard[i] === "correct"
  //       ? a
  //       : { ...a, [c]: flattenedEvaluatedBoard[i] },
  //   {}
  // );
  // const guessObj = flattenedBoard.reduce(
  //   (a, c, i) => ({ ...a, [c]: flattenedEvaluatedBoard[i] }),
  //   {}
  // );
  const keyBoardKeys = document.querySelectorAll(".key");
  console.log({ guessObj });
  keyBoardKeys.forEach((i) => {
    if (Object.keys(guessObj).includes(i.innerText.toLowerCase())) {
      console.log(
        "adding ",
        guessObj[i.innerText.toLowerCase()],
        " to ",
        i.innerText
      );
      i.classList = `key ${guessObj[i.innerText.toLowerCase()]}`;
      // i.classList.add(guessObj[i.innerText.toLowerCase()]);
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
    console.log("NOT NOO");
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
  console.log(game);
}

// function focusNextTile(ele) {
//   if (!ele.value) return;
//   ele.nextElementSibling?.focus();
// }

function focusPreviousTile() {
  // TODO this needs improvement esp after closing modal...
  if (game.previousTiles.length < 2) return;
  game.previousTiles.at(-1).focus();
}

function checkGuessValidity(rowEle) {
  const currentGuessString = game.board[game.currentRowIndex].join("");
  console.log({ currentGuessString });
  if (game.board[game.currentRowIndex].length < game.wordLength) {
    game.isValidGuess = false;
    setShowDialog("insufficient");
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else if (!game.wordBank.includes(currentGuessString)) {
    game.isValidGuess = false;
    console.log("opps", currentGuessString);
    setShowDialog("invalid");
    // window.alert(`${currentGuessString} is not a word`); // check validity
    enableTiles(rowEle);
    focusPreviousTile();
    return;
  } else {
    console.log("Guess is valid!");
    disableTiles(rowEle);
    game.isValidGuess = true;
    console.log("Setting guess to valid", game.isValidGuess);
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
  console.log("running render initial board from word length event handler");
  renderInitialBoard();
}

function maxTriesEventHandler(val) {
  game.maxTries = +val;
  renderMaxTriesValue();
  renderDialog(game.dialog.state);
  console.log("running render initial board from max tries event handler");

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
        message: `The word ${game.currentGuess} is not in the dictionary. Please enter a valid word.`,
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
  if (game.dialog.state === "reset") {
    modalEle.close();
    game.currentRowIndex = 0;
    game.currentTries = 0;
    game.evaluatedBoard = [];
    renderInitialBoard();
    renderInitialKeyBoard();
    init();
  } else if (game.dialog.state === "victory") {
    modalEle.close();
    game.currentRowIndex = 0;
    game.currentTries = 0;
    game.evaluatedBoard = [];
    renderInitialBoard();
    renderInitialKeyBoard();
    init();
  } else if (game.dialog.state === "defeat") {
    modalEle.close();
    game.currentRowIndex = 0;
    game.currentTries = 0;
    game.evaluatedBoard = [];
    renderInitialBoard();
    renderInitialKeyBoard();
    init();
  } else if (game.dialog.state === "config") {
    modalEle.close();
    game.currentRowIndex = 0;
    game.currentTries = 0;
    game.evaluatedBoard = [];
    renderInitialBoard();
    renderInitialKeyBoard();
    init();
  } else if (
    game.dialog.state === "invalid" ||
    game.dialog.state === "insufficient"
  ) {
    modalEle.close();
  } else {
    console.log("modal action btn handler error");
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
      console.log("registering tile ele");
      tileEle.addEventListener("keydown", (e) => keyDownHandler(e, rowEle));
      tileEle.addEventListener("input", inputEventHandler);
      tileEle.addEventListener("keyup", keyUpHandler);
    })
  );
}

function backSpaceHandler(e) {
  if (e.repeat) {
    console.log("returning from backSpaceHandler");
    return;
  }
  if (e.key === "Backspace") {
    game.isBackSpace = true;
    setBoardState("delete");
    renderTileContents();
    console.log("exiting from backSpaceHandler");
  } else {
    game.isBackSpace = false;
    console.log("exiting from backSpaceHandler");
  }
  console.log("exiting from backSpaceHandler");
}

function enterKeyHandler(e, rowEle) {
  if (e.repeat || e.key !== "Enter") {
    console.log("exiting from enterKeyHandler");
    return;
  }

  checkGuessValidity(rowEle);
  console.log("exiting from enterKeyHandler");

  if (!game.isValidGuess) {
    console.log("exiting from enterKeyHandler");
    return;
  }
  updateTries();
  // evaluateGuess(game.board[game.currentRowIndex]);
  evaluateUserGuess(game.board[game.currentRowIndex]);
  console.log("exiting from enterKeyHandler");
  game.currentRowIndex++; //TODO put in func
  focusFirstTile();
  console.log("exiting from enterKeyHandler");
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
  e.target.nextElementSibling?.focus();
}

function inputEventHandler(e) {
  if (game.isBackSpace) {
    return;
  }
  if (game.board[game.currentRowIndex].length < game.wordLength + 1) {
    setBoardState("add", e.target.value);
    // e.target.nextElementSibling?.focus();
    renderTileContents();
    return;
  }
}

// TODO on window focus then focus last active
// disbale on focus next for non alphabets

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
  console.log(duplicatedLettersInUserGuessObj); // ['a','l','l','o','y'] ===> {l: 2}

  const duplicatedLettersInGameAnswerObj = findDuplicateLetters(
    game.answer.split("")
  );
  console.log(duplicatedLettersInGameAnswerObj); // 'banal' ====> {a :2}

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

  console.log(
    "HERE",
    isInAnyCorrectPosition(game.answer.split(""), userGuessArr, "n")
  );

  let hasAccountedForTwoDupeGuessLetterBothWrongPosition = false;

  const result = userGuessArr.reduce((a, c, idx) => {
    // GUESS alloy
    const isCurrentGuessLetterDupe = Object.keys(
      findDuplicateLetters(userGuessArr)
    ).includes(c);
    let currentGuessLetterDupeCount;
    if (isCurrentGuessLetterDupe) {
      currentGuessLetterDupeCount = duplicatedLettersInUserGuessObj[c];
    }
    // ANSWER banal
    const currentAnswerLetter = game.answer[idx];
    const isCurrentAnswerLetterDupe = Object.keys(
      findDuplicateLetters(game.answer.split(""))
    ).includes(game.answer.split("")[idx]);
    let currentAnswerLetterDupeCount;
    if (isCurrentAnswerLetterDupe) {
      currentAnswerLetterDupeCount =
        duplicatedLettersInGameAnswerObj[currentAnswerLetter];
    }

    ///

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
      // console.log("EXISTS 0");
      return a.concat("exists");
    } else if (
      isCurrentGuessLetterDupe &&
      existsInAnswer(game.answer.split(""), c) &&
      existsMoreInGuessThanAnswer()
    ) {
      // console.log("WRONG -1");
      return a.concat("wrong");
    } else if (
      isCurrentGuessLetterDupe &&
      game.answer.split("").includes(c) &&
      userGuessArr.slice(0, idx + 1).filter((i) => i === c).length < 2
    ) {
      // console.log("EXISTS 3");
      return a.concat("exists");
    } else if (existsInAnswer(game.answer.split(""), c)) {
      // console.log("EXISTS 4");
      return a.concat("exists");
    } else if (!existsInAnswer(game.answer.split(""), c)) {
      // console.log("WRONG 2");
      return a.concat("wrong");
    } else {
      return a.concat("tbd");
    }
  }, []);

  game.evaluatedBoard = [...game.evaluatedBoard, result];
  // game.evaluatedBoard.push(result);
  console.log("evaluatedBoard", game.evaluatedBoard);
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

function renderDialog2() {
  console.log("render Dialog");
  const modalMessageEle = document.querySelector(".modal-message");
  modalMessageEle.innerHTML = `<div class="slider-wrapper">
      <input type="range" min="4" max="6" value="${game.wordLength}" step="1" oninput="wordLengthEventHandler(this.value)"/>
      <span>${game.wordLength}</span>
    </div>`;
}

// Initial render
renderDialog2();
