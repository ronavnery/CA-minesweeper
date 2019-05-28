'use strict';

// Places number of mines according to the level, in random positions
function placeMines(board, clickedPos) {
    // Sets the global level mines according to  size
    if (gLevel.size === 4) gLevel.mines = 2;
    else if (gLevel.size === 8) gLevel.mines = 12;
    else if (gLevel.size === 12) gLevel.mines = 30;

    // Places mines randomly according to level mines count
    // Only on free cells
    var freeCells = getFreeCellsForMines(board, clickedPos)
    for (var i = 0; i < gLevel.mines; i++) {
        var randomIdx = getRandomIntInclusive(0, freeCells.length - 1)
        var randomFreeCell = freeCells.splice(randomIdx, 1)
        var randomI = randomFreeCell[0].i
        var randomJ = randomFreeCell[0].j
        var targetCell = board[randomI][randomJ];
        targetCell.isMine = true;
    }
}

// Gets free cells to place the mines (reverse neg algo)
function getFreeCellsForMines(board, clickedPos) {
    var freeCells = [];
    var posI = clickedPos.i
    var posJ = clickedPos.j
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (i === posI - 1 && j === posJ - 1 ||
                i === posI - 1 && j === posJ ||
                i === posI - 1 && j === posJ + 1 ||
                i === posI && j === posJ - 1 ||
                i === posI && j === posJ ||
                i === posI && j === posJ + 1 ||
                i === posI + 1 && j === posJ - 1 ||
                i === posI + 1 && j === posJ ||
                i === posI + 1 && j === posJ + 1) continue;
            else freeCells.push({ i, j })
        }
    }
    return freeCells;
}

// Sets one cell mine count of neighbours by position
function setMinesNegsCount(board, posI, posJ) {
    var negsMinesCount = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (i < 0 || j < 0) continue;
            if (i >= board.length || j >= board.length) continue;
            if (i === posI && j === posJ) continue;
            if (board[i][j].isMine === true) negsMinesCount++;
        }
    }
    board[posI][posJ].minesAroundCount = negsMinesCount;

}

// Updates whole model with mine count of neighbours
function setAllCellsMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            setMinesNegsCount(board, i, j);
        }
    }
}

// Updates the DOM and updates the model for lifes remeaning
// Shows all mines if no more lifes remaining
function renderMineHit(el) {
    if (gLivesCount) {
        var coords = getElCoords(el)
        gBoard[coords.i][coords.j].isUsedLife = true
        el.classList.add('mine-hit-has-life');
    }
    else {
        el.classList.add('mine-hit')
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isMine) {
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.innerHTML = MINE;
                }
            }
        }
    }
}

// Checking if all mines are flagged to declare game over
function checkAllMinesFlagged(board) {
    var count = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            if (cell.isMine && cell.isMarked) {
                count++;
            }
        }
    }
    if (count === gLevel.mines) return true;
    else return false;
}