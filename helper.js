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

    if (c === game.answer[idx]) {
      return a.concat("correct");
    } else if (
      isCurrentGuessLetterDupe &&
      game.answer.split("").includes(c) &&
      userGuessArr.slice(0, idx + 1).filter((i) => i === c).length < 2
    ) {
      return a.concat("exists");
    } else if (
      isCurrentGuessLetterDupe &&
      currentGuessLetterDupeCount >
        game.answer
          .split("")
          .reduce((acc, cur) => (cur === c ? acc.concat(cur) : acc), []).length
    ) {
      return a.concat("wrong");
    } else if (game.answer.split("").includes(c)) {
      return a.concat("exists");
    } else if (!game.answer.split("").includes(c)) {
      return a.concat("wrong");
    } else {
      return a.concat("tbd");
    }
  }, []);

  return result;
}

console.log(
  evaluateUserGuess(game.board[game.currentRowIndex]),
  "guess:",
  `${game.board[0]}`,
  "//",
  "answer:",
  "banal"
);

// module.exports = { evaluateUserGuess };
