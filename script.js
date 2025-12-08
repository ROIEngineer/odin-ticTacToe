// Gameboard
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

// DisplayController singleton: handles DOM rendering and events
const DisplayController = (function (Gameboard, GameController) {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const resetBtn = document.getElementById("resetBtn");
  let messageEl = document.getElementById("message");

  // If message element doesn't exist, create one (keeps HTML edits optional)
  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.id = "message";
    messageEl.setAttribute("aria-live", "polite");
    messageEl.style.marginTop = "8px";
    // Try to place it below the board:
    const gameEl = document.getElementById("game");
    if (gameEl && gameEl.parentNode) gameEl.parentNode.insertBefore(messageEl, resetBtn ? resetBtn.nextSibling : gameEl.nextSibling);
    else document.body.appendChild(messageEl);
  }

  function render() {
    const board = Gameboard.getBoard();
    // clear highlights on render (highlights should only be added by highlight())
    cells.forEach((cell, i) => {
      cell.classList.remove("highlight");
      cell.textContent = board[i] || "";
    });
  }

  function showMessage(text) {
    messageEl.textContent = String(text || "");
  }

  function highlight(combo = []) {
    combo.forEach(i => {
      if (cells[i]) cells[i].classList.add("highlight");
    });
  }

  function bindEvents() {
    // Clear previous handlers (safe-guard in case you had old listeners)
    cells.forEach((cell, i) => {
      cell.onclick = () => {
        const result = GameController.playTurn(i);
        // If the playTurn call failed (e.g., cell taken or game inactive), show friendly message
        if (!result || result.success === false) {
          if (result && result.reason === "cell_taken_or_invalid") {
            showMessage("That spot is already taken.");
          } else if (result && result.reason === "game_inactive") {
            showMessage("Round over — click Reset to play again.");
          }
          return;
        }

        // If GameController returned a structured result, prefer using it to show messages
        if (result.result === "win" && result.winner) {
          // We expect GameController to call DisplayController.highlight, but just in case:
          if (result.combo) highlight(result.combo);
          showMessage(`${result.winner.getName()} wins!`);
          return;
        }

        if (result.result === "draw") {
          showMessage("It's a draw!");
          return;
        }

        // Otherwise continue: show whose turn it is
        const current = GameController.getCurrentPlayer();
        if (current && current.getName) showMessage(`${current.getName()}'s turn`);
      };
    });

    // Reset button wiring (overwrites previous handlers safely)
    if (resetBtn) {
      resetBtn.onclick = () => {
        GameController.reset();
        showMessage(`${GameController.getCurrentPlayer().getName()}'s turn`);
      };
    }
  }

  // Initialize: render empty board and bind events
  render();
  bindEvents();

  // Expose API that GameController expects
  return {
    render,
    showMessage,
    highlight,
    bindEvents
  };
})(Gameboard, GameController);

// Start screen wiring (assumes start HTML exists)
(function () {
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const input1 = document.getElementById("player1Name");
  const input2 = document.getElementById("player2Name");
  const resetBtn = document.getElementById("resetBtn");

  function showStartScreen() {
    if (startScreen) startScreen.style.display = "flex";
    // Clear message and board visually
    if (typeof DisplayController !== "undefined" && DisplayController.showMessage) {
      DisplayController.showMessage("Enter names and start the game");
    }
    // Ensure board is blank visually (controller.reset would do this but keep UI consistent)
    if (typeof DisplayController !== "undefined" && DisplayController.render) {
      DisplayController.render();
    }
  }

  function hideStartScreen() {
    if (startScreen) startScreen.style.display = "none";
  }

  // Start button behavior: create players, start controller, hide overlay
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const name1 = (input1 && input1.value.trim()) || "Player 1";
      const name2 = (input2 && input2.value.trim()) || "Player 2";

      const p1 = createPlayer(name1, "X");
      const p2 = createPlayer(name2, "O");

      GameController.start(p1, p2); // resets board and sets current player
      if (typeof DisplayController !== "undefined" && DisplayController.showMessage) {
        DisplayController.showMessage(`${GameController.getCurrentPlayer().getName()}'s turn`);
      }
      hideStartScreen();
    });
  }

  // When Reset is clicked, show the start screen again (Option A behavior)
  if (resetBtn) {
    // addEventListener so we don't clobber existing handler in DisplayController
    resetBtn.addEventListener("click", () => {
      showStartScreen();
    });
  }

  // Show start screen on first load
  showStartScreen();
})();

