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
    
    // Ajusta o número de colunas para evitar linhas com 1-2 cartas
    while ((numPairs * 2) % cols <= 2 && (numPairs * 2) % cols !== 0) {
        cols++;
    }
    rows = Math.ceil((numPairs * 2) / cols);
    
    boardDiv.className = 'grid gap-2 bg-transparent';
    boardDiv.style.width = '100%';
    boardDiv.style.aspectRatio = `${cols}/${rows}`; // Mantém proporção do container
    boardDiv.style.maxWidth = '90vmin'; // Limita tamanho máximo
    boardDiv.style.margin = '0 auto';
    boardDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardDiv.style.gridAutoRows = '1fr'; // Cada célula com mesma altura
    boardDiv.innerHTML = '';

    for (let i = 0; i < board.length; i++) {
        const card = document.createElement('div');
        card.className = 'memory-card rounded-xl bg-[#232946] shadow-md select-none transition-all flex items-center justify-center';
        card.style.width = '100%';
        card.style.height = '100%';
        card.style.aspectRatio = '1/1'; // Força proporção quadrada
        if (matched[i]) card.classList.add('matched');
        let img = document.createElement('img');
        img.draggable = false;
        img.className = 'w-full h-full object-cover pointer-events-none bg-transparent';
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
    document.getElementById('footer-scoreboard').style.display = 'flex';
    document.getElementById('restart-btn').style.display = 'block';
    renderBoard();
    renderScoreboard();
    renderTurn();
    ajustarGridBoard(numPairs * 2); // Ajusta o grid do board
}

function ajustarGridBoard(numCards) {
    const board = document.getElementById('board');
    const gameArea = document.getElementById('game-area');
    if (!board || !gameArea) return;

    // Começa com o número ideal de colunas (raiz quadrada arredondada para cima)
    let columns = Math.ceil(Math.sqrt(numCards));
    
    // Ajusta o número de colunas para evitar linhas com 1-2 cartas
    while (numCards % columns <= 2 && numCards % columns !== 0) {
        columns++;
    }
    
    // Calcula o número de linhas
    const rows = Math.ceil(numCards / columns);

    // Calcula as dimensões disponíveis (considerando margens e outros elementos)
    const footerHeight = 80; // Altura aproximada do footer
    const topMargin = 80; // Margem do topo aumentada
    const bottomMargin = 40; // Margem inferior
    const availableHeight = window.innerHeight - footerHeight - topMargin - bottomMargin;
    const availableWidth = window.innerWidth * 0.95; // 95% da largura da tela

    // Calcula o tamanho ideal das cartas baseado no espaço disponível
    const maxCardWidth = Math.floor(availableWidth / columns);
    const maxCardHeight = Math.floor(availableHeight / rows);
    const cardSize = Math.min(maxCardWidth, maxCardHeight);

    // Calcula as dimensões totais do grid
    const totalWidth = cardSize * columns;
    const totalHeight = cardSize * rows;

    // Aplica os estilos para maximizar o uso do espaço
    gameArea.style.padding = '1rem';
    gameArea.style.paddingTop = `${topMargin}px`; // Espaço superior
    gameArea.style.paddingBottom = `${footerHeight + bottomMargin}px`; // Espaço para o footer

    board.style.display = 'grid';
    board.style.gap = '0.75rem';
    board.style.width = `${totalWidth}px`;
    board.style.height = `${totalHeight}px`;
    board.style.gridTemplateColumns = `repeat(${columns}, ${cardSize}px)`;
    board.style.gridAutoRows = `${cardSize}px`;
    board.style.justifyContent = 'center';
    board.style.alignContent = 'center';
    board.style.margin = '0 auto';

    // Debug
    console.log(`Grid Layout: ${columns}x${rows} (${numCards} cards)`);
    console.log(`Card Size: ${cardSize}px`);
    console.log(`Container: ${cardSize * columns}px x ${cardSize * rows}px`);
}

// Exemplo de uso: chame ajustarGridBoard(cards.length) sempre que o board for montado
//
// Localize o ponto do seu código onde as cartas são renderizadas no board e adicione:
// ajustarGridBoard(cards.length);
//
// Se quiser, posso localizar e inserir automaticamente esse ponto para você.

document.getElementById('start-btn').onclick = startGame;
document.getElementById('restart-btn').onclick = () => {
    mainMenu.classList.remove('hidden');
    gameArea.classList.add('hidden');
    gameArea.classList.remove('active');
    endScreen.classList.add('hidden');
    document.getElementById('footer-scoreboard').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
};
document.getElementById('play-again-btn').onclick = () => {
    mainMenu.classList.remove('hidden');
    gameArea.classList.add('hidden');
    gameArea.classList.remove('active');
    endScreen.classList.add('hidden');
    document.getElementById('footer-scoreboard').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
};


window.addEventListener('keydown', (e) => {
    if (!mainMenu.classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')) {
        startGame();
    }
});

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-scoreboard');
  const scoreboardContent = document.getElementById('scoreboard-content');
  let collapsed = false;
  if (toggleBtn && scoreboardContent) {
    toggleBtn.addEventListener('click', function() {
      collapsed = !collapsed;
      scoreboardContent.classList.toggle('collapsed', collapsed);
      toggleBtn.innerText = collapsed ? '▼' : '▲';
    });
  }
  // ...placar lateral...
  const toggleFooterBtn = document.getElementById('toggle-footer-scoreboard');
  const footerScoreboardContent = document.getElementById('footer-scoreboard-content');
  let footerCollapsed = false;
  if (toggleFooterBtn && footerScoreboardContent) {
    toggleFooterBtn.addEventListener('click', function() {
      footerCollapsed = !footerCollapsed;
      footerScoreboardContent.classList.toggle('collapsed', footerCollapsed);
      toggleFooterBtn.innerText = footerCollapsed ? '▲' : '▼';
    });
  }
});
