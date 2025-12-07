// 1D board
const board = ["", "", "", "", "", "", "", "", ""];

// Track whose turn it is (X always starts)
let currentPlayer = "X";


const winningCombos = [  
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

// Return the winning combo array if player has won, otherwise null
function getWinningCombo(player) {
  for (const combo of winningCombos) {
    if (combo.every(index => board[index] === player)) {
      return combo;
    }
  }
  return null;
}

// Reset Game
function resetGame() {
  // Clear the board array
  for (let i = 0; i < board.length; i++) {
    board[i] = "";
  }

  // Clear the UI cells
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("highlight");
  });

  // Reset player turn
  currentPlayer = "X";
}

// Grab all the cell elements from the page
const cells = document.querySelectorAll(".cell");

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    // Ignore clicks if game ended or cell already filled
    if (!gameActive || board[index] !== "") return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;

    // Check for a win: highlight the winning cells and stop the game (no auto-reset)
    const winnerCombo = getWinningCombo(currentPlayer);
    if (winnerCombo) {
      winnerCombo.forEach(i => cells[i].classList.add("highlight"));
      alert(currentPlayer + " wins!");
      gameActive = false; // stop further moves until manual reset
      return;
    }

    // Check for draw: stop the game (no auto-reset)
    if (!board.includes("")) {
      alert("It's a draw!");
      gameActive = false;
      return;
    }

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  });
});

let gameActive = true;  // true while a round is playable
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  resetGame();
  gameActive = true;
});



