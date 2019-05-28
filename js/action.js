'use strict';

// Called when a cell (td) is clicked
function cellClicked(el, ev) {
    var elLife;
    if (ev.ctrlKey) {
        showHint(el);
        elLife = document.querySelector('.life');
        runBlinkEl(elLife, 1);
        return;
    }
    checkGameStatus();
    if (!gIsGameRunning) return;
    var cellCoords = getElCoords(el); // Gets i,j position from element as array
    var gBoardCell = gBoard[cellCoords.i][cellCoords.j] // Gets the object from the model
    if (!gGame.shownCount) {
        placeMines(gBoard, cellCoords)
        setAllCellsMinesNegsCount(gBoard);
    }
    if (gBoardCell.isShown || gBoardCell.isMarked || gBoardCell.isUsedLife) return;

    else if (gBoardCell.isMine) {
        renderMineHit(el);

        if (gLivesCount) {
            gLivesCount--;
            renderBoard(gBoard);
            showLives(gLivesCount);
            elLife = document.querySelector('.life');
            if (gLivesCount === 2) runBlinkEl(elLife, 1);
            else if (gLivesCount === 1) runBlinkEl(elLife, 2);
            else if (gLivesCount === 0) runBlinkEl(elLife, 3);
        }
        else {
            gBoard[cellCoords.i][cellCoords.j].isUsedLastLife = true;
            gameOver('mine');
        }
        return;
    }
    else {
        reveal(gBoard, cellCoords);
    }
    checkVictory();
    showLives(gLivesCount);
    renderBoard(gBoard);
}

// Reveals 
function reveal(board, coords) {
    var posI = coords.i
    var posJ = coords.j
    if (board[posI][posJ].minesAroundCount) {
        board[posI][posJ].isShown = true;
        gGame.shownCount++;
        return;
    }
    for (var i = posI - 1; i <= posI + 1; i++) {
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (i < 0 || j < 0) continue;
            if (i >= board.length || j >= board.length) continue;
            var currCell = board[i][j]
            if (currCell.isMine) continue;
            if (currCell.minesAroundCount) {
                if (!currCell.isShown) gGame.shownCount++;
                currCell.isShown = true;
                continue;
            }
            if (!currCell.minesAroundCount && !currCell.isShown) {
                if (!currCell.isShown) gGame.shownCount++;
                currCell.isShown = true;
                reveal(board, { i, j })
            }
        }
    }
}

//Called on right click to mark a cell (suspected to be a mine)
function cellMarked(el) {

    var cellPos = getElCoords(el); // Gets i,j position from element as array
    var gBoardCell = gBoard[cellPos.i][cellPos.j] // Gets the object from the model
    // var cellCountNeededToWin = gLevel.size ** 2 - gLevel.mines;
    if (gBoardCell.isShown) return; // Exists the func if cell is already shown
    if (gBoardCell.isMarked) { // Unmarks if already marked
        gBoardCell.isMarked = false;
        gGame.markedCount--;
        renderBoard(gBoard)
        return;
    } else gBoardCell.isMarked = true; // Updates the model
    gGame.markedCount++;
    renderBoard(gBoard);
    checkVictory();
}
