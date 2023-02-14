// map score and colors.
const gameStarting = "starting"
const gameStarted = "started";
const gameStopped = "stopped";
const gameLength = 10;
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var grid = 16;
var count = 0;

var game = {
    status: "starting"
}

var player = {
    score: 0,
    timeLeft: gameLength,
    lastCollected: "None",
    x: 160,
    y: 160,

    // player velocity. moves one grid length every frame in either the x or y direction
    dx: grid,
    dy: 0,

    // keep track of all grids the player body occupies
    cells: [],

    // length of the player. grows when eating an gift
    maxCells: 1
};


let randomGift = getRandomGift();
let scoreRandomGift = getGiftScore(randomGift);

var gift = {
    x: 320,
    y: 320,
    type: randomGift,
    score: scoreRandomGift
};

// Gift colors
const redColor = "red";
const whiteColor = "white";
const caramelColor = "#ffd59a";

function startGame() {
    player.score = 0;
    player.timeLeft = 2000;
    player.lastCollected = "None";
    triggerDisplay(player);
    if (game.status == gameStarting || game.status == gameStopped) {
        game.status = gameStarted;
    }
    else {
        console.log("this should not happen");
    }
    gameLoop();
}

function stopGame() {
    game.status = gameStopped;
}

function goFaster() {
    player.dx = player.dx * 2;
}

function triggerDisplay(player) {
    document.getElementById('score').innerHTML = player.score;
    document.getElementById('last-collected').innerHTML = player.lastCollected;
}

const petal = [
    [
        [0, 0],
        [0.3, -1],
        [0.7, -1],
        [1, 0],
        [0.7, 1],
        [0.3, 1],
        [0, 0]
    ],
    [
        [0, 0],
        [1, 0]
    ],
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomGift() {
    let gifts = ["rose", "white rose", "rose",
        "white rose", "white rose", "white rose", "white rose", "white rose", "caramel"];
    let randomIndex = getRandomInt(0, gifts.length);
    return gifts[randomIndex];
}

function getRandomGiftColor(giftType) {
    if (giftType == "white rose")
        return whiteColor;
    else if (giftType == "rose")
        return redColor;
    else {
        return caramelColor //max;
    }
}

function getGiftScore(gift) {
    if (gift == "white")
        return 1;
    else if (gift == "red")
        return 5;
    else {
        return 20 //max;
    }
}

function isGiftCollected(playerX, playerY, giftX, giftY, toleranceInterval) {
    xDiff = Math.abs(playerX - giftX);
    yDiff = Math.abs(playerY - giftY);
    distancePlayerGift = Math.hypot(xDiff, yDiff);
    return toleranceInterval >= distancePlayerGift;
}

// game loop
function gameLoop() {
    player.timeLeft = player.timeLeft - 1;
    if (player.timeLeft < 0) {
        stopGame();
        return;
    }
    requestAnimationFrame(gameLoop);

    // slow game loop to 15 fps instead of 60 (60/15 = 4)
    if (++count < 4) {
        return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // move player by it's velocity
    player.x += player.dx;
    player.y += player.dy;

    // wrap player position horizontally on edge of screen
    if (player.x < 0) {
        player.x = canvas.width - grid;
    }
    else if (player.x >= canvas.width) {
        player.x = 0;
    }

    // wrap player position vertically on edge of screen
    if (player.y < 0) {
        player.y = canvas.height - grid;
    }
    else if (player.y >= canvas.height) {
        player.y = 0;
    }

    // keep track of where player has been. front of the array is always the head
    player.cells.unshift({ x: player.x, y: player.y });

    // remove cells as we move away from them
    if (player.cells.length > player.maxCells) {
        player.cells.pop();
    }

    // draw gift
    //context.fillStyle = 'green';
    //context.fillRect(gift.x, gift.y, grid - 1, grid - 1);
    function drawPetal(path, width, height) {
        var i = 0;
        do { // loop through paths
            const p = path[i];
            let j = 0;
            context.moveTo(p[j][0] * width, p[j++][1] * height);
            while (j < p.length - 1) {
                context.lineTo(p[j][0] * width, p[j++][1] * height);
            }
            if (p[j][0] === p[0][0] && p[j][1] === p[0][1]) { // is the path closed ?
                context.closePath();
            } else {
                context.lineTo(p[j][0] * width, p[j][1] * height)
            }
        } while (++i < path.length);
    }

    function drawPetals(x, y, count, startAt, petal, width, height) {
        const step = (Math.PI * 2) / count;
        context.setTransform(1, 0, 0, 1, x, y);
        context.rotate(startAt);
        for (var i = 0; i < count; i += 1) {
            drawPetal(petal, width, height);
            context.rotate(step);
        }
        context.setTransform(1, 0, 0, 1, 0, 0); // restore default
    }

    function drawFlower(giftType, lineWidth, fitScale, petalCount) {
        context.strokeStyle = getRandomGiftColor(giftType);
        context.lineWidth = lineWidth;
        const size = grid - 2;
        context.beginPath();

        drawPetals(gift.x, gift.y, 5, -Math.PI / 2, petal, size, size * 0.2);
        context.stroke();
        context.beginPath();
        context.arc(gift.x, gift.y, size * 0.15, 0, Math.PI * 2);
        context.fillStyle = getRandomGiftColor(giftType);
        context.fill();
    }
    drawFlower(gift.type, 1, 0.95, 20);



    // draw the heart
    context.fillStyle = 'red';
    position = player.cells[0];
    context.fillRect(position.x, position.y, grid - 1, grid - 1);

    player.cells.forEach(function (cell, index) {
        // player ate gift;
        if (isGiftCollected(cell.x, cell.y, gift.x, gift.y, grid)) {
            if (player.lastCollected == "None") // First eat.
            {
                //Game has started
                game.state = gameStarted;
                //Launch timer.
                var timer = setInterval(function () {

                    // Output the result in an element with id="timer"
                    document.getElementById("timer").innerHTML = "Time remaining:" +
                        player.timeLeft;

                    // If the count down is over, write some text 

                    if (player.timeLeft < 0) {
                        clearInterval(timer);
                        document.getElementById("timer").innerHTML = "GAME OVER!";
                        setTimeout(() => {
                            document.getElementById("timer").innerHTML = "PRESS C to play again!";
                        }, 3000);

                    }
                }, 1000);

                // play hans' music
                var audio = new Audio('hans.mp3');
                audio.play();
            }
            gift.score = getGiftScore(gift.type);
            player.score = player.score + gift.score;
            player.lastCollected = gift.type;
            // trigger display
            triggerDisplay(player);

            gift.x = getRandomInt(0, 25) * grid;
            gift.y = getRandomInt(0, 25) * grid;
            gift.type = getRandomGift();
        }

        // check collision with all cells after this one (modified bubble sort)
        for (var i = index + 1; i < player.cells.length; i++) {

            // player occupies same space as a body part. reset game
            if (cell.x === player.cells[i].x && cell.y === player.cells[i].y) {
                player.x = 160;
                player.y = 160;
                player.cells = [];
                player.maxCells = 4;
                player.dx = grid;
                player.dy = 0;

                gift.x = getRandomInt(0, 25) * grid;
                gift.y = getRandomInt(0, 25) * grid;
            }
        }
    });

}

// listen to keyboard events to move the player
document.addEventListener('keydown', function (e) {
    // prevent player from backtracking on itself by checking that it's 
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)

    // left arrow key
    if (e.which === 37 && player.dx === 0) {
        player.dx = -grid;
        player.dy = 0;
    }
    // up arrow key
    else if (e.which === 38 && player.dy === 0) {
        player.dy = -grid;
        player.dx = 0;
    }
    // right arrow key
    else if (e.which === 39 && player.dx === 0) {
        player.dx = grid;
        player.dy = 0;
    }
    // down arrow key
    else if (e.which === 40 && player.dy === 0) {
        player.dy = grid;
        player.dx = 0;
    }
});

// start the game
requestAnimationFrame(gameLoop);
