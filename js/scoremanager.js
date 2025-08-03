// Disable ES6ConvertVarToLetConst inspection
// such that WebStorm doesn't flood the file with warnings.
// noinspection ES6ConvertVarToLetConst

"use strict";

function savePlayerScore(playerName, difficulty, mines, time, timestamp) {
    var scoreObject = {
        name: playerName,
        difficulty: difficulty,
        mines: mines,
        time: time,
        timestamp: timestamp
    };
    var scores = readScores();
    scores.push(scoreObject);
    saveScores(scores);
}


function readScores() {
    return JSON.parse(localStorage.getItem("minesweeperScores")) || [];
}

function saveScores(scores) {
    localStorage.setItem("minesweeperScores", JSON.stringify(scores));
}