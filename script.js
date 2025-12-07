const Gameboard = (function () {
  const board = ["", "", "", "", "", "", "", "", ""]; // private

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

  function isValidIndex(i) {
    return Number.isInteger(i) && i >= 0 && i < 9;
  }

  function getWinningCombo(player) {
    for (const combo of winningCombos) {
      if (combo.every(index => board[index] === player)) {
        return combo;
      }
    }
    return null;
  }

  return {
    // Read-only accessors
    getBoard() {
      return board;
    },
    getMark(index) {
      if (!isValidIndex(index)) return null;
      return board[index];
    },

    // Mutators with validation
    setMark(index, mark) {
      if (!isValidIndex(index)) return false;
      if (board[index] !== "") return false;
      board[index] = mark;
      return true;
    },

    reset() {
      for (let i = 0; i < board.length; i++) board[i] = "";
    },

    // Helpers
    isFull() {
      return !board.includes("");
    },

    // Win detection (returns winning indices or null)
    getWinningCombo: getWinningCombo
  };
})();

// Player factory: creates simple player objects
const createPlayer = (name, mark) => {
  return {
    getName: () => name,
    setName: newName => name = newName,
    getMark: () => mark
  };
};

// GameController singleton: controls turns, plays moves, checks game end
const GameController = (function (Gameboard) {
  // players (created lazily so tests can inject different players)
  let player1 = createPlayer("Player 1", "X");
  let player2 = createPlayer("Player 2", "O");

  let currentPlayer = player1;
  let gameActive = true;

  function start(p1, p2) {
    if (p1) player1 = p1;
    if (p2) player2 = p2;
    currentPlayer = player1;
    gameActive = true;
    Gameboard.reset();
    // If a DisplayController exists, ask it to re-render
    if (typeof DisplayController !== "undefined" && DisplayController.render) {
      DisplayController.render();
      if (DisplayController.showMessage) DisplayController.showMessage(`${currentPlayer.getName()}'s turn`);
    }
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    if (typeof DisplayController !== "undefined" && DisplayController.showMessage) {
      DisplayController.showMessage(`${currentPlayer.getName()}'s turn`);
    }
  }

  // Attempt to play at index. Returns an object describing outcome.
  function playTurn(index) {
    if (!gameActive) return { success: false, reason: "game_inactive" };
    const mark = currentPlayer.getMark();

    // Ask Gameboard to set the mark; it returns true/false
    const placed = Gameboard.setMark(index, mark);
    if (!placed) return { success: false, reason: "cell_taken_or_invalid" };

    // Let display update if present
    if (typeof DisplayController !== "undefined" && DisplayController.render) {
      DisplayController.render();
    }

    // Check for win
    const winningCombo = Gameboard.getWinningCombo(mark);
    if (winningCombo) {
      gameActive = false;
      if (typeof DisplayController !== "undefined" && DisplayController.highlight) {
        DisplayController.highlight(winningCombo);
      }
      if (typeof DisplayController !== "undefined" && DisplayController.showMessage) {
        DisplayController.showMessage(`${currentPlayer.getName()} wins!`);
      }
      return { success: true, result: "win", winner: currentPlayer, combo: winningCombo };
    }

    // Check for draw
    if (Gameboard.isFull()) {
      gameActive = false;
      if (typeof DisplayController !== "undefined" && DisplayController.showMessage) {
        DisplayController.showMessage("It's a draw!");
      }
      return { success: true, result: "draw" };
    }

    // Continue game
    switchPlayer();
    return { success: true, result: "continue", currentPlayer };
  }

  function reset() {
    Gameboard.reset();
    currentPlayer = player1;
    gameActive = true;
    if (typeof DisplayController !== "undefined" && DisplayController.render) {
      DisplayController.render();
      if (DisplayController.showMessage) DisplayController.showMessage(`${currentPlayer.getName()}'s turn`);
    }
  }

  // Public API
  return {
    start,
    playTurn,
    reset,
    isActive: () => gameActive,
    getCurrentPlayer: () => currentPlayer,
    getPlayers: () => ({ player1, player2 })
  };
})(Gameboard);
