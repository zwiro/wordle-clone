const displayWrapper = document.querySelector('.display-wrapper');
const keyboardWrapper = document.querySelector('.keyboard-wrapper');
const msgWrapper = document.querySelector('.msg-wrapper');

let currentCell = -1;
let currentRow = 0;
let isGameOver = false;
let currentWord;

const rowNumber = 6;
const cellNumber = 5;

const getWord = fetch('./wordlist.json')
    .then(res => res.json())
    .then(data => {
        const wordList = data.wordList;
        let randomNumber = Math.floor(Math.random() * wordList.length);
        currentWord = wordList[randomNumber].toUpperCase();
    });

const letterRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];

// creating gameboard
for (let i = 0; i < rowNumber; i++) {
    const newRow = document.createElement('div');
    newRow.setAttribute('id', `row-${i}`);
    newRow.classList.add('row');
    displayWrapper.append(newRow);
    for (let j = 0; j < cellNumber; j++) {
        const newCell = document.createElement('div');
        newCell.setAttribute('id', `row-${i}-cell-${j}`);
        newCell.classList.add('cell');
        newRow.append(newCell);
    }
}
//---

// creating keyboard 
const keyboardKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'];
keyboardKeys.forEach(key => {
    const newKey = document.createElement('div');
    newKey.setAttribute('id', key);
    newKey.classList.add('key');
    newKey.innerText = key;
    keyboardWrapper.append(newKey);
    newKey.addEventListener('click', () => keyAction(key))
});
//---

document.addEventListener('keyup', e => {
    if (!isGameOver) {
        keyboardAction(e);
    }
});

function keyAction(key) {
    if (!isGameOver) {
        if (key === 'DELETE') {
            deleteLetter();
        } else if (key === 'ENTER') {
            checkRow();
        } else {
            addLetter(key);
        }
    }
}

function keyboardAction(e) {
    const key = e.key.toUpperCase();
    if (keyboardKeys.includes(String(key))) {
        keyAction(key);
    } else if (key === 'ENTER') {
        checkRow();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    }
}

function checkRow() {
    const guess = letterRows[currentRow].join('');
    if (currentCell === 4) {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`)
            .then(res => res.json())
            .then(data => {
                if (data.title === 'No Definitions Found') {
                    showMsg('Not in the word list!', '#000000');
                    console.clear();
                } else {
                    if (guess === currentWord) {
                        letterTip();
                        setTimeout(() => gameOver('won'), 2000);
                    } else if (currentCell === 4 && currentRow !== 5) {
                        letterTip();
                        currentRow++;
                        currentCell = -1;
                    } else if (currentCell === 4 && currentRow === 5) {
                        letterTip();
                        setTimeout(() => gameOver('lost'), 2000);
                    }
                }
            })
            .catch(e => console.log(e));
    } else {
        showMsg('Word is too short!', '#000000');
    }
}

function letterTip() {
    const row = document.querySelector(`#row-${currentRow}`);
    const cells = row.childNodes;
    let checkedWord = currentWord;
    for (let i = 0; i < 5; i++) {
        const key = document.querySelector(`#${cells[i].innerText}`);
        const guessedLetter = cells[i].innerText;
        if (checkedWord[i] === guessedLetter) {
            cells[i].style.setProperty('--bg-clr', '#538d4e');
            setTimeout(() => {
                key.style.setProperty('--bg-clr', '#538d4e');
            }, 2000);
            checkedWord = checkedWord.replace(guessedLetter, ' ');
        } else if (checkedWord.includes(guessedLetter) && checkedWord[i] !== guessedLetter) {
            cells[i].style.setProperty('--bg-clr', '#b59f3b');
            if (key.style.getPropertyValue('--bg-clr') !== '#538d4e') {
                key.style.setProperty('--bg-clr', '#b59f3b');
            }
            checkedWord = checkedWord.replace(guessedLetter, ' ');
        } else {
            cells[i].style.setProperty('--bg-clr', '#3a3a3c')
            if (key.style.getPropertyValue('--bg-clr') !== '#538d4e' && key.style.getPropertyValue('--bg-clr') !== '#b59f3b') {
                key.style.setProperty('--bg-clr', '#3a3a3c');
            }
        }
        const flippedCell = document.querySelector(`#row-${currentRow}-cell-4`);
        flippedCell.addEventListener('animationend', () => {
            key.classList.add('key-bg');
        })
    }
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.classList.add('flip');
            cell.classList.add('key-bg');
        }, 400 * index);
    })
}

function deleteLetter() {
    if (currentCell > -1) {
        letterRows[currentRow][currentCell] = '';
        updateDisplay();
        currentCell--;
    }
}

function addLetter(key) {
    if (currentCell < 4) {
        currentCell++;
        letterRows[currentRow][currentCell] = key;
        updateDisplay();
    }
}

function updateDisplay() {
    const cell = document.querySelector(`#row-${currentRow}-cell-${currentCell}`);
    cell.innerText = letterRows[currentRow][currentCell];
}

function showMsg(msg, color) {
    const row = document.querySelector(`#row-${currentRow}`);
    row.classList.add('shake');
    const textMsg = document.querySelector('#msg');
    textMsg.innerText = msg;
    msgWrapper.append(textMsg);
    msgWrapper.style.color = color;
    msgWrapper.style.opacity = '1';
    setTimeout(() => {
        msgWrapper.style.opacity = '0';
    }, 1000);
    setTimeout(() => {
        row.classList.remove('shake');
    }, 300);
}

function gameOver(gameResult) {
    isGameOver = true;
    const textMsg = document.querySelector('#msg');
    if (gameResult === 'won') {
        textMsg.innerText = 'Congratulations! You guessed the word! Click here to try again.';
    } else if (gameResult === 'lost') {
        textMsg.innerText = `You lost! The correct word was ${currentWord}. Click here to try again.`;
    }
    msgWrapper.append(textMsg);
    textMsg.addEventListener('click', () => {
        window.location.reload();
    });
    msgWrapper.style.color = '#000';
    msgWrapper.style.opacity = '1';
    msgWrapper.style.cursor = 'pointer';
}