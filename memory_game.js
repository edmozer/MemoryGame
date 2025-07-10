// memory_game.js

let numPlayers = 2;
let numPairs = 8;
let players = [];
let scores = [];
let currentPlayer = 0;
let board = [];
let flipped = [];
let matched = [];
let lockBoard = false;
let images = [];
let backImage = 'assets/back.jpg';

const mainMenu = document.getElementById('main-menu');
const gameArea = document.getElementById('game-area');
const endScreen = document.getElementById('end-screen');
const boardDiv = document.getElementById('board');
const scoreboardDiv = document.getElementById('scoreboard');
const turnIndicator = document.getElementById('turn-indicator');
const winnerText = document.getElementById('winner-text');
const playerNamesDiv = document.getElementById('player-names');

// Utilidades
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function preloadImages(qtd) {
    // Cria uma lista de índices de imagens de 1 a 25
    let imgIndexes = [];
    for (let i = 1; i <= 25; i++) {
        imgIndexes.push(i);
    }
    shuffle(imgIndexes);
    // Seleciona qtd imagens aleatórias para os pares
    images = [];
    for (let i = 0; i < qtd; i++) {
        images.push(`assets/img${imgIndexes[i]}.jpg`);
    }
}

function createBoard() {
    board = [];
    matched = [];
    let values = [];
    // Em vez de usar índices 0,1,2..., usa índices aleatórios para os pares
    let imgIndexes = Array.from({length: numPairs}, (_, i) => i);
    shuffle(imgIndexes);
    for (let i = 0; i < numPairs; i++) {
        values.push(imgIndexes[i]);
        values.push(imgIndexes[i]);
    }
    shuffle(values);
    board = values;
    matched = Array(board.length).fill(false);
}

function renderBoard() {
    let cols = Math.ceil(Math.sqrt(numPairs * 2));
    let rows = Math.ceil((numPairs * 2) / cols);
    boardDiv.style.justifyContent = '';
    boardDiv.style.width = '';
    boardDiv.style.height = '';
    boardDiv.style.maxWidth = '';
    boardDiv.style.maxHeight = '';
    boardDiv.style.overflow = '';
    boardDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    boardDiv.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        const card = document.createElement('div');
        card.className = [
            'card',
            'aspect-square',
            'w-full h-full',
            'flex items-center justify-center bg-[#b8c1ec] rounded-xl shadow-md cursor-pointer select-none relative transition-transform duration-100 overflow-hidden',
        ].join(' ');
        if (matched[i]) card.classList.add('matched');
        let img = document.createElement('img');
        img.draggable = false;
        img.className = 'w-[96%] h-[96%] object-contain pointer-events-none';
        if (flipped.includes(i) || matched[i]) {
            card.classList.add('flipped');
            img.src = images[board[i]];
        } else {
            img.src = backImage;
        }
        card.appendChild(img);
        card.addEventListener('click', () => handleCardClick(i));
        boardDiv.appendChild(card);
    }
}

function renderPlayerInputs() {
    const n = parseInt(document.getElementById('players').value);
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 mb-2';
        const label = document.createElement('label');
        label.textContent = `Nome do Jogador ${i+1}:`;
        label.setAttribute('for', `player-name-${i}`);
        label.className = 'text-[#eebbc3] text-base font-medium mr-2';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player-name-${i}`;
        input.className = 'player-name-input w-[120px] text-base px-3 py-2 rounded-lg border border-[#b8c1ec] bg-[#232946] text-white focus:border-[#eebbc3]';
        input.value = `Jogador ${i+1}`;
        input.maxLength = 16;
        row.appendChild(label);
        row.appendChild(input);
        playerNamesDiv.appendChild(row);
    }
}

document.getElementById('players').addEventListener('change', renderPlayerInputs);
window.addEventListener('DOMContentLoaded', renderPlayerInputs);

function renderScoreboard() {
    scoreboardDiv.innerHTML = '';
    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement('div');
        div.textContent = `${players[i]}: ${scores[i]}`;
        if (i === currentPlayer) {
            div.style.fontWeight = 'bold';
            div.style.color = '#eebbc3';
        }
        scoreboardDiv.appendChild(div);
    }
}

function renderTurn() {
    turnIndicator.textContent = `Vez de ${players[currentPlayer]}`;
}

function handleCardClick(idx) {
    if (lockBoard || flipped.includes(idx) || matched[idx]) return;
    flipped.push(idx);
    renderBoard();
    if (flipped.length === 2) {
        lockBoard = true;
        setTimeout(checkMatch, 800);
    }
}

function showCorrectPopup(isLastPair = false) {
    const popup = document.getElementById('popup-correct');
    if (!popup) return;
    popup.textContent = isLastPair ? 'Correto!' : 'Correto! Você ganhou um turno extra!';
    popup.classList.add('active');
    setTimeout(() => {
        popup.classList.remove('active');
    }, 1000); // 1 segundo
}

function checkMatch() {
    const [a, b] = flipped;
    if (board[a] === board[b]) {
        matched[a] = true;
        matched[b] = true;
        scores[currentPlayer]++;
        flipped = [];
        renderBoard();
        renderScoreboard();
        const isLastPair = matched.filter(Boolean).length === board.length;
        showCorrectPopup(isLastPair);
        // Bônus: joga de novo
        if (isLastPair) {
            showEndScreen();
        } else {
            lockBoard = false;
        }
    } else {
        setTimeout(() => {
            flipped = [];
            renderBoard();
            // Próximo jogador
            currentPlayer = (currentPlayer + 1) % numPlayers;
            renderScoreboard();
            renderTurn();
            lockBoard = false;
        }, 900);
    }
}

function renderFinalScoreboard() {
    const finalScoreboard = document.getElementById('final-scoreboard');
    finalScoreboard.innerHTML = '';
    let maxScore = Math.max(...scores);
    for (let i = 0; i < numPlayers; i++) {
        const row = document.createElement('div');
        row.className = 'score-row';
        row.textContent = `${players[i]}: ${scores[i]}`;
        if (scores[i] === maxScore) {
            row.style.color = '#ffd6e0';
            row.style.fontWeight = 'bold';
        }
        finalScoreboard.appendChild(row);
    }
}

function showEndScreen() {
    gameArea.classList.add('hidden');
    setTimeout(() => {
        endScreen.classList.remove('hidden');
        renderFinalScoreboard();
        let maxScore = Math.max(...scores);
        let winners = scores.map((s, i) => s === maxScore ? players[i] : null).filter(x => x);
        if (winners.length === 1) {
            winnerText.textContent = `Vencedor: ${winners[0]}`;
        } else {
            winnerText.textContent = `Empate entre: ${winners.join(', ')}`;
        }
    }, 1200); 
}

function startGame() {
    numPlayers = parseInt(document.getElementById('players').value);
    numPairs = parseInt(document.getElementById('cards').value);
    if (isNaN(numPairs) || numPairs < 2) numPairs = 2;
    if (numPairs > 25) numPairs = 25;
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        const nameInput = document.getElementById(`player-name-${i}`);
        let name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : `Jogador ${i+1}`;
        players.push(name);
    }
    scores = Array(numPlayers).fill(0);
    currentPlayer = 0;
    flipped = [];
    lockBoard = false;
    preloadImages(numPairs);
    createBoard();
    mainMenu.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameArea.classList.add('active');
    document.getElementById('restart-btn').style.display = 'block';
    renderBoard();
    renderScoreboard();
    renderTurn();
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('restart-btn').onclick = () => {
    mainMenu.classList.remove('hidden');
    gameArea.classList.add('hidden');
    gameArea.classList.remove('active');
    endScreen.classList.add('hidden');
    document.getElementById('restart-btn').style.display = 'none';
};
document.getElementById('play-again-btn').onclick = () => {
    mainMenu.classList.remove('hidden');
    gameArea.classList.add('hidden');
    gameArea.classList.remove('active');
    endScreen.classList.add('hidden');
    document.getElementById('restart-btn').style.display = 'none';
};


window.addEventListener('keydown', (e) => {
    if (!mainMenu.classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')) {
        startGame();
    }
});
