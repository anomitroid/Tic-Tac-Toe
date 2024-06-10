const playerFactory = (nickname, choice) => {
    const getNickname = () => nickname;
    const getChoice = () => choice;
    return { getNickname, getChoice }; 
}

(function () {
    const gameMode = document.querySelector ('.modal.game-mode');
    const nickNames = document.querySelector ('.modal.nicknames');
    const gameOver = document.querySelector ('.modal.game-over');
    const game = document.querySelector ('.game');

    let isPVE = false;

    function _switchParentWrapper (from, to) {
        from.parentElement.style.display = 'none';
        to.parentElement.style.display = "";
    }

    function _startNewGame () {
        const [firstPlayer, secondPlayer] = (() => {
            const [firstNickname, secondNickname] = (() => {
                return (function _getNicknames () {
                    function _validate (first, second) {
                        if (first == "") first = "Player 1";
                        if (second == "") {
                            second = "Player 2";
                            if (isPVE) second += "-PC";
                        }
                        return [first, second];
                    }

                    const first = document.getElementById ('first-player-nickname').value;
                    const second = document.getElementById ('second-player-nickname').value;
                    return [..._validate (first, second)];
                }) ();
            }) ();

            return (function _getPlayers () {
                let firstPlayer = playerFactory (firstNickname, 'X');
                let secondPlayer = playerFactory (secondNickname, 'O');
                return [firstPlayer, secondPlayer]; 
            }) ();
        }) ();

        _switchParentWrapper (nickNames, game);
        const gameBoard = ((firstPlayer, secondPlayer) => {
            let board = ['', '', '', '', '', '', '', '', ''];
            let winner = null;

            const firstPlayerChoice = firstPlayer.getChoice ();
            const secondPlayerChoice = secondPlayer.getChoice ();

            let currentPlayerChoice = null;

            function _playNextPlayer () {
                if (currentPlayerChoice == firstPlayerChoice) currentPlayerChoice = secondPlayerChoice;
                else currentPlayerChoice = firstPlayerChoice;
            }

            function _playPC () {
                function _getEmptySpots (board) {
                    return board.map ((element, i) => {
                        if (element == '') return i
                    }).join ('').split ('');
                }

                function _getBestMove (newBoard, playerChoice) {
                    const emptyBoard = _getEmptySpots (newBoard);
                    let score = 0;

                    const winner = _checkForWinner (newBoard);
                    if (winner) {
                        if (winner == firstPlayer.getNickname ()) score = -10;
                        else if (winner == secondPlayer.getNickname ()) score = 10;
                        else score = 0;
                        return { score };
                    }
                
                    const moves = [];

                    for (let i = 0; i < emptyBoard.length; i ++) {
                        let nextBoard = [...newBoard];
                        nextBoard [emptyBoard [i]] = currentPlayer;
                        let bestMove = null;
                        if (playerChoice == 'O') bestMove = _getBestMove (nextBoard, 'X');
                        else bestMove = _getBestMove (nextBoard, 'O');
                        moves.push ({ index : emptyBoard [i], score : bestMove.score });  
                    }

                    let bestMove = {};

                    if (playerChoice == 'O') {
                        bestMove = moves.reduce ((current, previous) => {
                            if (current.score < previous.score) current = previous;
                            return current;
                        });
                    }
                    else {
                        bestMove = moves.reduce ((current, previous) => {
                            if (current.score > previous.score) current = previous;
                            return current;
                        });
                    }

                    return bestMove;
                }

                return _getBestMove ([...board], 'O').index;
            }

            function getPCMoveIndex () {
                return _playPC ();
            }

            function hasWinner () {
                if (winner) return true;
                return falsel
            }

            function getWinnerName () {
                return winner;
            }

            function _checkForWinner (board) {
                function _findwinner (condition) {
                    function _getValue (i1, i2, i3) {
                        return board [i1] + board [i2] + board [i3];
                    }
                    function _win (value) {
                        return value == condition;
                    }

                    if (
                        _win (_getValue (0, 1, 2)) ||
                        _win (_getValue (3, 4, 5)) ||
                        _win (_getValue (6, 7, 8)) ||
                        _win (_getValue (0, 3, 6)) ||
                        _win (_getValue (1, 4, 7)) ||
                        _win (_getValue (2, 5, 8)) ||
                        _win (_getValue (0, 4, 8)) ||
                        _win (_getValue (2, 4, 6))
                    ) return true;
                }
                const firstCondition = "XXX";
                const secondCondition = "OOO";
                if (_findwinner (firstCondition)) return firstPlayer.getNickname ();
                else if (_findwinner (secondCondition)) return secondPlayer.getNickname ();
                else if (!board.includes ('')) return 'draw';
                return null;
            }

            function getCurrentPlayerChoice () {
                _playNextPlayer ();
                return currentPlayerChoice;
            }

            function getNameofPlayer (player) {
                if (player == "first") return firstPlayer.getNickname ();
                if (player == "second") return secondPlayer.getNickname ();
            }

            function getValueOf (index) {
                return board [index];
            }

            function setValueOf (index) {
                board [index] = currentPlayerChoice;
                winner = _checkForWinner (board);
            }

            return { getValueOf, setValueOf, getCurrentPlayerChoice, getNameofPlayer, hasWinner, getWinnerName, getPCMoveIndex };
        }) (firstPlayer, secondPlayer);

        const displayController = ((gameBoard) => {
            const board = document.querySelector ('.game-board');

            function _currentBoardHandler (e) {
                if (e.target.classList.contains ('box')) _setPlayerChoice (e.target);
            }

            function _setPlayerChoice (element) {
                function _endGame (result) {
                    const over = document.querySelector ('.modal.game-over');
                    _switchParentWrapper (game, over);
                    const winDisplay = over.querySelector ('.gg');
                    if (result == 'drw') winDisplay.textContent = `The Game is a ${result}`;
                    else winDisplay.textContent = `The Winner is ${result}`;
                }

                function _playGame (gridDiv) {
                    const currentChoice = gameBoard.getCurrentPlayerChoice ();
                    gridDiv.textContent = currentChoice;
                    _setChoiceColor (gridDiv, currentChoice);
                    _switchColorPanel (currentChoice);
                    gameBoard.setValueOf (element.dataset.id);
                    if (isPVE) {
                        function _setPCMove (id) {
                            [...board.children].forEach (element => {
                                if (element.dataset.id == id) {
                                    const currentChoice = gameBoard.getCurrentPlayerChoice ();
                                    element.firstElementChild.textContent = currentChoice;
                                    _setChoiceColor (element.firstElementChild, currentChoice);
                                    _switchColorPanel (currentChoice);
                                    gameBoard.setValueOf (id);
                                }
                            });
                        }
                        const id = gameBoard.getPCMoveIndex ();
                        _setPCMove (id);
                    }
                }

                function _setChoiceColor (gridDiv, choice) {
                    if (choice == 'X') gridDiv.style = 'color: rgb(60, 253, 76);';
                    else gridDiv.style = 'color: rgb(192, 97, 247);';
                }
                function _switchColorPanel (choice) {
                    const first = document.querySelector ('.player-info.first-player');
                    const second = document.querySelector ('.player-info.second-player');
                    if (choice == 'X') {
                        second.style = 'background: rgb(103, 58, 183);';
                        first.style = '';
                    }
                    else {
                        first.style = 'background: rgb(103, 58, 183);';
                        second.style = '';
                    }
                }

                const gridDiv = element.querySelector ('span');
                if (gridDiv.textContent == '') {
                    _playGame (gridDiv);
                    if (gameBoard.hasWinner ()) _endGame (gameBoard.getWinnerName ());
                }
            }

            function _renderNickNames () {
                const firstName = document.querySelector ('.player-info.first-player .nick-name');
                const secondName = document.querySelector ('.player-info.second-player .nick-name');
                firstName.textContent = gameBoard.getNameofPlayer ('first');
                secondName.textContent = gameBoard.getNameofPlayer ('second');
            }

            function _renderBoard () {
                board.querySelectorAll ('.box').forEach ((element, i) => {
                    element.querySelector ('span').textContent = gameBoard.getValueOf (i);
                });
            }

            function _setClearGameHandler () {
                function _clearHandler (e) {
                    board.removeEventListener ('click', _currentBoardHandler);
                    e.target.removeEventListener ('click', _clearHandler);
                }

                document.querySelectorAll ('.new-game').forEach (newGameButton => {
                    newGameButton.addEventListener ('click', _clearHandler);
                });
                document.querySelectorAll ('.reset-game').forEach (resetGameButton => {
                    resetGameButton.addEventListener ('click', _clearHandler);
                });
            }

            function _createNewHandler () {
                _setClearGameHandler ();
                board.addEventListener ('click', _currentBoardHandler);
            }
            function _setDefaultColorPanel () {
                document.querySelector ('.player-info.first-player').style = 'background: rgb(103, 58, 183);';
                document.querySelector ('.player-info.second-player').style = '';
            }

            function renderNewGame () {
                _createNewHandler ();
                _renderNickNames ();
                _renderBoard ();
                _setDefaultColorPanel ();
            }
            return { renderNewGame };
        }) (gameBoard);

        displayController.renderNewGame ();
    }

    gameMode.querySelector ('.pvp-mode').addEventListener ('click', () => {
        isPVE = false;
        _switchParentWrapper (gameMode, nickNames);
    });
    gameMode.querySelector ('.pve-mode').addEventListener ('click', () => {
        isPVE = true;
        _switchParentWrapper (gameMode, nickNames);
    });
    nickNames.querySelector ('.back').addEventListener ('click', () => {
        _switchParentWrapper (nickNames, gameMode);
    });
    nickNames.querySelector ('.next').addEventListener ('click', _startNewGame ());

    document.querySelectorAll ('.new-game').forEach (newGameButton => {
        newGameButton.addEventListener ('click', () => {
            _startNewGame ();
            _switchParentWrapper (gameOver, game);
        });
    });

    document.querySelectorAll ('.reset-game').forEach (resetGameButton => {
        resetGameButton.addEventListener ('click', () => {
            _switchParentWrapper (gameOver, game);
            _switchParentWrapper (game, gameMode);
        });
    });
}) ();