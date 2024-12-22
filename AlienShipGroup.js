class AlienShipGroup {
  constructor(alienShipGrid) {
    this.alienShipGrid = alienShipGrid;
    this.movingRight = true;
    this.isFrozen = false;
    this.moveSpeed = config.alienSettings.moveSpeed || -1; // Velocidad centralizada
    this.maxSpeed = config.alienSettings.maxSpeed || 10; // Velocidad máxima centralizada
    this.freezeDuration = config.powerUpDurations.FREEZE || 5000; // Duración del efecto congelamiento centralizada
    this.oldVelocities = []; // Almacena las velocidades originales
    this.freezeActivation = 0; // Tiempo de inicio del congelamiento
  }

  update() {
    let aliensAlive = false;

    // Verificar si el efecto de congelamiento ha expirado
    if (this.isFrozen && millis() - this.freezeActivation > this.freezeDuration) {
      this.restoreVelocity();
    }

    // Actualizar cada alienígena en la cuadrícula
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alienShip = this.alienShipGrid[i][j];
        if (alienShip != null) {
          aliensAlive = true;
          alienShip.update();
          push();
          if (this.isFrozen) {
            tint(0, 0, 200); // Efecto visual para alienígenas congelados
          }
          alienShip.render();
          pop();
        }
      }
    }

    // Si no quedan alienígenas vivos, avanzar de nivel
    if (!aliensAlive) {
      advanceLevel(); // Avanzar al siguiente nivel utilizando el `LevelManager`
    }

    // Verificar si el grupo alcanza los bordes y cambiar de dirección
    if ((this.reachedRightEdge() && this.movingRight) || (this.reachedLeftEdge() && !this.movingRight)) {
      this.movingRight = !this.movingRight;
      this.changeDirection();
      this.moveDown();
    }

    // Verificar si los alienígenas alcanzaron la posición de la nave del jugador
    if (this.reachedSpaceCraftPos()) {
      audioManager.playSound('gameOver'); // Reproducir sonido de Game Over
      gameOverFunc();
    }
  }

  freezeAlienShipGroup() {
    if (!this.isFrozen) {
      this.isFrozen = true;
      this.oldVelocities = [];
      for (let i = 0; i < this.alienShipGrid.length; i++) {
        for (let j = 0; j < this.alienShipGrid[i].length; j++) {
          let alien = this.alienShipGrid[i][j];
          if (alien != null) {
            this.oldVelocities.push({ alien: alien, velocity: alien.vel.x });
            alien.vel.x = 0; // Congelar movimiento del alienígena
          }
        }
      }
      this.freezeActivation = millis(); // Registrar tiempo de congelamiento
    }
  }

  restoreVelocity() {
    if (this.isFrozen) {
      this.oldVelocities.forEach(({ alien, velocity }) => {
        if (alien != null) alien.vel.x = velocity; // Restaurar velocidad original
      });
      this.oldVelocities = [];
      this.isFrozen = false;
    }
  }

  changeDirection() {
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alienShip = this.alienShipGrid[i][j];
        if (alienShip != null) {
          alienShip.vel.x *= -1; // Cambiar la dirección horizontal
        }
      }
    }
  }

  moveDown() {
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alien = this.alienShipGrid[i][j];
        if (alien != null) {
          alien.pos.y += alien.s_height / 2; // Mover hacia abajo
          if (abs(alien.vel.x) < this.maxSpeed) {
            alien.vel.x *= 1.1; // Incrementar la velocidad horizontal
            if (abs(alien.vel.x) > this.maxSpeed) {
              alien.vel.x = this.maxSpeed * Math.sign(alien.vel.x); // Limitar velocidad máxima
            }
          }
        }
      }
    }
  }

  reachedRightEdge() {
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alienShip = this.alienShipGrid[i][j];
        if (alienShip != null) {
          if (alienShip.pos.x + alienShip.s_width >= width) {
            return true; // Alienígena alcanzó el borde derecho
          }
        }
      }
    }
    return false;
  }

  reachedLeftEdge() {
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alienShip = this.alienShipGrid[i][j];
        if (alienShip != null) {
          if (alienShip.pos.x <= 0) {
            return true; // Alienígena alcanzó el borde izquierdo
          }
        }
      }
    }
    return false;
  }

  reachedSpaceCraftPos() {
    for (let i = 0; i < this.alienShipGrid.length; i++) {
      for (let j = 0; j < this.alienShipGrid[i].length; j++) {
        let alienShip = this.alienShipGrid[i][j];
        if (alienShip != null) {
          if (alienShip.pos.y + alienShip.s_height >= height * 0.85) {
            return true; // Alienígena alcanzó la posición de la nave
          }
        }
      }
    }
    return false;
  }
}
