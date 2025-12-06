// 1D board
const board = ["", "", "", "", "", "", "", "", ""];

// Track whose turn it is (X always starts)
let currentPlayer = "X";

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

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  });
});
