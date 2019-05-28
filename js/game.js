'use strict';

const MINE = '💥';
const MARKED = '🚩';
const WIN_SMILEY = '😎';
const LOST_SMILEY = '😖';
const DEFAULT_SMILEY = '🙂'

var gLevel = {
    size: 0, // Size of board
    mines: 0// How many mines on board
}
var gBoard;
var gGame = {
    isOn: false, // When true we let the player play
    shownCount: 0, // How many cells are shown
    markedCount: 0, // How many cells are marked (flagged)
    secsPassed: 0 // How many seconds passed
}
var gStartTime;
var gGameInterval;
var gLivesCount;
var gIsGameRunning;
var gNumOfHintsLeft;

// Procedure to initialize the game
function init(size) {
    gIsGameRunning = true;
    gLevel.size = size;
    gNumOfHintsLeft = 3;
    resizeBoard();
    resetGame();
    clearInterval(gGameInterval)
    renderBoard(gBoard);
    renderMinesCountOnLevel(size);
}

// Procedure to reset the game, determines how many lifes available
function resetGame() {
    gBoard = buildBoard();
    gGame.shownCount = 0;
    gGame.isOn = false;
    gLivesCount = 3;
}

// Changes table size in DOM according to the game size (gLevel.size)
function resizeBoard() {
    var elTable = document.querySelector('table');
    if (gLevel.size === 4) elTable.style.width = elTable.style.height = '300px';
    else if (gLevel.size === 8) elTable.style.width = elTable.style.height = '400px';
    else if (gLevel.size === 12) elTable.style.width = elTable.style.height = '500px';
}

// Builds the board ,Set mines at random locations ,Call setMinesNegsCount()
// Returns the created board
function buildBoard() {
    var size = gLevel.size
    var board = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (let j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isUsedLife: false,
                isMarked: false,
            }
            row.push(cell)
        }
        board.push(row)
    }
    return board;
}

//Render the board as a <table> to the page
function renderBoard(board) {
    var elGameInfoStr = getInitalTableElStr();
    var strHtml = elGameInfoStr
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var cellDisplay = '';
            if (cell.isShown) var cellClass = 'floor';
            if (cell.isUsedLife) cellDisplay = MINE;
            if (cell.isMarked) cellDisplay = MARKED;
            if (cell.isShown && cell.isMine) cellDisplay = MINE;
            if (cell.minesAroundCount && !cell.isMine && cell.isShown) {
                cellDisplay = cell.minesAroundCount
                // sets the color of the numbers:
                for (let x = 1; x <= 6; x++) {
                    if (cell.minesAroundCount === x) cellClass = `num${x} floor`
                }
            }
            strHtml += `\t<td  class="${cellClass} clickable cell cell-${i}-${j}" 
                        oncontextmenu="cellMarked(this);return false;"
                        onclick="cellClicked(this, event)">${cellDisplay}</td>\n`
            cellClass = '';
        }
        strHtml += '</tr>'
    }
    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHtml
}


function toggleGameRunning() {
    gIsGameRunning = !gIsGameRunning
}

// Starting game if status is off
function checkGameStatus() {
    if (!gGame.isOn && gGame.shownCount === 0) {
        gStartTime = Date.now();
        gGameInterval = setInterval(showTime, 1000)
        gGame.isOn = true;
    } else return false;
}

// Game ends when all mines are marked and all the other cells are shown
function checkVictory() {
    var isAllMinesFlagged = checkAllMinesFlagged(gBoard);
    var cellCountNeededToWin = gLevel.size ** 2 - gLevel.mines
    if (gGame.shownCount === cellCountNeededToWin &&
        isAllMinesFlagged) {
        gameOver('victory');
        return true;
    }
}

// Ends the game, stops interval and updates DOM
function gameOver(cause) {
    gGame.isOn = false;
    toggleGameRunning();
    clearInterval(gGameInterval)
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = `${gGame.secsPassed}s`;

    var elLife = document.querySelector('.life');
    var elSmiley = document.querySelector('.smiley');
    if (cause === 'victory') {
        elSmiley.innerHTML = WIN_SMILEY;
        elLife.innerHTML = 'YOU ARE AWESOME!'
        elLife.classList.add('life-victory');
        runBlinkEl(elLife, 10)
    }
    else {
        elSmiley.innerHTML = LOST_SMILEY;
        elLife.innerHTML = 'GAME OVER, BETTER TRY PAC-MAN.'
        elLife.classList.add('life-lose')
        runBlinkEl(elLife, 10)
    }
}

// Updates the DOM with the game time
function showTime() {
    var elTimer = document.querySelector('.timer');
    gGame.secsPassed = parseInt((Date.now() - gStartTime) / 1000);
    elTimer.innerHTML = `${gGame.secsPassed}s`
}

// Updates the DOM with game lives
function showLives() {
    var lifeMsg;
    // gLivesCount = num;
    // var elLife = document.querySelector('.life');
    if (gLivesCount === 1) lifeMsg = `${gLivesCount} LIFE LEFT `;
    else if (!gLivesCount) lifeMsg = `NO MORE LIVES `;
    else lifeMsg = `${gLivesCount} LIVES LEFT `;

    if (gNumOfHintsLeft === 1) lifeMsg += `| 1 HINT LEFT`
    else if (!gNumOfHintsLeft) lifeMsg += `| NO MORE HINTS`
    else lifeMsg += `| ${gNumOfHintsLeft} HINTS LEFT`
    return lifeMsg;
}

// Updates the dom with the mines count accodring to level size
function renderMinesCountOnLevel(initNum) {
    var minesCount;
    if (initNum === 4) minesCount = 2;
    else if (initNum === 8) minesCount = 12;
    else minesCount = 30;
    var elMines = document.querySelector('.mines');
    elMines.innerHTML = `${minesCount}${MINE}`
}

// Gets the inital string of "life,mines,smiley,time" for table render
function getInitalTableElStr() {
    var colSpanMines;
    var colSpanSmiley;
    var colSpanTime;
    if (gLevel.size === 4) {
        colSpanMines = 1
        colSpanSmiley = 2
        colSpanTime = 1
    }
    else if (gLevel.size === 8) {
        colSpanMines = 3
        colSpanSmiley = 2
        colSpanTime = 3
    }
    else if (gLevel.size === 12) {
        colSpanMines = 4
        colSpanSmiley = 4
        colSpanTime = 4
    }
    var lifeHtml;
    if (gGame.isOn) lifeHtml = showLives()
    else lifeHtml = 'All ready, you know what to do...<br>You can also hold CTRL for a hint'
    var str = `<tr><td colspan="${gLevel.size}" class="life">${lifeHtml}</td></tr>
                <tr><td colspan="${colSpanMines}" class="mines">${gLevel.mines}${MINE}</td>
                <td colspan="${colSpanSmiley}" class="clickable smiley" onclick="init(${gLevel.size})">${DEFAULT_SMILEY}</td>
                <td colspan="${colSpanTime}" class="timer"></td>
                </tr>`
    return str;
}

// 
function showHint(el) {
    if (!gNumOfHintsLeft || !gGame.isOn) return;
    gNumOfHintsLeft--;
    var elCoords = getElCoords(el);
    var posI = elCoords.i;
    var posJ = elCoords.j;
    for (var i = posI - 1; i <= posI + 1; i++) {
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (i < 0 || j < 0) continue;
            if (i >= gBoard.length || j >= gBoard.length) continue;
            var cell = gBoard[i][j];
            if (cell.isShown) continue;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            var elCellHTMLBeforeHint = elCell.innerHTML
            var elCellStyleBeforeHint = elCell.style
            if (cell.isMine) {
                elCell.innerHTML = MINE;
                elCell.classList.add('hint');
            }
            else if (cell.minesAroundCount) {
                elCell.innerHTML = cell.minesAroundCount;
                elCell.classList.add('hint');
            }
            elCell.style.color = 'white';
            hintDelay(elCell, elCellHTMLBeforeHint, elCellStyleBeforeHint);
        }
    }
}

function hintDelay(el, initialHtml, initialStyle) {
    setTimeout(function() {
        el.innerHTML = initialHtml;
        el.style = initialStyle;
        renderBoard(gBoard);
    }, 1500)
}