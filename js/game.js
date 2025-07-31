"use strict";

// Transpile or update your codebase to ES5. Make sure to use ES5 syntax only.

var boardComponent = document.getElementById("board");
/*
*   POSSIBLE GAME STATES:
*   SIZE_SELECT
*   IN_GAME
*   GAME_OVER
* */
var DIFFICULTIES = {
    easy: {
        name: "Easy",
        mines: 10,
        size: 8,
        grid_size: 'small',
    },
    medium: {
        name: "Medium",
        mines: 25,
        size: 12,
        grid_size: 'medium',
    },
    hard: {
        name: "Hard",
        mines: 40,
        size: 16,
        grid_size: 'large',
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
    gameGrid.style = `grid-template-columns: repeat(${size}, 1fr); grid-template-rows: repeat(${size}, 1fr); max-width: ${size*1.5}rem;`;
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
                x: x,
                y: y,
                mine: false,
                flag: false,
                revealed: false
            });
        }
        gameRows.push(row);
    }


    refreshBoard();

}


function processClick(isLeftClick, x, y) {
    if (gameState !== "IN_GAME") return;
    if (!didFirstClickOnGrid) {
        generateMines(x, y);
        didFirstClickOnGrid = true;
        timerStart = Date.now();
    }
    var cell = gameRows[y][x];

    if (isLeftClick) {
        if (!cell.mine && !cell.flag) {
            if (!cell.revealed) {
                var exploredCells = [];
                var cellsToExplore = [cell];
                while (cellsToExplore.length > 0) {
                    var currentCell = cellsToExplore.pop();
                    console.log(`${currentCell.x},${currentCell.y} Exploring`);
                    if (currentCell.revealed) continue;
                    currentCell.revealed = true;
                    console.log(currentCell);
                    exploredCells.push(currentCell);
                    var adjacentCells = getAdjacentCells(currentCell.x, currentCell.y);
                    console.log(adjacentCells);
                    if (adjacentCells.some(function (cell) {
                        return cell.mine;
                    })) {
                        console.log(`${currentCell.x},${currentCell.y} While exploring, adjacent mines`);
                        continue;
                    }
                    adjacentCells.forEach(function (adjacentCell) {
                        if (!adjacentCell.revealed && !adjacentCell.flag) {
                            cellsToExplore.push(adjacentCell);
                        }
                    })
                }
            } else {
                adjacentCells = getAdjacentCells(x, y);
                var adjacentMines = adjacentCells.filter(function (cell) {
                    return cell.mine
                }).length;
                var adjacentFlags = adjacentCells.filter(function (cell) {
                    return cell.flag
                }).length;
                if (adjacentFlags >= adjacentMines) {
                    adjacentCells.forEach(function (cell) {
                        if (!cell.flag) {
                            if (cell.mine) {
                                endGame(false);
                            } else {
                                cell.revealed = true
                            }
                        }
                    })
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
    refreshBoard();
    refreshScore();
    flags = gameRows.flat().filter(function (cell) {return cell.flag}).length;
    if (flags === selectedDifficulty.mines) {
        var won = true;
        gameRows.flat().forEach(function (cell) {
            if(cell.mine!==cell.flag) won = false;
        })
        if(won) endGame(true);
    }
}


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
    console.log(gameRows);
}

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
                cellElement.classList.add(`m${adjacentMines}`);
                cellElement.textContent = adjacentMines > 0 ? `${adjacentMines}` : "";
            } else {
                cellElement.classList.remove("revealed");
            }
        }
    }
}

function refreshScore() {
    if(gameState !== "IN_GAME" || !didFirstClickOnGrid) return;
    var scoreElement = document.getElementById("score");
    scoreElement.textContent = `Flags: ${flags} | Time: ${Math.floor((Date.now() - timerStart) / 1000)}s`;
}

function endGame(won) {
    gameState = "GAME_OVER";
    refreshBoard();
    alert(won ? "You won!" : "You lost!");
}