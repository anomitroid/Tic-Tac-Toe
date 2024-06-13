const container = document.getElementById ("game-board");
const modalBG = document.querySelector (".modal-bg");

const displayGmeBoard = (() => {
    for (let i = 0; i < 3; i ++) {
        let primaryIndex = i.toString ();
        for (let j = 0; j < 3; j ++) {
            let secondaryIndex = j;
            let index = primaryIndex + secondaryIndex;
            const gridButton = document.createElement ("button");
            gridButton.classList.add ("board-spaces");
            gridButton.dataset.index = index;
            container.appendChild (gridButton);
        }
    }
}) ();

const boardSpaces = document.querySelectorAll (".board-spaces");

const boardFactory = () => {
    let gameBoard = [];
    for (let i = 0; i < boardSpaces.length; i ++) {
        let index = boardSpaces[i].dataset.index;
        gameBoard.push (index);
    }

    const removeIndex = (index) => gameBoard.splice (index, 1);

    const winCheck = (mark) => {
        let board = [];
        for (let i = 0; i < boardSpaces.length; i ++) board.push (boardSpaces[i].textContent);
        if (winROW (board, mark) || winCOL (board, mark) || winDIAG (board, mark)) return true;
    }

    const drawCheck = () => {
        let board = [];
        for (let i = 0; i < boardSpaces.length; i ++) board.push (boardSpaces[i].textContent);
        for (let i = 0; i < board.length; i ++) if (board[i] == "") return false;
        return true;
    }

    const winROW = (board, mark) => {
        for (let i = 0; i < boardSpaces.length; i +=3) {
            let row = board.slice (i, i + 3);
            if (row.every (element => element == mark)) return true;
        }
    }

    const winCOL = (board, mark) => {
        for (let i = 0; i < 3; i ++) {
            let col = [board[i], board[i + 3], board[i + 6]];
            if (col.every (element => element == mark)) return true;
        }
    }

    const winDIAG = (board, mark) => {
        let diag = [board[0], board[4], board[8]];
        if (diag.every (element => element == mark)) return true;
        diag = [board[2], board[4], board[6]];
        if (diag.every (element => element == mark)) return true;
    }

    return { gameBoard, removeIndex, winCheck, drawCheck };
};

const playerFactory = (name, mark) => {
    const makeMove = (board, boardSpace) => {
        boardSpace.textContent = mark;
        board.removeIndex (board.gameBoard.indexOf (boardSpace.dataset.index));
        addStyle (boardSpace);
    }
    return { name, mark, makeMove };
};

const addStyle = (div) => {
    div.style.cursor = "default";
    div.style.animationName = "text";
    div.style.animationDuration = "0.5s";
    div.style.pointerEvents = "none";
    if (div.textContent == "X") div.style.color = "#a2d2ffff";
    else div.style.color = "#ffafccff";
};

const aiPlayer = (name, mark) => {
    const makeMove = (board) => {
        let randomIndex = Math.floor (Math.random () * board.gameBoard.length);
        let aiChoice = board.gameBoard[randomIndex];
        for (let i = 0; i < boardSpaces.length; i ++) {
            if (boardSpaces[i].dataset.index == aiChoice) {
                boardSpaces[i].textContent = mark;
                addStyle (boardSpaces[i]);
            }
        }
        board.removeIndex (board.gameBoard.indexOf (aiChoice));
    };
    return { name, mark, makeMove };
};

const game = (() => {
    let player = playerFactory ("Player", "X");
    let ai = aiPlayer ("Bot", "O");
    let board = boardFactory ();

    let currentPlayer = player;
    const runGame = (e) => {
        if (currentPlayer == player) {
            if (e.target.textContent == "") {
                let boardSpace = e.target;
                player.makeMove (board, boardSpace);
                if (board.winCheck (player.mark)) {
                    setTimeout (() => {
                        displayModal (player.name);
                    }, 1000);
                    return false;
                }
                currentPlayer = ai;
            }
        }

        setTimeout (() => {
            ai.makeMove (board);
            if (board.winCheck (ai.mark)) {
                setTimeout (() => {
                    displayModal (ai.name);
                }, 800);
                return false;
            }
        }, 800);

        currentPlayer = player;

        if (!board.winCheck (player.mark) && !board.winCheck (ai.mark)) {
            if (board.drawCheck ()) {
                setTimeout (() => {
                    displayModal ("Draw");
                }, 1000);
                return false;
            }
        }
    };

    for (let i = 0; i < boardSpaces.length; i ++) {
        boardSpaces[i].addEventListener ("click", runGame);
    }
}) ();

const resetGame = () => {
    location.reload ();
}

const displayModal = (name) => {
    modalBG.style.display = "block";
    const winnerDisplay = document.getElementById ("winner");
    if (name == "Draw") winnerDisplay.textContent = "Draw";
    else winnerDisplay.textContent = `${name} Wins!`;
    const restartButton = document.getElementById ("restart");
    restartButton.addEventListener ("click", () => resetGame ());
    restartButton.style.pointerEvents = "auto";
};
