"use strict";

/**
 * Minesweeper Game Implementation
 *
 * This file contains the core game logic for the Minesweeper game.
 * It handles game initialization, difficulty selection, board generation,
 * game state management, and user interactions.
 *
 * The code is written in ES5 for maximum browser compatibility.
 */

var boardComponent = document.getElementById("board");
/*
*   POSSIBLE GAME STATES:
*   SIZE_SELECT
*   IN_GAME
*   GAME_OVER
* */
var DIFFICULTIES = {
    easy: {
        name: "Easy", mines: 10, size: 8, grid_size: 'small',
    }, medium: {
        name: "Medium", mines: 25, size: 12, grid_size: 'medium',
    }, hard: {
        name: "Hard", mines: 40, size: 16, grid_size: 'large',
    }
};

var gameState = "SIZE_SELECT";
var didFirstClickOnGrid = false;
var MIN_SIZE = 5;
var MAX_SIZE = 20;
var gameRows = [];
var selectedDifficulty = null;
var flags = 0;
var timerStart = 0;

document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var difficultyParam = params.get('difficulty');
    if (difficultyParam && DIFFICULTIES[difficultyParam]) {
        selectDifficulty(DIFFICULTIES[difficultyParam]);
    } else {
        startSizeSelectState();
    }
    setInterval(function () {
        refreshScore();
    }, 1000)
});

function startSizeSelectState() {
    gameState = "SIZE_SELECT";
    boardComponent.innerHTML = "";
    Object.keys(DIFFICULTIES).forEach(function (key) {
        var difficulty = DIFFICULTIES[key];
        var button = document.createElement("button");
        button.onclick = (function (difficultyValue) {
            return function () {
                selectDifficulty(difficultyValue);
            };
        })(difficulty);
        button.textContent = difficulty.name + " (" + difficulty.size + "x" + difficulty.size + ", " + difficulty.mines + " mines)";
        boardComponent.appendChild(button);
    });
}


function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    gameState = "IN_GAME";
    boardComponent.innerHTML = "";
    gameRows = [];
    didFirstClickOnGrid = false;
    flags = 0;
    var gameGrid = document.createElement("div");
    gameGrid.classList.add("game-grid");
    gameGrid.classList.add(difficulty.grid_size);
    var size = difficulty.size;
    gameGrid.style = "grid-template-columns: repeat(" + size + ", 1fr); grid-template-rows: repeat(" + size + ", 1fr); max-width: " + (size * 1.5) + "rem;";
    boardComponent.appendChild(gameGrid);
    for (var y = 0; y < size; y++) {
        var row = [];
        for (var x = 0; x < size; x++) {
            var cell = document.createElement("div");
            cell.classList.add("game-grid-cell");
            cell.textContent = x + "," + y;
            cell.id = "cell_" + x + "_" + y;
            cell.addEventListener("click", (function (x, y) {
                return function () {
                    processClick(true, x, y);
                };
            })(x, y));
            cell.addEventListener("contextmenu", (function (x, y) {
                return function (e) {
                    e.preventDefault();
                    processClick(false, x, y);
                };
            })(x, y));
            gameGrid.appendChild(cell);
            row.push({
                x: x, y: y, mine: false, flag: false, revealed: false
            });
        }
        gameRows.push(row);
    }


    refreshBoard();

}


/**
 * Processes a click on a cell in the game grid
 *
 * @param {boolean} isLeftClick - Whether the click was a left click (true) or right click (false)
 * @param {number} x - x of the clicked cell
 * @param {number} y - y of the clicked cell
 */
function processClick(isLeftClick, x, y) {
    if (gameState !== "IN_GAME") return;
    if (!didFirstClickOnGrid) {
        generateMines(x, y);
        timerStart = Date.now();
    }
    var cell = gameRows[y][x];

    if (isLeftClick || !didFirstClickOnGrid) {
        didFirstClickOnGrid = true;
        if (!cell.mine && !cell.flag) {
            if (!cell.revealed) {
                revealCellAndExplore(cell);
            } else {
                var adjacentCells = getAdjacentCells(x, y);
                var adjacentMines = adjacentCells.filter(function (cell) {
                    return cell.mine
                }).length;
                var adjacentFlags = adjacentCells.filter(function (cell) {
                    return cell.flag
                }).length;
                if (adjacentFlags >= adjacentMines) {
                    adjacentCells.forEach(function (c) {
                        if (!c.flag) {
                            if (c.mine) {
                                endGame(false);
                            } else {
                                revealCellAndExplore(c);
                            }
                        }
                    });
                }
            }
        } else if (cell.mine) {
            endGame(false)
        }
    } else {
        if (!cell.revealed) {
            cell.flag = !cell.flag;
        }
    }
    flags = gameRows.flat().filter(function (cell) {
        return cell.flag
    }).length;
    refreshBoard();
    refreshScore();
    var won = true;
    gameRows.flat().forEach(function (cell) {
        if (!cell.mine && !cell.revealed) won = false;
    })
    if (won) endGame(true);

}

/**
 * Reveals a cell and explores adjacent cells recursively if there are no adjacent mines. Uses BFS
 *
 * @param {Object} cell - The cell to reveal and explore from
 */
function revealCellAndExplore(cell) {
    var exploredCells = [];
    var cellsToExplore = [cell];
    while (cellsToExplore.length > 0) {
        var currentCell = cellsToExplore.pop();
        if (currentCell.revealed) continue;
        currentCell.revealed = true;
        exploredCells.push(currentCell);
        var adjacentCells = getAdjacentCells(currentCell.x, currentCell.y);
        if (adjacentCells.some(function (cell) {
            return cell.mine;
        })) {
            continue;
        }
        adjacentCells.forEach(function (adjacentCell) {
            if (!adjacentCell.revealed && !adjacentCell.flag && !adjacentCell.mine) {
                cellsToExplore.push(adjacentCell);
            }
        })
    }
}


/**
 * Gets the adjacent cells to a certain cell in the specified coordinates
 * @param x cell x
 * @param y cell y
 * @returns {*[]} array of adjacent cells
 */
function getAdjacentCells(x, y) {
    var cells = [];
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i >= 0 && i < selectedDifficulty.size && j >= 0 && j < selectedDifficulty.size) {
                cells.push(gameRows[j][i]);
            }
        }
    }
    return cells;
}

/**
 * Generates the mines taking into consideration the initial cell clicked, such that the player
 * doesn't lose immediately
 * @param initialX X of the initial cell
 * @param initialY Y of the initial cell
 */
function generateMines(initialX, initialY) {
    var addedMines = 0;
    while (addedMines < selectedDifficulty.mines) {
        var x = Math.floor(Math.random() * selectedDifficulty.size);
        var y = Math.floor(Math.random() * selectedDifficulty.size);
        var cell = gameRows[y][x];
        if (!cell.mine && x !== initialX && y !== initialY) {
            cell.mine = true;
            addedMines++;
        }
    }
}

/**
 * Refreshes the board
 */
function refreshBoard() {
    var isGameOver = gameState == "GAME_OVER";
    for (var y = 0; y < selectedDifficulty.size; y++) {
        for (var x = 0; x < selectedDifficulty.size; x++) {
            var cell = gameRows[y][x];
            var cellElement = document.getElementById("cell_" + x + "_" + y);
            if (cell.mine && isGameOver) {
                cellElement.classList.add("mine");
                cellElement.textContent = "X";
            } else {
                cellElement.classList.remove("mine");
            }
            if (cell.flag) {
                cellElement.classList.add("flag");
                cellElement.textContent = "🚩";
            } else {
                cellElement.classList.remove("flag");
                cellElement.textContent = "";
            }

            var adjacentMines = getAdjacentCells(x, y).filter(function (cell) {
                return cell.mine;
            }).length;
            if (cell.revealed) {
                cellElement.classList.add("revealed");
                cellElement.classList.add("m" + adjacentMines);
                cellElement.textContent = adjacentMines > 0 ? adjacentMines.toString() : "";
            } else {
                cellElement.classList.remove("revealed");
            }
        }
    }
}

/**
 * Refreshes the game score, only works if the game is already started and the first cell has been revealed
 */
function refreshScore() {
    if (gameState !== "IN_GAME" || !didFirstClickOnGrid) return;
    var scoreElement = document.getElementById("score");
    scoreElement.textContent = flags + " 🚩 | " + (selectedDifficulty.mines - flags) + " 💣 | " + Math.floor((Date.now() - timerStart) / 1000) + "s";
}

/**
 * Marks the game as ended and shows the result modal
 * @param won
 */
function endGame(won) {
    gameState = "GAME_OVER";
    refreshBoard();
    toggleModal(true, won);
}

function closeModal() {
    toggleModal(false, false);
}

/**
 * Opens or closes the result modal
 * @param open Whether the modal should be open or not
 * @param won If the modal opens, whether to display the win title and form (true) or lose title (false).
 */
function toggleModal(open, won) {
    var modal = document.getElementById("end-modal");
    if (!open) {
        modal.classList.remove("show");
        return;
    }
    modal.classList.add("show");
    var modalContent = document.getElementById("end-modal-content");
    var modalTitle = document.getElementById("end-modal-title");
    var modalDifficulty = document.getElementById("modal-difficulty");
    var modalTime = document.getElementById("modal-time");
    var gameTime = Math.floor((Date.now() - timerStart) / 1000);

    modalTitle.textContent = won ? "You won!" : "You lost!";
    modalDifficulty.textContent = "Difficulty: " + selectedDifficulty.name;
    modalTime.textContent = "Time: " + gameTime + "s";
    var finishTimestamp = Date.now();

    modal.classList.add("show");

    var winForm = document.getElementById("win-form");
    if (won) {
        modalContent.classList.remove("lose");
        modalContent.classList.add("win");
        winForm.classList.add("show");

        // Remove any existing event listeners by cloning and replacing the form
        var oldWinForm = winForm;
        var newWinForm = oldWinForm.cloneNode(true);
        oldWinForm.parentNode.replaceChild(newWinForm, oldWinForm);
        winForm = newWinForm;

        winForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var playerName = document.getElementById("player-name").value;
            if (!playerName) return;
            savePlayerScore(playerName, selectedDifficulty.name, selectedDifficulty.mines, gameTime, finishTimestamp);
            modal.classList.remove("show");
            window.location.href = "index.html";
        });
    } else {
        modalContent.classList.remove("win");
        modalContent.classList.add("lose");
        winForm.classList.remove("show");
    }


}

function restartGame() {
    closeModal()
    selectDifficulty(selectedDifficulty);
    document.getElementById("score").textContent = "Click anywhere on the board to begin";
}