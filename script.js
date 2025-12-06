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
  for(const combo of winningCombos) {
    if (combo.every(index => board[index] === player)) {
      return combo;
    }
  }
  return null;
}

// Reset Game
function resetGame() {
  // Clear the board array
  for(let i = 0; i < board.length; i++) {
    board[i] = "";
  }

  // Clear the UI cells
  cells.forEach(cell => {
    cell.textContent = "";
  });

  // Reset player turn
  currentPlayer = "X";
}

// Grab all the cell elements from the page
const cells = document.querySelectorAll(".cell");

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    // Checks if selected cell is empty
    if (board[index] !== "") return;

    // Place X or O in the board array
    board[index] = currentPlayer;

    // Update the UI
    cell.textContent = currentPlayer;

    // Check if this move wins the game
    if (checkWin(currentPlayer)) {
      alert(currentPlayer + " wins!");
      resetGame();
      return;
    }

    // Check for draw 
    if (!board.includes("")) {
      alert("It's a draw.");
      resetGame();
      return;
    }

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  });
});

