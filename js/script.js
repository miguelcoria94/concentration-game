import { animalEmojis } from "./animals.js";
const jsConfetti = new JSConfetti();

/*----- constants things like sound etc.-----*/
const gameMusic = new Audio("./assets/music/caketown.mp3");
const waitingMusic = new Audio("./assets/music/elevator_music.mp3");
const flick = new Audio("./assets/music/cardflip.wav");

let animations = [
  "animate__tada",
  "animate__bounce",
  "animate__pulse",
  "animate__rubberBand",
  "animate__swing",
  "animate__jello",
  "animate__heartBeat",
  "animate__hinge",
];

const startSoundEffects = [
  "./assets/game_sound_effects/katie_lets_play.mp3",
  "./assets/game_sound_effects/katie_here_we.mp3",
  "./assets/game_sound_effects/katie_start.mp3",
];

const wrongSoundEffects = ["./assets/game_sound_effects/wrong_one.wav"];

const correctSoundEffects = [
  "./assets/game_sound_effects/right_one.wav",
  "./assets/game_sound_effects/right_two.wav",
];
let emojis;

let board = new Array(30).fill("");

const timeoutIDs = [];

/*----- state variables 1st intialize state variables, global to the application -----*/

let highScore = localStorage.getItem("highScore") || 0;
if (highScore === 0) {
  localStorage.setItem("highScore", 0);
}

let longestStreak = localStorage.getItem("longestStreak") || 0;
if (longestStreak === 0) {
  localStorage.setItem("longestStreak", 0);
}
let currentScore = 0;

let currentStreak = 0;
let attemptsLeft = 20;
let gameStarted = false;
let currentCards = [];
let timeLeft = 240;
let matchCount = 0;
/*----- cached elements  -----*/

const cardBody = document.querySelectorAll(".flip-card-back");
const cards = document.querySelectorAll(".flip-card");
const startButton = document.querySelector(".start__button");
const buttonContainer = document.querySelector(".button__container");
const statsContainer = document.querySelector(".stats__container");
const resetButton = document.querySelector(".reset__button");
const timer = document.querySelector(".timer");
const modalContainer = document.querySelector(".modal__container");
const playAgainButton = document.querySelector(".modal__button");
const modalExitButton = document.querySelector(".modal__exit-button");
const highestScore = document.querySelector(".highest-score");
const longestStreakElement = document.querySelector(".longest-streak");

const modalScore = document.querySelector(".modal__score");
const modalTitle = document.querySelector(".modal__title");
const modalStreak = document.querySelector(".modal__streak");
const modalAttempts = document.querySelector(".modal__attempts");

/*----- event listeners -----*/

function handleCardClick(e) {
  e.preventDefault();

  const card = e.currentTarget;

  card.classList.toggle("is-flipped");

  flick.play();

  playAnimalSound(card.querySelector(".flip-card-back").innerText);
  if (currentCards[0] === card) {
    card.classList.add("is-flipped");
    return;
  }
  currentCards.push(card);
  compareCards();

  if (currentCards.length === 2) {
    setTimeout(() => {
      flipAllCards();
      currentCards = [];
    }, 400);
  }

  render();
}

playAgainButton.addEventListener("click", () => {
  modalContainer.style.display = "none";
  init();
});

modalExitButton.addEventListener("click", () => {
  modalContainer.style.display = "none";
  initialLoad();
});

resetButton.addEventListener("click", initialLoad);

startButton.addEventListener("click", init);
/*----- functions -----*/

initialLoad();
function initialLoad() {
  removeAllEventListeners();
  resetCardClasses();
  playWaitingMusic();
  gameStarted = false;
  currentScore = 0;
  attemptsLeft = 20;
  currentStreak = 0;

  emojis = getSixteenRandomEmojis();
  fillBoard();
  renderEmojiOnCard();
  waitingCardMovement();
  render();
}

function init() {
  clearTimeouts();
  playGameMusic();
  gameStarted = true;
  startTimer(timeLeft, timer);
  setUpEventListeners();

  resetCardClasses();
  playRandomStartSoundEffect();
  emojis = getSixteenRandomEmojis();

  setTimeout(() => {
    fillBoard();
    renderEmojiOnCard();
  }, 1000);
  currentStreak = 0;
  currentScore = 0;
  attemptsLeft = 20;
  startGame();
  render();
}

function compareCards() {
  if (currentCards.length === 2) {
    if (
      currentCards[0].querySelector(".flip-card-back").innerText ===
      currentCards[1].querySelector(".flip-card-back").innerText
    ) {
      playRandomCorrectSoundEffect();
      applyCorrectCardClass();
      matchCount++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        localStorage.setItem("longestStreak", longestStreak.toString());
      }
    } else {
      playRandomWrongSoundEffect();
      applyWrongCardClass();
    }
  }
  if (attemptsLeft === 0) {
    if (longestStreak < currentStreak) {
      longestStreak = currentStreak;
      localStorage.setItem("longestStreak", longestStreak);
    }
    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem("highScore", highScore);
    }
    playGameOverSoundEffect();
    modalContainer.style.display = "block";
    modalScore.innerText = currentScore;
    modalStreak.innerText = longestStreak;
    modalAttempts.innerText = attemptsLeft;
    modalTitle.innerText = "Game Over";

    initialLoad();
  }
  if (matchCount === 15) {
    if (longestStreak < currentStreak) {
      longestStreak = currentStreak;
      localStorage.setItem("longestStreak", longestStreak);
    }
    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem("highScore", highScore);
    }

    jsConfetti.addConfetti();
    playGameWinSoundEffect();
    modalContainer.style.display = "block";
    modalScore.innerText = currentScore;
    modalStreak.innerText = longestStreak;
    modalAttempts.innerText = attemptsLeft;
    modalTitle.innerText = "You Win!";
    initialLoad();
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    localStorage.setItem("longestStreak", longestStreak.toString());
  }
}

function removeAllEventListeners() {
  cards.forEach((card) => {
    card.removeEventListener("click", handleCardClick);
  });
}

function renderHighScore() {
  highestScore.innerText = `${highScore}`;
}

function renderLongestStreak() {
  longestStreakElement.innerText = `${longestStreak}`;
}

function playGameOverSoundEffect() {
  let audio = new Audio("./assets/game_sound_effects/game_over.wav");
  let audioTwo = new Audio("./assets/game_sound_effects/game_over_two.wav");
  audioTwo.volume = 0.5;

  audio.volume = 0.5;
  audioTwo.play();
  audio.play();
}

function playGameWinSoundEffect() {
  let audio = new Audio("./assets/game_sound_effects/game_win.wav");
  let audioTwo = new Audio("./assets/game_sound_effects/game_win_katie.wav");
  let audioThree = new Audio("./assets/game_sound_effects/confetti_gun.wav");
  audio.volume = 0.5;
  audioTwo.volume = 0.5;
  audioThree.volume = 0.5;
  audio.play();
  audioTwo.play();
  audioThree.play();
}

function timesUpSoundEffect() {
  let audio = new Audio("./assets/game_sound_effects/times_up.wav");
  let audioTwo = new Audio("./assets/game_sound_effects/times_up_sound.wav");
  audio.volume = 0.5;
  audioTwo.volume = 0.5;
  audioTwo.play();
  audio.play();
}

function startTimer(duration, display) {
  display.textContent = `Time Left: 04:00`;
  let timer = duration,
    minutes,
    seconds;
  let intervalID = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = `Time Left: ${minutes}:${seconds}`;

    if (--timer < 0) {
      clearInterval(intervalID);
      timesUpSoundEffect();
      if (longestStreak < currentStreak) {
        longestStreak = currentStreak;
        localStorage.setItem("longestStreak", longestStreak);
      }
      if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("highScore", highScore);
      }
      modalContainer.style.display = "block";
      modalScore.innerText = currentScore;
      modalStreak.innerText = longestStreak;
      modalAttempts.innerText = attemptsLeft;
      modalTitle.innerText = "Time's Up!";
      initialLoad();
    }
  }, 1000);

  timeoutIDs.push(intervalID);
}

function playRandomWrongSoundEffect() {
  let randomIdx = Math.floor(Math.random() * wrongSoundEffects.length);
  let audio = new Audio(wrongSoundEffects[randomIdx]);
  audio.volume = 0.2;
  audio.play();
}

function playRandomCorrectSoundEffect() {
  let randomIdx = Math.floor(Math.random() * correctSoundEffects.length);
  let audio = new Audio(correctSoundEffects[randomIdx]);
  audio.volume = 0.2;
  audio.play();
}
function applyCorrectCardClass() {
  currentScore += 100;
  currentStreak++;
  // scale 110%
  currentCards[0].style.transform = "scale(1.1)";
  currentCards[0].classList.add("is-flipped");
  currentCards[1].classList.add("is-flipped");
  currentCards[0].classList.add("animate__animated");
  currentCards[0].classList.add("animate__bounceOut");
  currentCards[1].classList.add("animate__animated");
  currentCards[1].classList.add("animate__bounceOut");

  currentCards[0].removeEventListener("click", handleCardClick);
  currentCards[1].removeEventListener("click", handleCardClick);
}

function applyWrongCardClass() {
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    localStorage.setItem("longestStreak", longestStreak);
  }
  currentStreak = 0;
  attemptsLeft--;
}

function render() {
  renderEmojiOnCard();
  renderCurrentScore();
  renderAttemptsLeft();
  renderHighScore();
  renderLongestStreak();
  renderCurrentStreak();
  renderStatsContainer();
  renderButtonContainer();
}

function resetCardClasses() {
  cards.forEach((card) => {
    card.classList.remove("board__square-wrong");
    card.classList.remove("board__square-correct");
    card.classList.remove("is-flipped");
    card.classList.remove("animate__animated");
    card.classList.remove("animate__hinge");
  });
}

function startGame() {
  gameStarted = true;
}

function playGameMusic() {
  waitingMusic.pause();
  setTimeout(() => {
    gameMusic.currentTime = 0;
    gameMusic.volume = 0.3;
    gameMusic.play();
  }, 1000);
}

function playWaitingMusic() {
  gameMusic.pause();
  setTimeout(() => {
    waitingMusic.currentTime = 0;
    waitingMusic.volume = 0.3;
    waitingMusic.play();
  }, 1000);
}

function flipAllCards() {
  cards.forEach((card) => {
    card.classList.remove("is-flipped");
  });
}

function setUpEventListeners() {
  cards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
  });
}

function playRandomStartSoundEffect() {
  let randomIdx = Math.floor(Math.random() * startSoundEffects.length);
  let audio = new Audio(startSoundEffects[randomIdx]);
  audio.volume = 0.5;
  audio.play();
}

function renderStatsContainer() {
  if (gameStarted) {
    statsContainer.style.display = "flex";
  } else {
    statsContainer.style.display = "none";
  }
}

function renderButtonContainer() {
  if (gameStarted) {
    buttonContainer.style.display = "none";
  } else {
    buttonContainer.style.visibility = "visible";
    buttonContainer.style.display = "flex";
  }
}

function renderCurrentScore() {
  document.querySelector(
    ".current-score"
  ).innerText = `Current Score: ${currentScore}`;
}

function renderAttemptsLeft() {
  document.querySelector(
    ".attempts-left"
  ).innerText = `Attempts Left: ${attemptsLeft}`;
}

function renderCurrentStreak() {
  document.querySelector(
    ".current-streak"
  ).innerText = `Current Streak: ${currentStreak}`;
}

function clearTimeouts() {
  for (let i = 0; i < timeoutIDs.length; i++) {
    clearTimeout(timeoutIDs[i]);
  }
}

function waitingCardMovement() {
  let randomIdx = Math.floor(Math.random() * 30);
  let randomAnimation = Math.floor(Math.random() * animations.length);

  for (let i = 0; i < 100; i++) {
    let timeoutID = setTimeout(() => {
      flick.play();
      playAnimalSound(cards[randomIdx].firstChild.nextSibling.innerText);
      cards[randomIdx].classList.toggle("is-flipped");
      cards[randomIdx].classList.add("animate__animated");
      cards[randomIdx].classList.add(animations[randomAnimation]);
      randomIdx = Math.floor(Math.random() * 30);
      randomAnimation = Math.floor(Math.random() * animations.length);
    }, i * 2000);
    timeoutIDs.push(timeoutID);
  }
}

function renderEmojiOnCard() {
  cardBody.forEach((el, idx) => {
    el.innerText = board[idx];
  });
}

function fillBoard() {
  board = new Array(30).fill("");
  const selectedIndex = {};
  for (let i = 0; i < emojis.length; i++) {
    let randomIdx = Math.floor(Math.random() * board.length);
    while (selectedIndex[randomIdx]) {
      randomIdx = Math.floor(Math.random() * board.length);
    }
    board[randomIdx] = emojis[i];
    selectedIndex[randomIdx] = true;
  }
  for (let i = 0; i < emojis.length; i++) {
    let randomIdx = Math.floor(Math.random() * board.length);
    while (selectedIndex[randomIdx]) {
      randomIdx = Math.floor(Math.random() * board.length);
    }
    board[randomIdx] = emojis[i];
    selectedIndex[randomIdx] = true;
  }
}

function getSixteenRandomEmojis() {
  let randomIdx = Math.floor(Math.random() * animalEmojis.length);
  let count = 0;
  const alreadyPicked = {};
  while (count < 15) {
    if (alreadyPicked[randomIdx]) {
      randomIdx = Math.floor(Math.random() * animalEmojis.length);
    } else {
      alreadyPicked[randomIdx] = animalEmojis[randomIdx];
      randomIdx = Math.floor(Math.random() * animalEmojis.length);
      count++;
    }
  }
  return Object.values(alreadyPicked);
}

function playAnimalSound(animal) {
  let audio = null;
  switch (animal) {
    case "🐶":
      audio = new Audio("./assets/animal_sounds/dog.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐱":
      audio = new Audio("./assets/animal_sounds/cat.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐭":
      audio = new Audio("./assets/animal_sounds/mouse.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐹":
      audio = new Audio("./assets/animal_sounds/hamster.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦊":
      audio = new Audio("./assets/animal_sounds/fox.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐻":
      audio = new Audio("./assets/animal_sounds/bear.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐼":
      audio = new Audio("./assets/animal_sounds/panda.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦁":
      audio = new Audio("./assets/animal_sounds/lion.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐨":
      audio = new Audio("./assets/animal_sounds/koala.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐯":
      audio = new Audio("./assets/animal_sounds/tiger.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦄":
      audio = new Audio("./assets/animal_sounds/unicorn.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐮":
      audio = new Audio("./assets/animal_sounds/cow.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐷":
      audio = new Audio("./assets/animal_sounds/pig.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐸":
      audio = new Audio("./assets/animal_sounds/frog.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐵":
      audio = new Audio("./assets/animal_sounds/monkey-2.wav");
      audio.volume = 0.3;
      audio.play();
      break;
    case "🐔":
      audio = new Audio("./assets/animal_sounds/rooster.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐧":
      audio = new Audio("./assets/animal_sounds/penguin.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐦":
      audio = new Audio("./assets/animal_sounds/bird.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐤":
      audio = new Audio("./assets/animal_sounds/chick.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦆":
      audio = new Audio("./assets/animal_sounds/duck.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦅":
      audio = new Audio("./assets/animal_sounds/eagle.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦉":
      audio = new Audio("./assets/animal_sounds/owl.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦇":
      audio = new Audio("./assets/animal_sounds/bat.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐺":
      audio = new Audio("./assets/animal_sounds/wolf.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐗":
      audio = new Audio("./assets/animal_sounds/warthog.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐴":
      audio = new Audio("./assets/animal_sounds/horse.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦓":
      audio = new Audio("./assets/animal_sounds/donkey.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦍":
      audio = new Audio("./assets/animal_sounds/gorilla.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐘":
      audio = new Audio("./assets/animal_sounds/elephant.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦏":
      audio = new Audio("./assets/animal_sounds/rhino.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦛":
      audio = new Audio("./assets/animal_sounds/hippo.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐪":
      audio = new Audio("./assets/animal_sounds/camel.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦙":
      audio = new Audio("./assets/animal_sounds/llama.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦒":
      audio = new Audio("./assets/animal_sounds/giraffe.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐃":
      audio = new Audio("./assets/animal_sounds/toro.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐰":
      audio = new Audio("./assets/animal_sounds/bunny.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐂":
      audio = new Audio("./assets/animal_sounds/ox.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐄":
      audio = new Audio("./assets/animal_sounds/cow2.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐎":
      audio = new Audio("./assets/animal_sounds/horse_run.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐖":
      audio = new Audio("./assets/animal_sounds/pig.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐏":
      audio = new Audio("./assets/animal_sounds/ram.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐑":
      audio = new Audio("./assets/animal_sounds/sheep.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐐":
      audio = new Audio("./assets/animal_sounds/goat.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐕":
      audio = new Audio("./assets/animal_sounds/dog-2.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐩":
      audio = new Audio("./assets/animal_sounds/poodle.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐈":
      audio = new Audio("./assets/animal_sounds/meow.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐓":
      audio = new Audio("./assets/animal_sounds/cluck.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦃":
      audio = new Audio("./assets/animal_sounds/turkey.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🕊":
      audio = new Audio("./assets/animal_sounds/bird-fly.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐇":
      audio = new Audio("./assets/animal_sounds/bunny.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐁":
      audio = new Audio("./assets/animal_sounds/mouse.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐀":
      audio = new Audio("./assets/animal_sounds/rat.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐿":
      audio = new Audio("./assets/animal_sounds/squirrel.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦔":
      audio = new Audio("./assets/animal_sounds/sonic.mp3");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🦘":
      audio = new Audio("./assets/animal_sounds/kangaroo.wav");
      audio.volume = 0.2;
      audio.play();
      break;
    case "🐲":
      audio = new Audio("./assets/animal_sounds/dragon.wav");
      audio.volume = 0.2;
      audio.play();
      break;
  }
}
