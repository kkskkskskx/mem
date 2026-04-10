document.addEventListener('DOMContentLoaded', () => {
const questions = [
    { question: "Де ця собака згадується у?", image: "upload/images/doge.jpg", answers: ["Інстаграмі", "Shiba Inu Token", "Dogecoin", "TikTok"], correct: 2 },
    { question: "Де цей мем з'явився першим?", image: "upload/images/gigachad.jpg", answers: ["Reddit та 4chan", "YouTube", "TikTok", "Китайські платформи"], correct: 0 },
	{ question: "Цей мем часто використовується для сумних або розчарованих реакцій.", image: "upload/images/wojak.jpg", answers: ["Wojak", "Success kid", "Pepe", "Trollface"], correct: 0 },
];

const questionText = document.querySelector('#question-text');
const questionImage = document.querySelector('#question-image');
const answersContainer = document.querySelector('#answers-container');
const startScreen = document.querySelector('#start-screen');
const quizScreen = document.querySelector('#quiz-screen');
const resultScreen = document.querySelector('#result-screen');
const startBtn = document.querySelector('#start-btn');
const restartBtn = document.querySelector('#restart-btn');
const scoreDisplay = document.querySelector('#score-display');
const resultText = document.querySelector('#result-text');
const timerElement = document.querySelector('#timer');
const timerSound = document.querySelector('#timer-sound');
const skipBtn = document.querySelector('#skip-btn');
const soundToggle = document.querySelector('#sound-toggle');

let questionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let skipUsed = false;
let soundEnabled = true;
let answered = false;
let activeSounds = [];
let correctAnswers = 0;
let wrongAnswers = 0;
let gameStartTime;

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    soundToggle.style.display = 'flex';
    soundToggle.classList.remove('hide');
    soundToggle.classList.add('show');
    startGame();
});
skipBtn.addEventListener('click', skipQuestion);
soundToggle.addEventListener('click', toggleSound);

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    if (!soundEnabled) {
        timerSound.pause();
        timerSound.currentTime = 0;
        activeSounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
        });
        activeSounds = [];
    } else if (quizScreen.classList.contains('hide') === false && timeLeft > 0 && !answered) {
        timerSound.currentTime = 0;
        timerSound.play();
    }
}

function playSound(soundPath) {
    if (!soundEnabled) return;
    const sound = new Audio(soundPath);
    activeSounds.push(sound);
    sound.play();
    sound.addEventListener('ended', () => {
    const index = activeSounds.indexOf(sound);
    if (index > -1) activeSounds.splice(index, 1);
    });
    sound.addEventListener('error', () => {
    const index = activeSounds.indexOf(sound);
    if (index > -1) activeSounds.splice(index, 1);
    });
    return sound;
}

function startGame(){
    startScreen.classList.add('hide');
    resultScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    soundToggle.classList.remove('hide');
    soundToggle.classList.add('show');
    score = 0;
    questionIndex = 0;
    skipUsed = false;
    answered = false;
    correctAnswers = 0;
    wrongAnswers = 0;
    gameStartTime = Date.now();
    skipBtn.disabled = false;
    scoreDisplay.textContent = "Бали: 0";
    showQuestion(questions[questionIndex]);
}

function showQuestion(question){
    clearInterval(timer);
    timerSound.pause();
    timerSound.currentTime = 0;
    answered = false;

    answersContainer.innerHTML = '';
    questionText.textContent = question.question;

    if(question.image){
    questionImage.src = question.image;
    questionImage.classList.remove('hide');
    } else {
    questionImage.classList.add('hide');
    }

    startTimer();

    question.answers.forEach((answer,index)=>{
    const button = document.createElement('button');
    button.textContent = answer;
    button.classList.add('answer-btn');
    button.addEventListener('click',()=>checkAnswer(index,button));
    answersContainer.appendChild(button);
    });
}

function checkAnswer(answerIndex, button){
    if (answered) return;
	answered = true;
    clearInterval(timer);
    timerSound.pause();
    timerSound.currentTime = 0;
    const correctIndex = questions[questionIndex].correct;
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn=>btn.disabled=true);
    if(answerIndex===correctIndex){
    button.classList.add('correct');
    playSound("upload/sounds/correct.mp3");
    score++;
    correctAnswers++;
    scoreDisplay.textContent="Бали: "+score;
    } else {
    button.classList.add('wrong');
    buttons[correctIndex].classList.add('correct');
    wrongAnswers++;
    playSound("upload/sounds/wrong.mp3");
    }
    setTimeout(nextQuestion,1000);
}

function nextQuestion(){
    clearInterval(timer);
    timerSound.pause();
    timerSound.currentTime = 0;
    questionIndex++;
    if(questionIndex<questions.length){
    showQuestion(questions[questionIndex]);
    } else {
    showResult();
    }
}

function showResult(){
    clearInterval(timer);
    timerSound.pause();
    timerSound.currentTime = 0;
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    soundToggle.classList.remove('show');
    soundToggle.classList.add('hide');
    setTimeout(() => {
    soundToggle.style.display = 'none';
    }, 300);
    
    const accuracy = Math.round((score / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - gameStartTime) / 1000);
    resultText.textContent = `Твій результат: ${score} з ${questions.length} (${accuracy}%/100%)`;
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('wrong-count').textContent = wrongAnswers;
    document.getElementById('time-spent').textContent = `${timeSpent}с`;
}

function startTimer(){
    timeLeft=15;
    timerElement.textContent="Час: "+timeLeft;
    timerSound.currentTime=0;
    if (soundEnabled) {
    timerSound.play();
    }
    timer=setInterval(()=>{
        timeLeft--;
        timerElement.textContent="Час: "+timeLeft;
        if(timeLeft<=0){
            clearInterval(timer);
            timerSound.pause();
            timerSound.currentTime=0;
            answered = true;
			wrongAnswers++;
            const buttons = document.querySelectorAll('.answer-btn');
            buttons.forEach(btn => btn.disabled = true);
            const correctIndex = questions[questionIndex].correct;
            const allButtons = document.querySelectorAll('.answer-btn');
            if (allButtons[correctIndex]) {
            allButtons[correctIndex].classList.add('correct');
            }
            playSound("upload/sounds/wrong.mp3");
            setTimeout(nextQuestion, 1000);
        }
    },1000);
}

function skipQuestion(){
    if(skipUsed || answered) return;
    answered = true;
    skipUsed = true;
    skipBtn.disabled = true;
    clearInterval(timer);
    timerSound.pause();
    timerSound.currentTime = 0;
	score++;
	correctAnswers++;
	scoreDisplay.textContent="Бали: "+score;
    const skipSound = playSound("upload/sounds/skip.mp3");
    if (skipSound) {
    skipSound.addEventListener('ended', ()=>{
    nextQuestion();
    });
    } else {
    setTimeout(nextQuestion, 500);
    }
}

document.addEventListener("click", (e) => {
    const effect = document.createElement("div");
    effect.className = "click-effect";
    effect.style.left = e.clientX + "px";
    effect.style.top = e.clientY + "px";
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 800);
});
});

