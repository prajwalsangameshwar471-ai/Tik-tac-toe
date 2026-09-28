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
