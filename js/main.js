function goToMainOptions() {
    document.getElementById("main-options").classList.add("show");
    document.getElementById("difficulty-select").classList.remove("show");

}

function goToDifficultySelect() {
    document.getElementById("main-options").classList.remove("show");
    document.getElementById("difficulty-select").classList.add("show");
}

function selectDifficulty(difficulty) {
    document.location.href = `game.html?difficulty=${difficulty}`;
}