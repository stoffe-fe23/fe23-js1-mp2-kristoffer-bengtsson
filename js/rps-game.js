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

// Antal millisekunder innan drag-knapparna återställs efter en omgång
const buttonResetTime = 3000;
let buttonResetTimer;

// Antal millisekunder innan Game Over skärmen visas när någon vunnit
const gameOverTime = 2000;
let gameOverTimer;

// Konstanter för hantering av speldrag-värden
const MOVE_NONE = -1;
const MOVE_ROCK = 0;
const MOVE_PAPER = 1;
const MOVE_SCISSORS = 2;

// Konstanter för hantering av vinst/förlust-värden
const WINNER_NEITHER = 0;
const WINNER_PLAYER = 1;
const WINNER_COMP = 2;


// Generera poäng-stjärnor i scoreboard
createScorePoints();


//////////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS
//////////////////////////////////////////////////////////////////////////////////////////

const startButton = document.querySelector("#button-start");
const restartButton = document.querySelector("#button-restart");
const nameForm = document.querySelector("#form-playername");

const gameControls = document.querySelector("#game");
const rockButton = gameControls.querySelector("#button-rock");
const paperButton = gameControls.querySelector("#button-paper");
const scissorsButton = gameControls.querySelector("#button-scissors");

// Rock Paper Scissors knapparna
rockButton.addEventListener("click", moveButtonHandler);
paperButton.addEventListener("click", moveButtonHandler);
scissorsButton.addEventListener("click", moveButtonHandler);


// Event handler för knappen som startar spelet och frågar efter spelarnamn
startButton.addEventListener("click", (event) => {
    const nameDialog = document.querySelector("#namedialog");
    const playerNameInput = document.querySelector("#playername");

    playerNameInput.value = playerName;
    playerNameInput.select();
    nameDialog.showModal();
});


// Event handler för Play Again knappen på Game Over skärmen,
// startar om spelet utan att fråga efter namn igen.
restartButton.addEventListener("click", (event) => {
    startGame();
});


// Event handler för formuläret där spelaren anger sitt namn.
nameForm.addEventListener("submit", (event) => {
    const playerNameInput = document.querySelector("#playername");
    const playerNamePlate = document.querySelector("#score-player > h2");

    playerName = playerNameInput.value;
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
    const rulesBox = document.querySelector("#gamerules");
    const gameBox = document.querySelector("#game");
    const scoreBox = document.querySelector("#gamescore");
    const gameOverBox = document.querySelector("#gameover");
    const gameLogo = document.querySelector("#gamelogo");

    currentRound = 0;
    scorePlayer = 0;
    scoreComp = 0;

    setMoveButtonsDisabled(false);
    showMoves(MOVE_NONE, MOVE_NONE);
    updateScoreboard(true);

    clearTimeout(buttonResetTimer);
    clearTimeout(gameOverTimer);

    scoreBox.classList.add("showbox");
    gameBox.classList.add("showbox");
    rulesBox.classList.remove("showbox");
    gameOverBox.classList.remove("showbox");
    startButton.classList.add("hide-element");

    // Göm topp-bilden på mindre höga skärmar
    if (window.innerHeight < 800) {
        gameLogo.classList.add("hide-element");
    }

    setStatusMessage("Round 1: Choose your move...");
}


////////////////////////////////////////////////////////////////////////
// Hantera en spelomgång - kolla ev. vinnare
function doGameRound(playerMove, compMove) {
    const playerMoveText = getMoveText(playerMove);
    const compMoveText = getMoveText(compMove);

    let winner = getRoundResult(playerMove, compMove);

    currentRound++;

    // Ge poäng och visa vem som vunnit denna omgången i statusraden
    if (winner == WINNER_PLAYER) {
        scorePlayer++;
        setStatusMessage(`<span class="roundinfo-win">Round ${currentRound} - <strong>${playerName.toUpperCase()} WINS:</strong></span> ${playerMoveText} defeats ${compMoveText}.`);
    }
    else if (winner == WINNER_COMP) {
        scoreComp++;
        setStatusMessage(`<span class="roundinfo-loss">Round ${currentRound} - <strong>OPPONENT WINS:</strong></span> ${compMoveText} defeats ${playerMoveText}.`);
    }
    else {
        setStatusMessage(`<span class="roundinfo-tie">Round ${currentRound} - <strong>Tie:</strong></span> ${playerMoveText} is unaffected by ${compMoveText}.`);
    }

    updateScoreboard();
    showMoves(playerMove, compMove, winner);

    // Någon har vunnit spelet - visa game over skärm efter kort fördröjning
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

    // Uppdatera poäng-stjärnorna spelare och dator
    for (let i = 1; i <= victoryPoints; i++) {
        const playerScore = document.querySelector(`#player-points-${i}`);
        const compScore = document.querySelector(`#comp-points-${i}`);

        // Spelarens poäng
        if (i <= scorePlayer) {
            playerScore.classList.add("point-earned");
        }
        else {
            playerScore.classList.remove("point-earned");
        }

        if (i <= scoreComp) {
            compScore.classList.add("point-earned");
        }
        else {
            compScore.classList.remove("point-earned");
        }

        // Datorns poäng
        if (scorePlayer > scoreComp) {
            playerScore.classList.add("leader");
            compScore.classList.remove("leader");
        }
        else if (scoreComp > scorePlayer) {
            playerScore.classList.remove("leader");
            compScore.classList.add("leader");
        }
        else {
            playerScore.classList.remove("leader");
            compScore.classList.remove("leader");
        }
    }

    // Ska det nollställas, eller har någon vunnit spelet? 
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
    const gameBox = document.querySelector("#game");
    const gameOverBox = document.querySelector("#gameover");
    const gameOverText = document.querySelector("#gameover > div");

    if (victory) {
        gameOverBox.classList.add("victory");
    }
    else {
        gameOverBox.classList.remove("victory");
    }

    gameBox.classList.remove("showbox");
    gameOverBox.classList.add("showbox");
    startButton.classList.remove("hide-element");

    startButton.innerText = "Start new game";
    gameOverText.innerText = victory ? "You have won!" : "You lost the game.";

    clearTimeout(gameOverTimer);
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

    const buttonRock = document.querySelector("#button-rock");
    const buttonPaper = document.querySelector("#button-paper");
    const buttonScissors = document.querySelector("#button-scissors");

    // Visa datorns drag
    if (compMove == MOVE_ROCK) {
        moveRock.classList.add("selected-move");
        movePaper.classList.remove("selected-move");
        moveScissors.classList.remove("selected-move");

        setVictoryLossOverlay(moveRock, moveWinner, false);
    }
    else if (compMove == MOVE_PAPER) {
        moveRock.classList.remove("selected-move");
        movePaper.classList.add("selected-move");
        moveScissors.classList.remove("selected-move");

        setVictoryLossOverlay(movePaper, moveWinner, false);
    }
    else if (compMove == MOVE_SCISSORS) {
        moveRock.classList.remove("selected-move");
        movePaper.classList.remove("selected-move");
        moveScissors.classList.add("selected-move");

        setVictoryLossOverlay(moveScissors, moveWinner, false);
    }

    // Visa spelarens drag
    if (playerMove == MOVE_ROCK) {
        buttonRock.classList.remove("dimmed");
        buttonPaper.classList.add("dimmed");
        buttonScissors.classList.add("dimmed");

        setVictoryLossOverlay(buttonRock, moveWinner);
    }
    else if (playerMove == MOVE_PAPER) {
        buttonRock.classList.add("dimmed");
        buttonPaper.classList.remove("dimmed");
        buttonScissors.classList.add("dimmed");

        setVictoryLossOverlay(buttonPaper, moveWinner);
    }
    else if (playerMove == MOVE_SCISSORS) {
        buttonRock.classList.add("dimmed");
        buttonPaper.classList.add("dimmed");
        buttonScissors.classList.remove("dimmed");

        setVictoryLossOverlay(buttonScissors, moveWinner);
    }

    // Nollställ knapparna?
    if ((playerMove == MOVE_NONE) && (compMove == MOVE_NONE)) {
        buttonRock.classList.remove("dimmed");
        buttonPaper.classList.remove("dimmed");
        buttonScissors.classList.remove("dimmed");
        moveRock.classList.remove("selected-move");
        movePaper.classList.remove("selected-move");
        moveScissors.classList.remove("selected-move");

        resetVictoryLossOverlays(moveRock, movePaper, moveScissors, buttonRock, buttonPaper, buttonScissors);
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
// Skapa en bild för varje möjlig poäng i scoreboard för både spelare och datorn
function createScorePoints() {
    const scoreBoxPlayer = document.querySelector("#score-player > div");
    const scoreBoxComp = document.querySelector("#score-comp > div");
    for (let i = 1; i <= victoryPoints; i++) {
        scoreBoxPlayer.appendChild(createScoreElement(i, true));
        scoreBoxComp.appendChild(createScoreElement(i, false));
    }
}


////////////////////////////////////////////////////////////////////////
// Skapa en poäng-bild för spelaren eller datorn (använder inline-SVG i index.html)
function createScoreElement(count, isPlayer = true) {
    const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    newSVG.id = `${isPlayer ? "player" : "comp"}-points-${count}`;
    newSVG.classList.add("points");
    newUse.setAttribute("href", "#points-image");
    newSVG.appendChild(newUse);

    return newSVG;
}