function savePlayerScore(playerName, difficulty, mines, time, timestamp) {
    var scoreObject = {
        name: playerName,
        difficulty: mines,
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