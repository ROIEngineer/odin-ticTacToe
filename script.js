// 1D board
const board = ["", "", "", "", "", "", "", "", ""];

// Track whose turn it is (X always starts)
let currentPlayer = "X";

// Grab all the cell elements from the page
const cells = document.querySelectorAll(".cell");

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    console.log("You clicked cell:", index);
  });
});
