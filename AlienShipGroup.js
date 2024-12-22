class AlienShipGroup {
    constructor(alienShipGrid) {
      this.alienShipGrid = alienShipGrid;
      this.movingRight = true;
      this.isFrozen = false;
      this.moveSpeed = -1;
      this.velu = 0;
      this.maxSpeed = 10;
      this.freezeActivation = 0;
      this.freezeDuration = 5000;
      this.oldvelocity = 0;
      this.alienShoot = [];
  
      for (let j = 0; j < alienShipGrid[alienShipGrid.length - 1].length; j++) {
        alienShipGrid[alienShipGrid.length - 1][j].canShoot = true;
      }
    }
  
    update() {
      let aliensAlive = false;
    
      // Verificar si el efecto de congelamiento ha expirado
      if (this.isFrozen && millis() - this.freezeActivation > this.freezeDuration) {
        this.restorevelocity();
      }
    
      for (let i = 0; i < this.alienShipGrid.length; i++) {
        for (let j = 0; j < this.alienShipGrid[i].length; j++) {
          let alienShip = this.alienShipGrid[i][j];
          if (alienShip != null) {
            aliensAlive = true;
            if (!ship.isDead) {
              alienShip.update();
            }
            push();
            if (this.isFrozen) {
              tint(0, 0, 200); // Efecto visual para alienígenas congelados
            }
            alienShip.render();
            pop();
            if (alienShip.isDeathAnimationFinished() && alienShip.isDead) {
              if (this.alienShipGrid[i][j].canShoot) {
                this.alienShipGrid[i][j].canShoot = false;
                this.lastShoot(this.alienShipGrid[i][j], j);
              }
              this.alienShipGrid[i][j] = null; // Elimina el alienígena
            }
          }
        }
      }
    
      if (!aliensAlive) {
        if (level >= enemyLevels.size) { // Corregido: usa >= para incluir el último nivel
            winner = true; // Activar pantalla de victoria
            if (highScore < actualScore) {
                highScore = actualScore; // Actualizar high-score si es necesario
            }
            gameStarted = false;
            gameConfigurated = false;
        } else if (!changelevel) {
            level++;
            changelevel = true; // Habilitar pantalla de transición entre niveles
            time = millis();
        }
    }              
    
      if ((this.reachedRightEdge() && this.movingRight) || (this.reachedLeftEdge() && !this.movingRight)) {
        this.movingRight = !this.movingRight;
        this.change_direction();
        this.moveDown();
      }
      if (this.reachedSpaceCraftPos()) {
        gameOver();
      }
    }    
  
    freezealienshipgroup() {
      if (!this.isFrozen) {
        this.isFrozen = true;
        this.oldVelocities = []; // Almacena las velocidades originales
        for (let i = 0; i < this.alienShipGrid.length; i++) {
          for (let j = 0; j < this.alienShipGrid[i].length; j++) {
            let alien = this.alienShipGrid[i][j];
            if (alien != null) {
              this.oldVelocities.push({ alien: alien, velocity: alien.vel.x });
              alien.vel.x = 0; // Congela al alienígena
            }
          }
        }
        this.freezeActivation = millis(); // Marca el inicio del congelamiento
      }
    }       
  
    restorevelocity() {
      if (this.isFrozen && this.oldVelocities) {
        this.oldVelocities.forEach(({ alien, velocity }) => {
          if (alien != null) {
            alien.vel.x = velocity; // Restaura la velocidad original
          }
        });
        this.oldVelocities = []; // Limpia el respaldo
        this.isFrozen = false;
      }
    }    
  
    alienShoots(alien2) {
      for (let alien of this.alienShoot) {
        if (alien === alien2) {
          return true;
        }
      }
      return false;
    }
  
    lastShoot(alien2, currentColumnIndex) {
      if (currentColumnIndex !== -1) {
        for (let i = this.alienShipGrid.length - 1; i >= 0; i--) {
          let nextAlien = this.alienShipGrid[i][currentColumnIndex];
          if (nextAlien != null && nextAlien !== alien2) {
            nextAlien.canShoot = true;
            return;
          }
        }
      }
    }
  
    change_direction() {
      for (let i = 0; i < this.alienShipGrid.length; i++) {
        for (let j = 0; j < this.alienShipGrid[i].length; j++) {
          let alienShip = this.alienShipGrid[i][j];
          if (alienShip != null) {
            alienShip.vel.x *= this.moveSpeed;
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
              return true;
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
              return true;
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
              return true;
            }
          }
        }
      }
      return false;
    }
  
    moveDown() {
      for (let i = 0; i < this.alienShipGrid.length; i++) {
        for (let j = 0; j < this.alienShipGrid[i].length; j++) {
          let alien = this.alienShipGrid[i][j];
          if (alien != null) {
            alien.pos.y += alien.s_height / 2;
            if (abs(alien.vel.x) < this.maxSpeed) {
              alien.vel.x *= 1.1; // Incremento controlado
              if (abs(alien.vel.x) > this.maxSpeed) {
                alien.vel.x = this.maxSpeed * Math.sign(alien.vel.x); // Límite estricto
              }
            }            
          }
        }
      }
    }
  }