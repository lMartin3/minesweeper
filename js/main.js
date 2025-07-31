var MAIN_STATE = "main"
var DIFFICULTY_SELECT_STATE = "difficulty"
var currentState = MAIN_STATE;

function goToMainOptions() {
    document.getElementById("main-options").style.display = "flex";
    document.getElementById("difficulty-select").style.display = "none";
    currentState = MAIN_STATE;
}

function goToDifficultySelect() {
    document.getElementById("difficulty-select").style.display = "flex";
    document.getElementById("main-options").style.display = "none";
	currentState = DIFFICULTY_SELECT_STATE;
}

function selectDifficulty(difficulty) {
    document.location.href = `game.html?difficulty=${difficulty}`;
}