//Space Invaders - Tarea 1 - Computación visual 2024-2
let s;
let ship; // La nave del jugador
let alienGroup; 
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
let doublePointsActivation, time;
let doublePointsDuration;
let gameStarted = false, gameOver = false, gameConfigurated = true, winner = false;
let actualScore, highScore = 0; // Inicializar highScore en 0
let soundshoot, soundshipdeath, soundinvader, soundpowerup, soundgameover, soundbrokenshield;
let changelevel;
let config, levelManager, audioManager;
let enemyLevels = new Map();
let configLoaded = false;

function preload() {
  spritesRootPath = "./sprites/";
  audioRootPath = "./sounds/";
  loadJSON('./config.json', 
    (data) => {
      config = data;
      console.log("Config cargado:", config); // Agrega esta línea
      levelManager = new LevelManager(config);
      audioManager = new AudioManager(config.audioPaths);
      configLoaded = true;
    },
    () => {
      console.warn("Error al cargar config.json. Usando valores predeterminados.");
      configLoaded = true;
    }
  );  
  preloadAllImages();
}

function preloadAllImages() {
  fondo = loadImage(spritesRootPath + "fondo.jpg",
    () => console.log("Imagen de fondo cargada."),
    () => {
      console.warn("Error al cargar fondo. Usando marcador.");
      fondo = createGraphics(1080, 720);
      fondo.background(50); // Fondo gris como marcador
    }
  );
  imagesShipAlive = loadImages("ship", 1);
  imagesShipDead = loadImages("shipDead", 1);
  imagesAlienAAlive = loadImages("alienA", 2);
  imagesAlienADead = loadImages("alienDead", 1);
  imagesAlienBAlive = loadImages("alienB", 2);
  imagesAlienBDead = loadImages("alienDead", 1);
  imagesAlienCAlive = loadImages("alienC", 2);
  imagesAlienCDead = loadImages("alienDead", 1);
  shield = loadImage(spritesRootPath + "shield.png", null, () => console.warn("Error al cargar shield.png"));
  cadency = loadImage(spritesRootPath + "cadency.png", null, () => console.warn("Error al cargar cadency.png"));
  doublepoints = loadImage(spritesRootPath + "doublepoints.png", null, () => console.warn("Error al cargar doublepoints.png"));
  freeze = loadImage(spritesRootPath + "freeze.png", null, () => console.warn("Error al cargar freeze.png"));
  speed = loadImage(spritesRootPath + "speed.png", null, () => console.warn("Error al cargar speed.png"));
  nobullets = loadImage(spritesRootPath + "nobullets.png", null, () => console.warn("Error al cargar nobullets.png"));
  extralife = loadImage(spritesRootPath + "extralife.png", null, () => console.warn("Error al cargar extralife.png"));
}

function setup() {
  console.log("Iniciando setup...");
  if (!configLoaded) {
    console.error("Error: Configuraciones no cargadas. Verifica el archivo config.json.");
    createCanvas(1080, 720);
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Error al cargar configuraciones.\nVerifica config.json", width / 2, height / 2);
    noLoop();
    return;
  }
  createCanvas(1080, 720);
  fondo.resize(width, height);
  doublePointsDuration = config?.powerUpDurations?.DOUBLE_POINTS || 5000;
  gameStarted = false;
  gameOver = false;
  gameConfigurated = true;
  winner = false;
  noSmooth();
  configNewGame();
}

function draw() {
  console.log("Iniciando draw...");
  if (paused) {
    console.log("Juego en pausa");
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
    configNewLevel(); // Configurar el nuevo nivel tras la transición
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
      audioManager.playSound('gameOver');
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
      adjustPauseTimes(pauseTime);
    }
    return; // Ignorar cualquier otra tecla
  }

  // Resto de la lógica si el juego no está pausado
  if (key === 'Q' || key === 'q') {
    lastPauseTime = millis();
    ship.releaseAllKeys(); // Simular liberación de todas las teclas
    paused = !paused;
    return;
  }

  if (winner) {
    winner = false;
  } else if (!gameStarted || gameOver) {
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
  let initialLives = config?.ship?.initialLives || 3; // Garantiza que el valor sea seguro
  ship = new Ship(createVector(width / 2, height * 0.85), 32, 32, initialLives, imagesShipAlive, imagesShipDead);
  configNewLevel();
}

function configNewLevel() {
  let levelConfig = levelManager.getCurrentLevelConfig();
  if (!levelConfig) return;

  let { enemies, rows } = levelConfig;
  alienShipGrid = Array.from({ length: rows }, () => Array(enemies).fill(null));

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < enemies; i++) {
      let type = j < 2 ? 'alienB' : 'alienC';
      alienShipGrid[j][i] = new AlienShip(
        type,
        createVector(100 + i * 80, 100 + j * 50),
        32,
        32,
        3,
        type === 'alienB' ? imagesAlienBAlive : imagesAlienCAlive,
        imagesAlienBDead
      );
    }
  }
  alienGroup = new AlienShipGroup(alienShipGrid);
}

function renderPowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let power = powerUps[i];
    power.update();
    power.render();

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

function advanceLevel() {
  if (!levelManager.advanceLevel()) {
    winner = true;
    if (highScore < actualScore) highScore = actualScore;
    gameStarted = false;
    gameConfigurated = false;
  } else {
    changelevel = true;
    time = millis(); // Iniciar transición de nivel
  }
}

function adjustPauseTimes(pauseTime) {
  ship.lastShotTime += pauseTime;
  doublePointsActivation += pauseTime;
  ship.shieldActivation += pauseTime;
  ship.speedBoostStartTime += pauseTime;
  alienGroup.freezeActivation += pauseTime;
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

function loadImages(spriteName, n_images) {
  let images = [];
  for (let i = 0; i < n_images; i++) {
    let imagePath = `${spritesRootPath}${spriteName}_${i + 1}.png`;
    console.log("Cargando imagen:", imagePath); // Depuración
    loadImage(
      imagePath,
      (img) => images.push(img),
      () => {
        console.warn(`Imagen no encontrada: ${imagePath}. Usando marcador.`);
        let placeholder = createGraphics(32, 32);
        placeholder.background('red');
        placeholder.fill(255);
        placeholder.textAlign(CENTER, CENTER);
        placeholder.text("X", 16, 16);
        images.push(placeholder);
      });
  }
  return images;
}