document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("play-button").addEventListener("click", goToDifficultySelect);
    document.getElementById("back-button").addEventListener("click", goToMainOptions);
    document.getElementById("easy-button").addEventListener("click", function() {
        selectDifficulty("easy");
    });
    document.getElementById("medium-button").addEventListener("click", function() {
        selectDifficulty("medium");
    });
    document.getElementById("hard-button").addEventListener("click", function() {
        selectDifficulty("hard");
    });
});

function goToMainOptions() {
    document.getElementById("main-options").classList.add("show");
    document.getElementById("difficulty-select").classList.remove("show");
}

function goToDifficultySelect() {
    document.getElementById("main-options").classList.remove("show");
    document.getElementById("difficulty-select").classList.add("show");
}

function selectDifficulty(difficulty) {
    document.location.href = "game.html?difficulty=" + difficulty;
}