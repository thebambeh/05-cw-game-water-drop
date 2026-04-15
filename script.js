const questions = [
  {
    question: "How many people worldwide still lack access to clean water?",
    options: ["100 million", "340 million", "703 million", "1 billion"],
    correctIndex: 2,
    fact: "Around 703 million people still lack access to clean water. That is nearly 1 in 10 people worldwide."
  },
  {
    question: "How far do women and children in some communities walk each day to collect water?",
    options: ["1 mile", "2 miles", "3.7 miles", "8 miles"],
    correctIndex: 2,
    fact: "In many communities, women and children walk about 3.7 miles each day just to collect water."
  },
  {
    question: "What percentage of public donations to charity: water funds water projects directly?",
    options: ["75%", "85%", "95%", "100%"],
    correctIndex: 3,
    fact: "100% of public donations fund clean water projects. Separate private donors cover operating costs."
  },
  {
    question: "What can improve when a community gets clean water?",
    options: [
      "Health",
      "School attendance",
      "Time for work and opportunity",
      "All of the above"
    ],
    correctIndex: 3,
    fact: "Clean water supports health, education, and economic opportunity. It can change a whole community."
  }
];

const winningMessages = [
  "You crushed that round and protected a lot of clean water.",
  "Strong round. Your Water Warrior instincts are looking dangerous.",
  "Nice work. You kept contamination down and stacked clean water points.",
  "That was a win. Fast clicks and clean awareness."
];

const losingMessages = [
  "Close one. You still raised awareness, now go run it back.",
  "Not quite enough that round, but the mission is not over yet.",
  "You missed the target this time. Try again and protect more clean drops.",
  "Rough round, but you can bounce back fast."
];

const finalWinningMessages = [
  "Mission complete. You turned knowledge into action and made a strong impact.",
  "Big finish. That felt like a real Water Warriors run.",
  "You did serious work here. Clean water awareness and solid gameplay."
];

const finalLosingMessages = [
  "You made progress, even if the score was lighter than you wanted.",
  "Mission ended, but you still learned real facts about the global water crisis.",
  "Not your highest run, though the awareness part still matters."
];

const screens = {
  menu: document.getElementById("menu-screen"),
  trivia: document.getElementById("trivia-screen"),
  game: document.getElementById("game-screen"),
  results: document.getElementById("results-screen")
};

const difficultySelect = document.getElementById("difficulty-select");

const startMissionBtn = document.getElementById("start-mission-btn");
const answerButtons = document.getElementById("answer-buttons");
const questionText = document.getElementById("question-text");
const questionCounter = document.getElementById("question-counter");
const progressFill = document.getElementById("progress-fill");
const factBox = document.getElementById("fact-box");

const topScore = document.getElementById("top-score");
const topPeople = document.getElementById("top-people");

const gameContainer = document.getElementById("game-container");
const gameScore = document.getElementById("game-score");
const gamePeople = document.getElementById("game-people");
const timeDisplay = document.getElementById("time");
const resetRoundBtn = document.getElementById("reset-round-btn");

const roundOverlay = document.getElementById("round-overlay");
const roundTitle = document.getElementById("round-title");
const roundMessage = document.getElementById("round-message");
const continueBtn = document.getElementById("continue-btn");

const finalScore = document.getElementById("final-score");
const finalPeople = document.getElementById("final-people");
const finalUnlocked = document.getElementById("final-unlocked");
const finalMessageBox = document.getElementById("final-message-box");
const playAgainBtn = document.getElementById("play-again-btn");
const shareBtn = document.getElementById("share-btn");

const state = {
  currentQuestionIndex: 0,
  totalScore: 0,
  totalPeopleHelped: 0,
  minigamesUnlocked: 0,
  roundScore: 0,
  timeLeft: 30,
  gameRunning: false,
  answeredCorrectly: false,
  roundComplete: false,
  timerInterval: null,
  dropInterval: null,
  difficulty: "normal"
};

const sfx = {
  good: new Audio("sounds/collectWater.mp3"),
  bad: new Audio("sounds/contaminatedWater.mp3"),
  win: new Audio("sounds/winnerCollectWater.mp3"),
  lose: new Audio("sounds/loserCollectWater.mp3"),
  correct: new Audio("sounds/correctQuizAnswer.mp3"),
  wrong: new Audio("sounds/wrongQuizAnswer.mp3")
};

startMissionBtn.addEventListener("click", startMission);
resetRoundBtn.addEventListener("click", resetCurrentRound);
continueBtn.addEventListener("click", continueAfterRound);
playAgainBtn.addEventListener("click", resetWholeGame);
shareBtn.addEventListener("click", copyShareText);

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  screens[screenName].classList.remove("hidden");
  screens[screenName].classList.add("active");
}

function startMission() {
  state.currentQuestionIndex = 0;
  state.totalScore = 0;
  state.totalPeopleHelped = 0;
  state.minigamesUnlocked = 0;
  state.difficulty = difficultySelect ? difficultySelect.value : "normal";

  updateTopStats();
  renderQuestion();
  showScreen("trivia");
}

function updateTopStats() {
  topScore.textContent = state.totalScore;
  topPeople.textContent = state.totalPeopleHelped;
}

function renderQuestion() {
  const currentQuestion = questions[state.currentQuestionIndex];

  questionCounter.textContent = `Question ${state.currentQuestionIndex + 1} of ${questions.length}`;
  progressFill.style.width = `${((state.currentQuestionIndex + 1) / questions.length) * 100}%`;
  questionText.textContent = currentQuestion.question;

  factBox.classList.add("hidden");
  factBox.textContent = "";
  answerButtons.innerHTML = "";

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.addEventListener("click", () => handleAnswer(index));
    answerButtons.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {
  const currentQuestion = questions[state.currentQuestionIndex];
  const buttons = [...document.querySelectorAll(".answer-btn")];
  const isCorrect = selectedIndex === currentQuestion.correctIndex;

  buttons.forEach((button, index) => {
    button.classList.add("disabled");

    if (index === currentQuestion.correctIndex) {
      button.classList.add("correct");
    }

    if (index === selectedIndex && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  factBox.classList.remove("hidden");

  if (isCorrect) {
    playSound(sfx.correct);

    state.totalScore += 10;
    state.minigamesUnlocked += 1;
    state.answeredCorrectly = true;
    updateTopStats();

    factBox.innerHTML = `<strong>Correct.</strong> ${currentQuestion.fact}<br><br><strong>Minigame unlocked. Get ready.</strong>`;

    setTimeout(() => {
      startRound();
    }, 1800);
  } else {
    playSound(sfx.wrong);

    state.answeredCorrectly = false;
    factBox.innerHTML = `<strong>Not quite.</strong> ${currentQuestion.fact}<br><br>You will move on to the next question.`;

    setTimeout(() => {
      moveToNextQuestion();
    }, 2200);
  }
}

function startRound() {
  showScreen("game");
  clearGameLoops();

  state.roundScore = 0;
  state.gameRunning = true;
  state.roundComplete = false;

  if (state.difficulty === "easy") {
    state.timeLeft = 35;
  } else if (state.difficulty === "hard") {
    state.timeLeft = 20;
  } else {
    state.timeLeft = 30;
  }

  gameContainer.innerHTML = "";
  gameScore.textContent = state.totalScore;
  gamePeople.textContent = state.totalPeopleHelped;
  timeDisplay.textContent = state.timeLeft;

  roundOverlay.classList.add("hidden");

  state.timerInterval = setInterval(updateTimer, 1000);
  state.dropInterval = setInterval(createDrop, getSpawnRate());
}

function getSpawnRate() {
  if (state.difficulty === "easy") {
    return 750;
  }

  if (state.difficulty === "hard") {
    return 350;
  }

  return 550;
}

function getFallDuration() {
  if (state.difficulty === "easy") {
    return 4;
  }

  if (state.difficulty === "hard") {
    return 2.2;
  }

  return 3;
}

function getRoundWinTarget() {
  if (state.difficulty === "easy") {
    return 15;
  }

  if (state.difficulty === "hard") {
    return 25;
  }

  return 20;
}

function updateTimer() {
  state.timeLeft -= 1;
  timeDisplay.textContent = state.timeLeft;

  if (state.timeLeft <= 0) {
    finishRound();
  }
}

function createDrop() {
  if (!state.gameRunning) {
    return;
  }

  const drop = document.createElement("div");
  const isGood = Math.random() > 0.28;
  const dropType = isGood ? "good" : "bad";
  const dropSize = Math.floor(Math.random() * 28) + 46;
  const containerWidth = gameContainer.clientWidth;
  const leftPosition = Math.random() * (containerWidth - dropSize);

  drop.className = `water-drop ${dropType}`;
  drop.style.width = `${dropSize}px`;
  drop.style.height = `${dropSize}px`;
  drop.style.left = `${leftPosition}px`;
  drop.style.animationDuration = `${getFallDuration()}s`;
  drop.textContent = isGood ? "💧" : "☠";

  drop.dataset.clicked = "false";
  drop.dataset.type = dropType;

  drop.addEventListener("click", () => handleDropClick(drop));
  drop.addEventListener("animationend", () => {
    if (drop.dataset.clicked === "false") {
      drop.remove();
    }
  });

  gameContainer.appendChild(drop);
}

function handleDropClick(drop) {
  if (!state.gameRunning || drop.dataset.clicked === "true") {
    return;
  }

  drop.dataset.clicked = "true";

  const isGood = drop.dataset.type === "good";
  const points = isGood ? 1 : -2;

  if (isGood) {
    playSound(sfx.good);
  } else {
    playSound(sfx.bad);
  }

  state.totalScore = Math.max(0, state.totalScore + points);
  state.roundScore += points;

  if (state.roundScore < 0) {
    state.roundScore = 0;
  }

  state.totalPeopleHelped = Math.max(0, Math.floor(state.totalScore / 5));

  updateTopStats();
  gameScore.textContent = state.totalScore;
  gamePeople.textContent = state.totalPeopleHelped;

  createFloatingText(drop, points);
  drop.remove();
}

function createFloatingText(drop, points) {
  const text = document.createElement("div");
  text.className = `float-text ${points > 0 ? "plus" : "minus"}`;
  text.textContent = points > 0 ? `+${points}` : `${points}`;

  const dropRect = drop.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  text.style.left = `${dropRect.left - containerRect.left + 10}px`;
  text.style.top = `${dropRect.top - containerRect.top}px`;

  gameContainer.appendChild(text);

  setTimeout(() => {
    text.remove();
  }, 800);
}

function finishRound() {
  if (!state.gameRunning) {
    return;
  }

  state.gameRunning = false;
  state.roundComplete = true;
  clearGameLoops();

  [...document.querySelectorAll(".water-drop")].forEach((drop) => drop.remove());

  const roundWinTarget = getRoundWinTarget();
  const didWinRound = state.roundScore >= roundWinTarget;
  const message = didWinRound
    ? getRandomMessage(winningMessages)
    : getRandomMessage(losingMessages);

  roundTitle.textContent = didWinRound ? "Round Won" : "Round Complete";
  roundMessage.textContent = `${message} You scored ${state.roundScore} point${state.roundScore === 1 ? "" : "s"} in this round. Target score: ${roundWinTarget}.`;

  roundOverlay.classList.remove("hidden");

  if (didWinRound) {
    playSound(sfx.win);
    launchConfetti();
  } else {
    playSound(sfx.lose);
  }
}

function continueAfterRound() {
  roundOverlay.classList.add("hidden");
  moveToNextQuestion();
}

function moveToNextQuestion() {
  if (state.currentQuestionIndex < questions.length - 1) {
    state.currentQuestionIndex += 1;
    renderQuestion();
    showScreen("trivia");
  } else {
    showFinalResults();
  }
}

function showFinalResults() {
  showScreen("results");

  finalScore.textContent = state.totalScore;
  finalPeople.textContent = state.totalPeopleHelped;
  finalUnlocked.textContent = state.minigamesUnlocked;

  const wonOverall = state.totalScore >= 60;
  const finalMessage = wonOverall
    ? getRandomMessage(finalWinningMessages)
    : getRandomMessage(finalLosingMessages);

  finalMessageBox.textContent = finalMessage;

  if (wonOverall) {
    launchConfetti();
  }
}

function clearGameLoops() {
  clearInterval(state.timerInterval);
  clearInterval(state.dropInterval);
  state.timerInterval = null;
  state.dropInterval = null;
}

function resetCurrentRound() {
  if (!screens.game.classList.contains("hidden")) {
    startRound();
  }
}

function resetWholeGame() {
  clearGameLoops();

  state.currentQuestionIndex = 0;
  state.totalScore = 0;
  state.totalPeopleHelped = 0;
  state.minigamesUnlocked = 0;
  state.roundScore = 0;
  state.timeLeft = 30;
  state.gameRunning = false;
  state.roundComplete = false;
  state.difficulty = difficultySelect ? difficultySelect.value : "normal";

  updateTopStats();
  showScreen("menu");
}

function copyShareText() {
  const shareText = `I played Water Warriors and scored ${state.totalScore} points while learning about clean water access. charity: water helps fund clean water projects around the world.`;

  navigator.clipboard.writeText(shareText)
    .then(() => {
      shareBtn.textContent = "Copied";
      setTimeout(() => {
        shareBtn.textContent = "Copy Share Text";
      }, 1500);
    })
    .catch(() => {
      shareBtn.textContent = "Copy Failed";
      setTimeout(() => {
        shareBtn.textContent = "Copy Share Text";
      }, 1500);
    });
}

function getRandomMessage(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

function launchConfetti() {
  const colors = ["#FFC907", "#2E9DF7", "#FF902A", "#8BD1CB", "#F5402C"];

  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 2800);
  }
}
