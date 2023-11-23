/*
    Miniprojekt 2 (Rock Paper Scissors) - FE23 Javascript 1
    Kristoffer Bengtsson
*/

let playerName = "";
let currentRound = 0;
let scorePlayer = 0;
let scoreComp = 0;

// Antal poäng som behövs för att vinna spelet
const victoryPoints = 3;

// Antal millisekunder resultatet av en omgång visas innan spelet fortsätter
const buttonResetTime = 3000;
let buttonResetTimer;

// Antal millisekunder innan Game Over skärmen visas när någon vunnit
const gameOverTime = 2000;
let gameOverTimer;

// Konstant-värden för hantering av speldrag
const MOVE_NONE = -1;
const MOVE_ROCK = 0;
const MOVE_PAPER = 1;
const MOVE_SCISSORS = 2;

// Konstant-värden för hantering av vinst/förlust
const WINNER_NEITHER = 0;
const WINNER_PLAYER = 1;
const WINNER_COMP = 2;


// Generera poäng-stjärnor i Scoreboard
createScorePoints();


//////////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS
//////////////////////////////////////////////////////////////////////////////////////////

// Rock Paper Scissors knapparna
const gameControls = document.querySelector("#game");
const rockButton = gameControls.querySelector("#button-rock");
const paperButton = gameControls.querySelector("#button-paper");
const scissorsButton = gameControls.querySelector("#button-scissors");
rockButton.addEventListener("click", moveButtonHandler);
paperButton.addEventListener("click", moveButtonHandler);
scissorsButton.addEventListener("click", moveButtonHandler);


// Event handler för knappen som startar spelet och frågar efter spelarnamn
const startButton = document.querySelector("#button-start");
startButton.addEventListener("click", (event) => {
    const nameDialog = document.querySelector("#namedialog");
    const playerNameInput = document.querySelector("#playername");

    playerNameInput.value = playerName;
    playerNameInput.select();
    nameDialog.showModal();
});


// Event handler för Play Again knappen på Game Over skärmen,
// startar om spelet utan att fråga efter namn igen.
const restartButton = document.querySelector("#button-restart");
restartButton.addEventListener("click", (event) => {
    startGame();
});


// Event handler för formuläret där spelaren anger sitt namn.
const nameForm = document.querySelector("#form-playername");
nameForm.addEventListener("submit", (event) => {
    const playerNameInput = document.querySelector("#playername");
    const playerNamePlate = document.querySelector("#score-player > h2");

    playerName = (playerNameInput.value.length > 1) && (playerNameInput.value.length < 21) ? playerNameInput.value : "Player";
    playerNamePlate.innerText = playerName;

    startGame();
});


// Event-handler för när en RockPaperScissors-knapp blir klickad på
function moveButtonHandler(event) {
    let playerMove;

    // Spelarens drag: Hitta vilken av knapparna spelaren tryckte på
    switch (event.currentTarget.id) {
        case "button-rock": playerMove = MOVE_ROCK; break;
        case "button-paper": playerMove = MOVE_PAPER; break;
        case "button-scissors": playerMove = MOVE_SCISSORS; break;
    }

    // Välj dator-spelarens drag slumpmässigt och genomför spelomgången.
    if (playerMove !== undefined) {
        doGameRound(playerMove, getComputerMove());
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// FUNKTIONER
//////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Starta en ny spelomgång, nollställ poäng och gränssnitt
function startGame() {
    currentRound = 0;
    scorePlayer = 0;
    scoreComp = 0;

    setMoveButtonsDisabled(false);
    showMoves(MOVE_NONE, MOVE_NONE);
    updateScoreboard(true);

    clearTimeout(buttonResetTimer);
    clearTimeout(gameOverTimer);

    startButton.classList.add("hide-element");
    gameControls.classList.add("showbox");
    document.querySelector("#gamescore").classList.add("showbox");
    document.querySelector("#gamerules").classList.remove("showbox");
    document.querySelector("#gameover").classList.remove("showbox");

    // Göm topp-bilden på mindre viewports
    if (window.innerHeight < 800) {
        document.querySelector("#gamelogo").classList.add("hide-element");
    }

    setStatusMessage("Round 1: Choose your move...");
}


////////////////////////////////////////////////////////////////////////
// Hantera en spelomgång - kolla ev. vinnare
function doGameRound(playerMove, compMove) {
    let winner = getRoundResult(playerMove, compMove);
    currentRound++;

    // Ge poäng och beskriv vem som vunnit denna omgången
    if (winner == WINNER_PLAYER) {
        scorePlayer++;
        setStatusMessage(`<span class="roundinfo-win">Round ${currentRound} - <strong>${playerName.toUpperCase()} WINS:</strong></span> ${getMoveText(playerMove)} defeats ${getMoveText(compMove)}.`);
    }
    else if (winner == WINNER_COMP) {
        scoreComp++;
        setStatusMessage(`<span class="roundinfo-loss">Round ${currentRound} - <strong>OPPONENT WINS:</strong></span> ${getMoveText(compMove)} defeats ${getMoveText(playerMove)}.`);
    }
    else {
        setStatusMessage(`<span class="roundinfo-tie">Round ${currentRound} - <strong>Tie:</strong></span> ${getMoveText(playerMove)} matches ${getMoveText(compMove)}.`);
    }

    showMoves(playerMove, compMove, winner);
    updateScoreboard();

    // Någon har vunnit spelet - visa Game Over-skärm efter kort fördröjning
    if ((scorePlayer >= victoryPoints) || (scoreComp >= victoryPoints)) {
        clearTimeout(buttonResetTimer);
        setMoveButtonsDisabled(true);
        gameOverTimer = setTimeout(gameOver, gameOverTime, scorePlayer > scoreComp);
    }
}


////////////////////////////////////////////////////////////////////////
// Uppdatera poängställnings-rutan
function updateScoreboard(doReset = false) {
    const victoryBox = document.querySelector("#score-victory");

    // Uppdatera ställning ned spelarens och datorns poäng
    for (let i = 1; i <= victoryPoints; i++) {
        const playerScoreDot = document.querySelector(`#player-points-${i}`);
        const compScoreDot = document.querySelector(`#comp-points-${i}`);

        // Spelarens poäng
        if (i <= scorePlayer) {
            playerScoreDot.classList.add("point-earned");
        }
        else {
            playerScoreDot.classList.remove("point-earned");
        }

        // Datorns poäng
        if (i <= scoreComp) {
            compScoreDot.classList.add("point-earned");
        }
        else {
            compScoreDot.classList.remove("point-earned");
        }

        // Markera ledarens poäng i gul färg
        if (scorePlayer > scoreComp) {
            playerScoreDot.classList.add("leader");
            compScoreDot.classList.remove("leader");
        }
        else if (scoreComp > scorePlayer) {
            playerScoreDot.classList.remove("leader");
            compScoreDot.classList.add("leader");
        }
        else {
            playerScoreDot.classList.remove("leader");
            compScoreDot.classList.remove("leader");
        }
    }

    // Visa indikator om någon vunnit spelet
    if (doReset) {
        victoryBox.innerText = "";
        victoryBox.classList.remove("victory-player", "victory-comp");
    }
    else if (scorePlayer >= victoryPoints) {
        victoryBox.innerText = "VICTORY!";
        victoryBox.classList.add("victory-player");
    }
    else if (scoreComp >= victoryPoints) {
        victoryBox.innerText = "YOU LOSE!";
        victoryBox.classList.add("victory-comp");
    }
}


////////////////////////////////////////////////////////////////////////
// Välj slumpmässigt vilket drag datorspelaren skall göra.
// Returvärdet motsvarar en MOVE_ konstant.
function getComputerMove() {
    return Math.floor(Math.random() * 3);
}


////////////////////////////////////////////////////////////////////////
// Kolla om spelarens eller dators drag vinner, eller om det blir oavgjort.
// Returvärdet motsvarar en WINNER_ konstant.
function getRoundResult(playerMove, compMove) {
    let result = WINNER_NEITHER;

    if (playerMove == MOVE_ROCK) {
        switch (compMove) {
            case MOVE_ROCK: result = WINNER_NEITHER; break;
            case MOVE_PAPER: result = WINNER_COMP; break;
            case MOVE_SCISSORS: result = WINNER_PLAYER; break;
        }
    }
    else if (playerMove == MOVE_PAPER) {
        switch (compMove) {
            case MOVE_ROCK: result = WINNER_PLAYER; break;
            case MOVE_PAPER: result = WINNER_NEITHER; break;
            case MOVE_SCISSORS: result = WINNER_COMP; break;
        }
    }
    else if (playerMove == MOVE_SCISSORS) {
        switch (compMove) {
            case MOVE_ROCK: result = WINNER_COMP; break;
            case MOVE_PAPER: result = WINNER_PLAYER; break;
            case MOVE_SCISSORS: result = WINNER_NEITHER; break;
        }
    }
    return result;
}


////////////////////////////////////////////////////////////////////////
// Spelet är över, dölj spelrutan och visa Game Over-rutan
function gameOver(victory = false) {
    const gameOverBox = document.querySelector("#gameover");

    if (victory) {
        gameOverBox.classList.add("victory");
    }
    else {
        gameOverBox.classList.remove("victory");
    }

    gameControls.classList.remove("showbox");
    gameOverBox.classList.add("showbox");
    startButton.classList.remove("hide-element");
    startButton.innerText = "New player";
    document.querySelector("#gameover > div").innerText = victory ? "You have won!" : "You lost the game...";
}


////////////////////////////////////////////////////////////////////////
// Hämta text-etikett för ett drag
function getMoveText(move) {
    const textLabels = ["Rock", "Paper", "Scissors"];
    return ((move >= 0) && (move < textLabels.length)) ? textLabels[move] : "Error!";
}


////////////////////////////////////////////////////////////////////////
// Sätt text som skall visas i statusraden nederst
function setStatusMessage(text) {
    const messageBox = document.querySelector("#gamestatus > div");
    messageBox.innerHTML = text;
}


////////////////////////////////////////////////////////////////////////
// Visa spelarens och datorns drag
function showMoves(playerMove, compMove, moveWinner = WINNER_NEITHER) {
    const moveRock = document.querySelector("#comp-rock");
    const movePaper = document.querySelector("#comp-paper");
    const moveScissors = document.querySelector("#comp-scissors");

    // Nollställ knapparna och datorns kort
    moveRock.classList.remove("selected-move");
    movePaper.classList.remove("selected-move");
    moveScissors.classList.remove("selected-move");
    rockButton.classList.remove("dimmed");
    paperButton.classList.remove("dimmed");
    scissorsButton.classList.remove("dimmed");

    // Visa datorns drag
    if (compMove == MOVE_ROCK) {
        moveRock.classList.add("selected-move");
        setVictoryLossOverlay(moveRock, moveWinner, false);
    }
    else if (compMove == MOVE_PAPER) {
        movePaper.classList.add("selected-move");
        setVictoryLossOverlay(movePaper, moveWinner, false);
    }
    else if (compMove == MOVE_SCISSORS) {
        moveScissors.classList.add("selected-move");
        setVictoryLossOverlay(moveScissors, moveWinner, false);
    }

    // Visa spelarens drag
    if (playerMove == MOVE_ROCK) {
        paperButton.classList.add("dimmed");
        scissorsButton.classList.add("dimmed");
        setVictoryLossOverlay(rockButton, moveWinner);
    }
    else if (playerMove == MOVE_PAPER) {
        rockButton.classList.add("dimmed");
        scissorsButton.classList.add("dimmed");
        setVictoryLossOverlay(paperButton, moveWinner);
    }
    else if (playerMove == MOVE_SCISSORS) {
        rockButton.classList.add("dimmed");
        paperButton.classList.add("dimmed");
        setVictoryLossOverlay(scissorsButton, moveWinner);
    }
 
    // Deaktivera knapparna i några sekunder medan omgångens resultat visas och återställ sedan
    if ((playerMove == MOVE_NONE) && (compMove == MOVE_NONE)) {
        resetVictoryLossOverlays(moveRock, movePaper, moveScissors, rockButton, paperButton, scissorsButton);
        setMoveButtonsDisabled(false);
    }
    else {
        setMoveButtonsDisabled(true);
        buttonResetTimer = setTimeout(resetMoveButtons, buttonResetTime);
    }
}


////////////////////////////////////////////////////////////////////////
// Timerfunktion, återställ knapparna inför nästa omgång
function resetMoveButtons() {
    clearTimeout(buttonResetTimer);
    showMoves(MOVE_NONE, MOVE_NONE);
}


////////////////////////////////////////////////////////////////////////
// Aktivera eller deaktivera knapparna för att välja ett drag
function setMoveButtonsDisabled(disabledState) {
    const buttons = document.querySelectorAll("#move-player button");
    for (const button of buttons) {
        button.disabled = disabledState;
    }
}


////////////////////////////////////////////////////////////////////////
// Visa markering på knapp/drag-kort för att indikera vinst/förlust
function setVictoryLossOverlay(element, winner, isPlayer = true) {
    if ((isPlayer && (winner == WINNER_PLAYER)) || (!isPlayer && (winner == WINNER_COMP))) {
        element.classList.add("win");
    }
    else if ((isPlayer && (winner == WINNER_COMP)) || (!isPlayer && (winner == WINNER_PLAYER))) {
        element.classList.add("loss");
    }
}


////////////////////////////////////////////////////////////////////////
// Ta bort vinst/förlust-markeringar från alla angivna knappar/kort
function resetVictoryLossOverlays() {
    for (const arg of arguments) {
        arg.classList.remove("win", "loss");
    }
}


////////////////////////////////////////////////////////////////////////
// Skapa en bild för varje möjlig poäng i scoreboard för både spelare 
// och datorn beroende på victoryPoints konstantens värde.
function createScorePoints() {
    const scoreBoxPlayer = document.querySelector("#score-player > div");
    const scoreBoxComp = document.querySelector("#score-comp > div");
    for (let i = 1; i <= victoryPoints; i++) {
        scoreBoxPlayer.appendChild(createScoreElement(i, true));
        scoreBoxComp.appendChild(createScoreElement(i, false));
    }
}


////////////////////////////////////////////////////////////////////////
// Skapa poäng-bild (använder inline SVG-bild i index.html)
function createScoreElement(count, isPlayer = true) {
    const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    newSVG.id = `${isPlayer ? "player" : "comp"}-points-${count}`;
    newSVG.classList.add("points");
    newUse.setAttribute("href", "#points-image");
    newSVG.appendChild(newUse);

    return newSVG;
}