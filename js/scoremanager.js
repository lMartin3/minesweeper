function savePlayerScore(playerName, difficulty, time, timestamp) {
    var scoreObject = {
        name: playerName,
        difficulty: selectedDifficulty,
        time: time,
        timestamp: new Date().toISOString()
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