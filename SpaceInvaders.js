//Space Invaders (prototipo) - Tarea 1 - Computación visual 2024-2
let s;
let ship; // La nave del jugador
let alienGroup; // 
let Type;
let myBullets = [];
let enemyBullets = [];
let powerUps = [];
let paused = false;
let pauseDuration = 0;
let lastPauseTime = 0; // Tiempo en que se activó la pausa
let imagesShipAlive, imagesShipDead, imagesAlienAAlive, imagesAlienADead, imagesAlienBAlive, imagesAlienBDead, imagesAlienCAlive, imagesAlienCDead;
let fondo;
let shield, cadency, doublepoints, freeze, speed, nobullets, extralife;
let alienShipGrid;
let enemies = 1, maxEnemies = 3, enemyRows = 1, level = 1;
let spritesRootPath;
let audioRootPath;
let doublePoints;
let doublePointsActivation, doublePointsDuration = 5000, time;
let gameStarted = false, gameOver = false, gameConfigurated = true, winner = false;
let actualScore, highScore = 0; // Inicializar highScore en 0
let soundshoot, soundshipdeath, soundinvader, soundpowerup, soundgameover, soundbrokenshield;
let changelevel;

let enemyLevels = new Map();

function preloadAllSounds() {
  soundshoot = loadSound(audioRootPath + "shoot.wav");
  soundshipdeath = loadSound(audioRootPath + "explosion.wav");
  soundinvader = loadSound(audioRootPath + "invaderkilled.wav");
  soundpowerup = loadSound(audioRootPath + "powerup.wav");
  soundgameover = loadSound(audioRootPath + "GameOver.wav");
  soundbrokenshield = loadSound(audioRootPath + "brokenshield.wav");
}

function preloadAllImages() {
  fondo = loadImage(spritesRootPath + "fondo.jpg");
  fondo.resize(width, height);
  imagesShipAlive = loadImages("ship", 1);
  imagesShipDead = loadImages("shipDead", 1);
  imagesAlienAAlive = loadImages("alienA", 2);
  imagesAlienADead = loadImages("alienDead", 1);
  imagesAlienBAlive = loadImages("alienB",2);
  imagesAlienBDead = loadImages("alienDead",1);
  imagesAlienCAlive = loadImages("alienC",2);
  imagesAlienCDead = loadImages("alienDead",1);
  shield = loadImage(spritesRootPath + "shield.png");
  cadency = loadImage(spritesRootPath + "cadency.png");
  doublepoints = loadImage(spritesRootPath + "doublepoints.png");
  freeze = loadImage(spritesRootPath + "freeze.png");
  speed = loadImage(spritesRootPath + "speed.png");
  nobullets = loadImage(spritesRootPath + "nobullets.png");
  extralife = loadImage(spritesRootPath + "extralife.png");
}


function preload() {
  spritesRootPath = "./sprites/";
  audioRootPath = "./sounds/";
  preloadAllSounds();
  preloadAllImages();
}

function setup() {
  createCanvas(1080, 720);
  let volume = 0.01;
  gameStarted = false, gameOver = false, gameConfigurated = true, winner = false;
  s = new p5.SoundFile();
  s.setVolume(volume);
  noSmooth(); // Desactiva el anti-aliasing para preservar el pixel art
  setupEnemiesForLevel();
  configNewGame();
}

function draw() {
  if (paused) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("PAUSE", width / 2, height / 2);
    return; // Detiene el resto del código en `draw`
  }
  if (!gameStarted && !gameOver && !winner) {
    startScreen();
} else if (gameOver) {
    gameOverScreen();
} else if (winner) { // Pantalla de victoria
    WinScreen();
} else if (changelevel) {
    showlevel();
    if (millis() - time > 1200) { // Tiempo de transición
        changelevel = false;
        confignewlevel(); // Configurar el nuevo nivel tras la transición
    }
} else {
    background(fondo);
    showLifes();
    ship.update();
    ship.render();
    alienGroup.update();
    renderPowerUps();
    myBullets.forEach((bullet) => {
      bullet.update();
      bullet.render();
    });
    enemyBullets.forEach((bullet) => {
      bullet.update();
      bullet.render();
    });
    myBullets = myBullets.filter((bullet) => bullet.isActive);
    enemyBullets = enemyBullets.filter((bullet) => bullet.isActive);
    powerUps = powerUps.filter((powerup) => powerup.active);
    if (millis() - doublePointsActivation > doublePointsDuration) {
      doublePoints = false;
    }
    ship.catchPower();
    if (ship.isDeath() && ship.isDeathAnimationFinished()) {
      soundgameover.play();
      gameOverFunc();
    }
    showScore();
  }
}

function keyPressed() {
  if (paused) {
    // Solo permitir la tecla Q para reanudar el juego
    if (key === 'Q' || key === 'q') {
      paused = false;
      let pauseTime = millis() - lastPauseTime;
      pauseDuration += pauseTime;

      // Ajustar todos los tiempos dependientes de `millis()`
      ship.lastShotTime += pauseTime;
      doublePointsActivation += pauseTime;
      ship.shieldActivation += pauseTime;
      ship.speedBoostStartTime += pauseTime;
      alienGroup.freezeActivation += pauseTime;
    }
    return; // Ignorar cualquier otra tecla
  }

  // Resto de la lógica si el juego no está pausado
  if (key === 'Q' || key === 'q') {
    if (!paused) {
      // Iniciar pausa
      lastPauseTime = millis();
    } else {
      // Terminar pausa
      let pauseTime = millis() - lastPauseTime;
      pauseDuration += pauseTime;

      // Ajustar todos los tiempos dependientes de `millis()`
      ship.lastShotTime += pauseTime;
      doublePointsActivation += pauseTime;
      ship.shieldActivation += pauseTime;
      ship.speedBoostStartTime += pauseTime;
      alienGroup.freezeActivation += pauseTime;
    }
    ship.releaseAllKeys(); // Simular liberación de todas las teclas
    paused = !paused;
    return;
  }
  if (winner) {
    winner = false;
  } else if (!gameStarted || gameOver) {
    soundgameover.stop();
    startGame();
  } else {
    ship.keyFunctions(keyCode, true);
  }
}

function keyReleased() {
  if (paused) {
    return; // Ignorar todas las teclas mientras está pausado
  }
  if (!paused && gameStarted && !gameOver) {
    ship.keyFunctions(keyCode, false);
  }
}

function startScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Bienvenido a Space Invaders", width / 2, height / 2 - 50);
  textSize(16);
  text("Presiona cualquier tecla para comenzar", width / 2, height / 2 + 50);
}

function startGame() {
  if (gameOver) {
    gameConfigurated = false;
    gameOver = false;
  }
  if (!gameConfigurated) {
    configNewGame();
    gameConfigurated = true;
  }
  gameStarted = true;
}

function configNewGame() {
  actualScore = 0;
  ship = new Ship(createVector(width / 2, height * 0.85), 32, 32, 3, imagesShipAlive, imagesShipDead);
  confignewlevel();
}

function confignewlevel() {
  if (changelevel) return; // Evitar conflictos durante la transición
  myBullets = [];
  enemyBullets = [];
  powerUps = [];
  let levelConfig = enemyLevels.get(level);
  enemies = levelConfig[0];
  enemyRows = levelConfig[1];

  alienShipGrid = Array.from({ length: enemyRows }, () => Array(enemies).fill(null));
  // Configurar enemigos para el nuevo nivel
  for (let j = 0; j < enemyRows; j++) {
    let imagesAlive;
    let imagesDead;
    if (j < 2) {
      imagesAlive = imagesAlienBAlive;
      imagesDead = imagesAlienBDead;
    } else if (j < 4) {
      imagesAlive = imagesAlienCAlive;
      imagesDead = imagesAlienCDead;
    } else {
      imagesAlive = imagesAlienAAlive;
      imagesDead = imagesAlienADead;
    }
    for (let i = 0; i < enemies; i++) {
      if (imagesAlive === imagesAlienAAlive) {
        Type = Object.values(alienType)[0];
      } else if (imagesAlive === imagesAlienBAlive) {
        Type = Object.values(alienType)[1];
      } else {
        Type = Object.values(alienType)[2];
      }
      alienShipGrid[j][i] = new AlienShip(Type, createVector(100 + i * 80, 100 + j * 50), 32, 32, 3, imagesAlive, imagesDead);
    }
  }
  alienGroup = new AlienShipGroup(alienShipGrid);
}

function setupEnemiesForLevel() {
    enemyLevels.set(1, [4, 3]);
    enemyLevels.set(2, [5, 4]);
    enemyLevels.set(3, [6, 5]);
    enemyLevels.set(4, [7, 6]);
    enemyLevels.set(5, [8, 7]); // Nivel final
}

function renderPowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
      let power = powerUps[i];
      power.update();
      power.render();

      // Eliminar power-ups fuera de pantalla o consumidos
      if (power.pos.y > height || !power.active) {
          console.log(`Power-up ${power.type} eliminado.`);
          powerUps.splice(i, 1);
      }
  }
}

function showLifes() {
  textSize(20);
  fill(255);
  let shipX = width - 40 - 30; // Margen desde la derecha (imagen: 30 px de ancho)
  let shipY = height * 0.92; // Mantener la posición vertical
  let textX = shipX - 30; // Posición del texto justo a la izquierda de la imagen
  let textY = shipY + 15; // Mantener la posición vertical del texto
  // Dibujar la imagen de la nave y el texto
  image(imagesShipAlive[0], shipX, shipY, 30, 30); // Imagen de la nave
  text("×" + ship.lifes, textX, textY); // Texto con el número de vidas
}

function showScore() {
  textAlign(LEFT, CENTER); // Alinear el texto desde la izquierda
  fill(230, 158, 4);
  textSize(24);
  text("SCORE: " + actualScore, width * 0.05 + 10, height * 0.03); // Ajustar la posición ligeramente hacia la derecha
  textAlign(CENTER, CENTER);
  textSize(16);
  text("HIGH-SCORE: " + (highScore || 0), width / 2, height * 0.03); // Mostrar 0 si no está definido
  textAlign(RIGHT, CENTER); // Alinear desde la derecha
  text("LEVEL " + level, width * 0.95 - 10, height * 0.03); // Ajustar la posición ligeramente hacia la izquierda
  if (doublePoints) {
    textAlign(CENTER, CENTER);
    fill(135, 239, 254);
    text("POINTS ×2!", width * 0.25, height * 0.03);
  }
}

function showlevel() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("LEVEL " + level, width / 2, height / 2 - 50);
}

function gameOverFunc() {
  if (highScore < actualScore) {highScore = actualScore;}
  gameOver = true;
  gameStarted = false;
  gameConfigurated = false;
  level = 1;
}

if (level > enemyLevels.size || alienGroup.alienShipGrid.flat().every(alien => alien === null)) {
  winner = true;
  if (highScore < actualScore) {
    highScore = actualScore;
  }
  gameStarted = false;
  gameConfigurated = false;
} else if (!changelevel) {
  changelevel = true;
  time = millis(); // Iniciar transición de nivel
}

function gameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(24);
  text("Score: " + actualScore, width / 2, height / 2);
  textSize(16);
  text("Presiona cualquier tecla para jugar de nuevo", width / 2, height / 2 + 50);
}

function WinScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("YOU WIN!", width / 2, height / 2 - 50);
  textSize(24);
  text("Score: " + actualScore, width / 2, height / 2);
  textSize(16);
  text("Presiona cualquier tecla para jugar de nuevo", width / 2, height / 2 + 50);
}

function loadImages(spriteName, n_images, i = 0, images = []) {
  if(i == n_images){
    return images;
  }
  let imagePath = spritesRootPath + spriteName + "_" + (i+1) + ".png";
  loadImage(imagePath, 
    (img) => {
      images.push(img);
      images = loadImages(spriteName, n_images, i+1, images);
    },
    () => "is this fails the whole thing breaks :)");
  return images
}