document.addEventListener("DOMContentLoaded", function () {
    var scores = readScores();
    var scoreboard = document.getElementById("scoreboard-body");
    scores.forEach(function (score) {
        var row = document.createElement("tr");
        row.innerHTML = `<td class="left">${score.name}</td><td class="center">${score.difficulty}</td><td class="center">${score.time}s</td><td class="right">${new Date(score.timestamp).toLocaleDateString('en-GB')}</td>`;
        scoreboard.appendChild(row);
    });
});
