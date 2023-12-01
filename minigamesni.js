document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const square = createSquare();
    let isDragging = false;
    let score = 0;
    let lives = 3;
    let fallSpeed = 15;
    let obstacleInterval, collectibleInterval;
    let obstacleIntervalTime = 2000; // Initial interval time for dropping obstacles
    let scoreThresholdForFrequency = 5;
    let majorObstacleThreshold = 5; // Threshold for major increase in obstacle frequency

    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');

    setupEventListeners();
    startGame();

    function createSquare() {
        const square = document.createElement('div');
        square.classList.add('square');
        gameArea.appendChild(square);
        square.style.left = (gameArea.offsetWidth / 2 - square.offsetWidth / 2) + 'px';
        square.style.bottom = '0px'; // Position the square at the bottom
        return square;
    }

    function setupEventListeners() {
        gameArea.addEventListener('mousedown', e => {
            isDragging = true;
            moveSquare(e.pageX);
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                moveSquare(e.pageX);
            }
        });

        document.addEventListener('mouseup', () => isDragging = false);

        gameArea.addEventListener('touchstart', e => {
            e.preventDefault();
            moveSquare(e.touches[0].pageX);
        }, { passive: false });

        gameArea.addEventListener('touchmove', e => {
            e.preventDefault();
            moveSquare(e.touches[0].pageX);
        }, { passive: false });
    }

    function startGame() {
        updateScore(0); // Initialize score
        updateLives(3); // Initialize lives
        startObstacleSpawning();
        startCollectibleSpawning();
    }

    function loseLife() {
        updateLives(lives - 1);
        if (lives <= 0) {
            resetGame();
        }
    }

    function updateLives(value) {
        lives = value;
        livesDisplay.textContent = `Lives: ${lives}`;
        if (lives <= 0) {
            resetScoreAndGame();
        }
    }

    function resetScoreAndGame() {
        updateScore(0); // Reset score to 0
        resetGame();
    }

    function resetGame() {
        clearInterval(obstacleInterval);
        clearInterval(collectibleInterval);
        clearObstaclesAndCollectibles();
        updateLives(3); // Reset lives
        updateScore(-score);
        obstacleIntervalTime = 2000;
        startGame();
    }

    function startObstacleSpawning() {
        obstacleInterval = setInterval(dropObstacle, obstacleIntervalTime);
    }

    function startCollectibleSpawning() {
        collectibleInterval = setInterval(dropCollectible, 3000);
    }

    function clearObstaclesAndCollectibles() {
        const obstacles = gameArea.querySelectorAll('.obstacle');
        const collectibles = gameArea.querySelectorAll('.collectible');
        obstacles.forEach(obstacle => obstacle.remove());
        collectibles.forEach(collectible => collectible.remove());
    }

    function moveSquare(pageX) {
        let newX = pageX - gameArea.getBoundingClientRect().left - square.offsetWidth / 2;
        newX = Math.max(0, Math.min(newX, gameArea.offsetWidth - square.offsetWidth));
        square.style.left = newX + 'px';
    }

    function updateScore(value) {
        score += value;
        scoreDisplay.textContent = `Score: ${score} BTC`;
        adjustGameDifficulty();
    
        if (score > 0 && score % 5 === 0) {
            showSpecialImage();
        }
    }
    
    function showSpecialImage() {
        const imageContainer = document.getElementById('specialImageContainer');
        imageContainer.style.display = 'block';
    
        setTimeout(() => {
            imageContainer.style.display = 'none';
        }, 1000); // Hide the image after 1 second
    }

    function adjustGameDifficulty() {
        fallSpeed = 15 + Math.floor(score / 30);
        if (score > 0) {
            if (score % scoreThresholdForFrequency === 0) {
                obstacleIntervalTime = Math.max(500, obstacleIntervalTime - 700);
                restartObstacleSpawning();
            }
    
            if (score % majorObstacleThreshold === 0) {
                obstacleIntervalTime = Math.max(300, obstacleIntervalTime - 700); // Major increase in obstacle rate
                restartObstacleSpawning();
            }
        }
    }

    function restartObstacleSpawning() {
        clearInterval(obstacleInterval);
        startObstacleSpawning();
    }

    function dropObstacle() {
        const obstacle = createGameElement('obstacle');
        dropElement(obstacle, () => loseLife(), false); // Not a collectible
    }
    
    function dropCollectible() {
        const collectible = createGameElement('collectible');
        dropElement(collectible, () => updateScore(1), true); // Is a collectible
    }

    function createGameElement(className) {
        const element = document.createElement('div');
        element.classList.add(className);
        element.style.top = '0px';
        element.style.left = Math.random() * (gameArea.offsetWidth - 32) + 'px';
        gameArea.appendChild(element);
        return element;
    }

    function dropElement(element, collisionAction, isCollectible = false) {
        const dropInterval = setInterval(() => {
            element.style.top = (parseInt(element.style.top) + fallSpeed) + 'px';
    
            if (checkCollision(square, element)) {
                clearInterval(dropInterval);
                element.remove();
                collisionAction();
            } else if (parseInt(element.style.top) > gameArea.offsetHeight) {
                clearInterval(dropInterval);
                element.remove();
                if (isCollectible) {
                    loseLife(); // Lose a life when a collectible is missed
                }
            }
        }, 100);
    }


    function checkCollision(square, element) {
        const sqRect = square.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return !(sqRect.right < elementRect.left || sqRect.left > elementRect.right || sqRect.bottom < elementRect.top || sqRect.top > elementRect.bottom);
    }
});
