document.addEventListener("DOMContentLoaded", function () {
    displayScores("date");
});


/**
 * Displays the scores
 * @param sortBy Parameter to sort the scores by. Options are: "date" and "time"
 */
function displayScores(sortBy) {
    var scores = readScores();
    var sortFunction = null;
    switch (sortBy) {
        case "date":
            sortFunction = function (a, b) {
                return a.timestamp - b.timestamp;
            }
            break;
        default:
        case "time":
            sortFunction = function (a, b) {
                return a.time - b.time;
            }
            break;
    }
    scores.sort(sortFunction)
    var scoreboard = document.getElementById("scoreboard-body");
    scoreboard.innerHTML = "";
    var addedScores = 0;
    for (var score of scores) {
        var row = document.createElement("tr");
        row.innerHTML = `<td class="left">${score.name}</td><td class="center">${score.difficulty}</td><td class="center">${score.time}s</td><td class="right">${new Date(score.timestamp).toLocaleDateString("en-GB")}</td>`;
        scoreboard.appendChild(row);
        addedScores++;
        if (addedScores >= 15) break;
    }
}