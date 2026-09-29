const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalBtn = document.getElementById('modal-btn');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreTiesElement = document.getElementById('score-ties');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0, Ties: 0 };

// Sound Effects Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'draw') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'restart') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }
};

const fireConfetti = () => {
    // Only fire if confetti is loaded
    if (typeof confetti === 'undefined') return;
    
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#06b6d4', '#ec4899'];

    const frame = () => {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };
    frame();
};

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const updateStatusMessage = () => {
    const colorClass = currentPlayer === 'X' ? 'x-color' : 'o-color';
    statusDisplay.innerHTML = `Player <span class="${colorClass}">${currentPlayer}</span>'s turn`;
};

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.classList.add('filled');
    playSound('click');
};

const handlePlayerChange = () => {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusMessage();
};

const showModal = (message, highlightClass) => {
    modalMessage.innerHTML = message;
    if (highlightClass) {
        modalMessage.className = highlightClass;
    } else {
        modalMessage.className = '';
    }
    modal.classList.add('active');
};

const hideModal = () => {
    modal.classList.remove('active');
};

const handleResultValidation = () => {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningCells = winCondition;
            break;
        }
    }

    if (roundWon) {
        const colorClass = currentPlayer === 'X' ? 'x-color' : 'o-color';
        statusDisplay.innerHTML = `Player <span class="${colorClass}">${currentPlayer}</span> won!`;
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreBoard();
        
        playSound('win');
        fireConfetti();

        // Highlight winning cells
        winningCells.forEach(index => {
            cells[index].classList.add('winning-cell');
        });

        setTimeout(() => {
            showModal(`Player <span class="${colorClass}">${currentPlayer}</span> Wins!`);
        }, 500);
        return;
    }

    let roundDraw = !gameState.includes('');
    if (roundDraw) {
        statusDisplay.innerHTML = 'Game ended in a draw!';
        gameActive = false;
        scores.Ties++;
        updateScoreBoard();
        
        playSound('draw');

        setTimeout(() => {
            showModal(`It's a Draw!`);
        }, 500);
        return;
    }

    handlePlayerChange();
};

const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
};

const updateScoreBoard = () => {
    scoreXElement.innerText = scores.X;
    scoreOElement.innerText = scores.O;
    scoreTiesElement.innerText = scores.Ties;
};

const handleRestartGame = () => {
    playSound('restart');
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    updateStatusMessage();
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('x', 'o', 'filled', 'winning-cell');
    });
    hideModal();
};

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', handleRestartGame);
modalBtn.addEventListener('click', handleRestartGame);

// Initialize
updateStatusMessage();
