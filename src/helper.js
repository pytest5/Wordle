// STILL IN PROGRESS THIS IS TO ACCOUNT FOR DUPLICATED LETTERS

// A particular letter (e.g. 'N') will only 'light up' (be colored green or yellow) as many times as it is in the word.
// If you repeat a letter more times than it is contained in the word, and one of the repeated letters is in the correct position, that letter will always light up in green.
// If you repeat a letter more times than it is contained in the word, but none of the repeated letters is in the correct position, the first letter will light up in yellow.

const game = {
  answer: "banal",
  board: [["a", "l", "l", "o", "y"]],
  currentRowIndex: 0,
};
const userGuess = ["a", "l", "l", "o", "y"]; //  game.board[game.currentRowIndex]
// const userGuess = ["a", "n", "n", "a", "l"];
// const userGuess = ["u", "n", "i", "o", "n"];

export function evaluateUserGuess(userGuessArr) {
  // accepts user's current guess in the form of an usersGuessay
  function findDuplicateLetters(arg) {
    console.log(arg);
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
    console.log(idx);
    console.log(c);
    console.log(game.answer[idx]);
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
      console.log("EXISTS 0");
      return a.concat("exists");
    } else if (
      isCurrentGuessLetterDupe &&
      existsInAnswer(game.answer.split(""), c) &&
      existsMoreInGuessThanAnswer()
    ) {
      console.log("WRONG -1");
      return a.concat("wrong");
    } else if (
      isCurrentGuessLetterDupe &&
      game.answer.split("").includes(c) &&
      userGuessArr.slice(0, idx + 1).filter((i) => i === c).length < 2
    ) {
      console.log("EXISTS 3");
      return a.concat("exists");
    } else if (existsInAnswer(game.answer.split(""), c)) {
      console.log("EXISTS 4");
      return a.concat("exists");
    } else if (!existsInAnswer(game.answer.split(""), c)) {
      console.log("WRONG 2");
      return a.concat("wrong");
    } else {
      return a.concat("tbd");
    }
  }, []);

  return result;
}

console.log(
  evaluateUserGuess(userGuess),
  "guess:",
  `${userGuess}`,
  "//",
  "answer:",
  "banal"
);
// module.exports = { evaluateUserGuess };
