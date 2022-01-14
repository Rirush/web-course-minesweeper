let fieldContainer = document.querySelector(".field");
let fieldCells = [];
let field = [];
let mineCount = [];
let markedCells = [];

let selected = {
    x: undefined,
    y: undefined
};
let created = false;

const mines = 21;
let flags = 0;
let freeCellsLeft = 12 * 12 - 21;

let gameOver = false;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function randomCell() {
    return [getRandomInt(0, 12), getRandomInt(0, 12)];
}

function countMines(x, y) {
    let counter = 0;
    for(let offsetX = -1; offsetX <= 1; offsetX++) {
        for(let offsetY = -1; offsetY <= 1; offsetY++) {
            let cellX = x + offsetX;
            let cellY = y + offsetY;
            if (cellX < 0 || cellX > 11 || cellY < 0 || cellY > 11) {
                continue;
            }
            if (field[cellX][cellY] === "mine") {
                counter++;
            }
        }
    }
    return counter;
}

function generateField([safeX, safeY]) {
    let generated = 0;
    while (generated < mines) {
        let [mineX, mineY] = randomCell();
        if (Math.abs(mineX - safeX) <= 1 && Math.abs(mineY - safeY) <= 1) {
            continue;
        }
        if (field[mineX][mineY] === "mine") {
            continue;
        }
        field[mineX][mineY] = "mine";
        generated++;
    }
    for (let x = 0; x < 12; x++) {
        for (let y = 0; y < 12; y++) {
            mineCount[x][y] = countMines(x, y);
        }
    }
    created = true;
    console.log("Created field successfully");
}

function revealCell(x, y, cascading) {
    if (gameOver) {
        return;
    }
    if (field[x][y] === "open" || (markedCells[x][y] && !cascading)) {
        return;
    }
    if (field[x][y] === "mine") {
        gameOver = true;
        fieldCells[x][y].classList.add("cell--mine");
        for (let x = 0; x < 12; x++) {
            for (let y = 0; y < 12; y++) {
                if (field[x][y] === "mine") {
                    fieldCells[x][y].classList.add("cell--mine");
                    if (markedCells[x][y]) {
                        fieldCells[x][y].classList.add("cell--correct");
                    }
                    continue;
                }
                if (markedCells[x][y]) {
                    fieldCells[x][y].classList.add("cell--wrong");
                }
            }
        }
        return;
    }
    field[x][y] = "open";
    if (markedCells[x][y]) {
        markedCells[x][y] = false;
        flags--;
        refreshFlagHint();
    }
    freeCellsLeft--;
    fieldCells[x][y].classList.remove("cell--flag");
    fieldCells[x][y].classList.add("cell--open");
    if (!created) {
        generateField([x, y]);
    }

    if (mineCount[x][y] === 0) {
        for(let offsetX = -1; offsetX <= 1; offsetX++) {
            for(let offsetY = -1; offsetY <= 1; offsetY++) {
                if (offsetX === 0 && offsetY === 0) {
                    continue;
                }
                let cellX = x + offsetX;
                let cellY = y + offsetY;
                if (cellX < 0 || cellX > 11 || cellY < 0 || cellY > 11) {
                    continue;
                }
                revealCell(cellX, cellY, true);
            }
        }
    } else {
        fieldCells[x][y].innerText = mineCount[x][y].toString();
    }

    if (freeCellsLeft === 0) {
        gameOver = true;
        flags = 21;
        refreshFlagHint();
        for (let x = 0; x < 12; x++) {
            for (let y = 0; y < 12; y++) {
                if (field[x][y] === "mine") {
                    fieldCells[x][y].classList.add("cell--mine", "cell--correct");
                }
                if (markedCells[x][y]) {
                    fieldCells[x][y].classList.add("cell--correct");
                }
            }
        }
    }
}

function markCell(x, y) {
    if (gameOver) {
        return;
    }
    if (field[x][y] === "open") {
        return;
    }
    if (!markedCells[x][y]) {
        markedCells[x][y] = true;
        flags++;
        fieldCells[x][y].classList.add("cell--flag");
    } else {
        markedCells[x][y] = false;
        flags--;
        fieldCells[x][y].classList.remove("cell--flag");
    }
    refreshFlagHint();
}

function refreshFlagHint() {
    document.querySelector(".flags-left").innerText = (mines - flags).toString();
}

function changeSelectedPosition(x, y) {
    if (selected.x !== undefined && selected.y !== undefined) {
        fieldCells[selected.x][selected.y].classList.remove("cell--selected");
    }
    if (x !== undefined && y !== undefined) {
        if (x < 0) {
            x = 11;
        }
        if (x > 11) {
            x = 0;
        }
        if (y < 0) {
            y = 11;
        }
        if (y > 11) {
            y = 0;
        }

        fieldCells[x][y].classList.add("cell--selected");
    }
    selected.x = x;
    selected.y = y;
}

for (let x = 0; x < 12; x++) {
    fieldCells.push([]);
    field.push([]);
    mineCount.push([]);
    markedCells.push([]);
    for (let y = 0; y < 12; y++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        fieldContainer.appendChild(cell);

        cell.addEventListener("click", function () {
            revealCell(x, y);
        });

        cell.addEventListener("contextmenu", function (ev) {
            markCell(x, y);
            ev.preventDefault();
        });

        fieldCells[x].push(cell);
        field[x].push("free");
        mineCount[x].push(0);
        markedCells[x].push(false);
    }
}

document.addEventListener("keydown", (ev) => {
    switch (ev.code) {
        case "Escape":
            changeSelectedPosition(undefined, undefined);
            ev.preventDefault();
            break;
        case "ArrowLeft":
            changeSelectedPosition(selected.x || 0, (selected.y - 1) || 0);
            ev.preventDefault();
            break;
        case "ArrowRight":
            changeSelectedPosition(selected.x || 0, (selected.y + 1) || 0);
            ev.preventDefault();
            break;
        case "ArrowUp":
            changeSelectedPosition((selected.x - 1) || 0, selected.y || 0);
            ev.preventDefault();
            break;
        case "ArrowDown":
            changeSelectedPosition((selected.x + 1) || 0, selected.y || 0);
            ev.preventDefault();
            break;
        case "Enter":
        case "Space":
            if (ev.getModifierState("Control")) {
                if (selected.x !== undefined && selected.y !== undefined) {
                    markCell(selected.x, selected.y);
                }
            } else {
                if (selected.x !== undefined && selected.y !== undefined) {
                    revealCell(selected.x, selected.y);
                }
            }
            ev.preventDefault();
            break;
    }
})