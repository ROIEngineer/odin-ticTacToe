# Tic-Tac-Toe (JavaScript, HTML, CSS)

A fully functional Tic-Tac-Toe game built using **modular JavaScript**, following the **factory function** and **IIFE module pattern**. This project was completed as part of a study assignment focused on clean architecture, separation of concerns, and minimal global code.

## 🚀 Features

* Two-player local Tic-Tac-Toe (X vs O)
* Start screen with player name input
* Manual Reset button
* Highlighted winning combination
* DOM rendering handled by a dedicated DisplayController module
* Game logic handled by GameController
* Board state fully encapsulated in a Gameboard IIFE
* Prevents playing in occupied cells
* Supports draw/tie detection
* Clean modular architecture (no unnecessary global variables)

---

## Live Demo 
[Try the live demo](https://odin-tic-tac-toe-ecru.vercel.app/)

---

## 🧱 Project Structure (Modules)

### **Gameboard (IIFE)**

* Stores and manages the 1D board array
* Handles setting marks, checking validity, resets
* Contains win condition logic
* Exposes controlled methods only (`getBoard`, `setMark`, `isFull`, etc.)

### **Player Factory**

* Creates player objects with a name and mark ("X" or "O")

### **GameController (IIFE)**

* Manages turn order
* Calls Gameboard to place marks
* Detects wins/draws
* Notifies DisplayController to update UI
* Starts and resets game rounds

### **DisplayController (IIFE)**

* Renders the board to the DOM
* Shows messages (whose turn, win, draw)
* Highlights winning combos
* Handles all click interactions and Reset button

### **Start Screen Module**

* Blocks gameplay until players enter names
* Calls `GameController.start()` with new players

---

## 📁 File Organization

```
project-folder/
│── index.html
│── styles.css
│── app.js
│── README.md
```

---

## 🕹️ How to Play

1. Enter Player 1 and Player 2 names on the start screen.
2. Click **Start Game**.
3. Players take turns clicking squares.
4. The game highlights a winning row or declares a draw.
5. Click **Reset** to restart the game or change player names.

---

## 🧪 Console Debugging (Optional)

Inside the browser console, you can manually test logic:

```js
GameController.start();
GameController.playTurn(0);
GameController.playTurn(1);
Gameboard.getBoard();
```

---

## 🎯 Learning Goals Achieved

* Implemented modular architecture using IIFEs and factories
* Avoided global variables except module references
* Practiced DOM manipulation with clean separation of logic
* Reinforced event-driven programming patterns
* Implemented pure game logic before integrating UI

---

## 📚 Future Improvements (Optional Ideas)

* Scoreboard tracking wins across rounds
* Undo last move
* AI/Computer opponent mode
* Animated transitions or improved UI

---

## 📜 License

This project is free to use, study, and modify for educational or personal purposes.

