class Ship {
  constructor(pos, s_height, s_width, lifes, imagesAlive, imagesDead) {
    this.pos = pos.copy();
    this.vel = createVector(0, 0).limit(this.maxVelocity);
    this.acc = createVector(0.0, 0).limit(this.maxAcceleration);
    this.lifes = lifes;
    this.s_height = s_height;
    this.s_width = s_width;
    this.imagesAlive = imagesAlive;
    this.imagesDead = imagesDead;
    this.maxImageStates = imagesAlive.length;
    this.movement = [false, false, false, false]; // 0->left, 1->up, 2->down, 3->right
    this.isShooting = false;

    // Duraciones centralizadas
    this.shieldDuration = config.powerUpDurations.SHIELD || 5000;
    this.speedBoostDuration = config.powerUpDurations.SPEED || 10000;
    this.doublePointsDuration = config.powerUpDurations.DOUBLE_POINTS || 20000;
    this.freezeDuration = config.powerUpDurations.FREEZE || 6800;
    this.maxVelocity = 9;
    this.maxAcceleration = 1;
    this.potAcc = 0.5;
    this.lastShotTime = 0;
    this.shootDelay = 1000;
    this.minShootDelay = 500;
    this.imageDelay = 1000;
    this.prevMillis = 0;
    this.imageState = 0;
    this.isDead = false;
    this.hasShield = false;
    this.deadAnimStartTime = 0;
    this.deadAnimDuration = 500;
    this.speedBoostActive = false;
    this.speedBoostStartTime = 0;
    this.lastShieldSoundTime = 0; // Nueva variable para controlar la reproducción del sonido
    this.trail = []; // Array para guardar la estela de posiciones
    this.trailLimit = 10; // Límite del número de posiciones en la estela
    this.konami = 0;
  }
  
    updateAcc() {
      let x = this.potAcc * (int(this.movement[3]) - int(this.movement[0]));
      let y = this.potAcc * (int(this.movement[2]) - int(this.movement[1]));
      this.acc.add(x, y).limit(this.maxAcceleration);
    }
  
    keyFunctions(k, b) {
      if (k === LEFT_ARROW) {
        this.movement[0] = b;
      } else if (k === RIGHT_ARROW) {
        this.movement[3] = b;
      } else if (k === 32) {
        this.isShooting = b;
      }
      this.superCoolStuff(k, b)
    }

    superCoolStuff(k, b) {
      if (b === false) {
        if (k === UP_ARROW) {
          if (this.konami === 0 || this.konami === 1) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === DOWN_ARROW) {
          if (this.konami === 2 || this.konami === 3) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === LEFT_ARROW) {
          if (this.konami === 4 || this.konami === 6) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === RIGHT_ARROW) {
          if (this.konami === 5 || this.konami === 7) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === 66) { // 'B' key
          if (this.konami === 8) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === 65) { // 'A' key
          if (this.konami === 9) {
            this.konami++;
          } else {
            this.konami = 0;
          }
        } else if (k === ENTER) { // 'Enter' key
          if (this.konami === 10) {
            this.konami = 0;
            this.activateCheatCode();
          } else {
            this.konami = 0;
          }
        } else {
          this.konami = 0;
        }
      }
    }

    activateCheatCode() {
      this.lifes = 99;
      this.shootDelay = 100;
      audioManager.playSound('powerUp'); // Usar AudioManager
    }    
  
    collision() {
      if (this.pos.x + this.vel.x < 0) {
        this.pos.x = 0;
        this.vel.setMag(0);
      } else if (this.pos.x + this.vel.x > width - this.s_width) {
        this.pos.x = width - this.s_width;
        this.vel.setMag(0);
      }
  
      if (this.pos.y + this.vel.y < 0) {
        this.pos.y = 0;
        this.vel.setMag(0);
      } else if (this.pos.y + this.vel.y > height - this.s_height) {
        this.pos.y = height - this.s_height;
        this.vel.setMag(0);
      }
    }
  
    decelerate() {
      let velMag = this.vel.mag();
      let accMag = this.acc.mag();
      let decVel = 0.5;
      let decAcc = 0.2;
      let newMag = (velMag >= decVel) ? velMag - decVel : 0;
      this.vel.setMag(newMag);
      let newAccMag = (accMag >= decAcc) ? accMag - decAcc : 0;
      this.acc.setMag(newAccMag);
    }
  
    shoot() {
      if (paused) return; // Evitar disparos mientras está pausado
      if (!this.isShooting || millis() - this.lastShotTime < this.shootDelay) return;
      audioManager.playSound('shoot'); // Usar AudioManager para reproducir sonido
      let bulletVel = createVector(0, -8);
      let bulletPos = this.pos.copy().add(this.s_width / 2, 0);
      this.lastShotTime = millis();
      myBullets.push(new Bullet(bulletPos, bulletVel, 5, 10, color(255)));
    }
  
    isDeath() {
      if (this.lifes < 1) return true;
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        if (
          bullet.pos.x + bullet.b_width >= this.pos.x &&
          bullet.pos.x <= this.pos.x + this.s_width &&
          bullet.pos.y + bullet.b_height >= this.pos.y &&
          bullet.pos.y <= this.pos.y + this.s_height
        ) {
          enemyBullets.splice(i, 1);
          if (this.hasShield) {
            if (millis() - this.lastShieldSoundTime > 500) {
              audioManager.playSound('brokenShield'); // Usar AudioManager
              this.lastShieldSoundTime = millis();
            }
            this.hasShield = false;
            return false;
          } else {
            this.loseOneLife();
            if (this.lifes < 1) return true;
            return false;
          }
        }
      }
      return false;
    }
  
    catchPower() {
      for (let i = 0; i < powerUps.length; i++) {
        let power = powerUps[i];
        if ((power.pos.x + power.s_width >= this.pos.x && power.pos.x <= this.pos.x + this.s_width) &&
          (power.pos.y + power.s_height >= this.pos.y && power.pos.y <= this.pos.y + this.s_height)) {
          audioManager.playSound('powerUp'); // Usar AudioManager
          this.usePower(power);
        }
      }
    }    
  
    usePower(power) {
      console.log("Power-up capturado:", power.type);
      switch (power.type) {
        case PowerUpType.SPEED:
          if (!this.speedBoostActive) {
            this.speedBoostActive = true;
            this.speedBoostStartTime = millis();
            this.originalMaxVelocity = this.maxVelocity; // Almacenar la velocidad original
            this.maxVelocity += 3; // Incrementar la velocidad máxima del jugador
          }
          break;
  
        case PowerUpType.CADENCY:
          if (this.shootDelay > this.minShootDelay) {
            this.shootDelay -= 100;
            console.log("Nueva cadencia:", this.shootDelay);
          }
          break;
  
        case PowerUpType.DOUBLE_POINTS:
          doublePoints = true;
          doublePointsActivation = millis();
          break;          
  
        case PowerUpType.FREEZE:
          alienGroup.freezeActivation = millis();
          alienGroup.freezeDuration = config.powerUpDurations.FREEZE || 6800;
          alienGroup.freezealienshipgroup();          
          break;
  
        case PowerUpType.NOENEMYBULLETS:
          enemyBullets = [];
          break;
  
        case PowerUpType.EXTRA_LIFE:
          this.lifes++;
          break;
  
        case PowerUpType.SHIELD:
          this.hasShield = true;
          this.shieldActivation = millis();
          this.shieldDuration = config.powerUpDurations.SHIELD || 5000;
          break;
  
        default:
          console.warn("Tipo de power-up desconocido:", power.type);
          break;
      }
  
      let index = powerUps.indexOf(power);
      if (index !== -1) {
        powerUps.splice(index, 1);
      }
    }    
  
    startDeathAnimation() {
      this.isDead = true;
      this.deadAnimStartTime = millis();
      audioManager.playSound('explosion');
    }    
  
    isDeathAnimationFinished() {
      return millis() - this.deadAnimStartTime > this.deadAnimDuration * this.imagesDead.length;
    }    
  
    loseOneLife() {
      enemyBullets = [];
      myBullets = [];
      powerUps = [];
      this.lifes--;
      this.startDeathAnimation();
    }
    releaseAllKeys() { // Resetea el estado de todas las teclas relacionadas con la nave
      // Restablecer todas las teclas de movimiento
      this.movement = [false, false, false, false];
      this.isShooting = false;
      this.acc.set(0, 0); // Detener aceleración
      this.vel.set(0, 0); // Detener velocidad
    }    
    respawn() {
      this.pos.x = width / 2 - this.s_width / 2;
      this.isDead = false;
    }
  
    update() {
      this.decelerate();
      this.updateAcc();
      this.vel.add(this.acc).limit(this.maxVelocity);
      this.pos.add(this.vel);
      this.collision();
    
      // Actualizar la estela si el efecto SPEED está activo
      if (this.speedBoostActive) {
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.trailLimit) {
          this.trail.shift(); // Eliminar posiciones antiguas
        }
      } else {
        this.trail = []; // Limpiar la estela cuando SPEED no está activo
      }
    
      if (!this.isDead) this.shoot();
    
      // Desactivar el escudo si el tiempo ha expirado
      if (this.hasShield && millis() - this.shieldActivation > this.shieldDuration) {
        this.hasShield = false;
      }
    
      // Desactivar el efecto SPEED
      if (this.speedBoostActive && millis() - this.speedBoostStartTime > this.speedBoostDuration) {
        this.speedBoostActive = false;
        this.maxVelocity = this.originalMaxVelocity; // Restaurar la velocidad original
      }
    
      // Desactivar puntos dobles
      if (doublePoints && millis() - doublePointsActivation > this.doublePointsDuration) {
        doublePoints = false;
      }
    
      // Controlar el cambio de estado de la imagen de la nave
      if (millis() - this.prevMillis > this.imageDelay) {
        this.imageState = (this.imageState + 1) % this.maxImageStates;
        this.prevMillis = millis();
      }
    }         
  
    render() {
      if (this.isDead) {
        let elapsedTime = millis() - this.deadAnimStartTime;
        if (elapsedTime < this.deadAnimDuration) {
          image(this.imagesDead[0], this.pos.x, this.pos.y, this.s_width, this.s_height);
        }
        if (this.isDeathAnimationFinished()) {
          this.respawn();
        }
      } else {
        push();
    
        // Efecto visual del escudo (SHIELD)
        if (this.hasShield) {
          stroke(119, 255, 255, 240); // Halo celeste
          strokeWeight(2);
          noFill();
          ellipse(this.pos.x + this.s_width / 2, this.pos.y + this.s_height / 2, this.s_width + 20);
        }
    
        // Efecto visual de estela (SPEED)
        if (this.speedBoostActive) {
          for (let i = 0; i < this.trail.length; i++) {
            let t = this.trail[i];
            fill(119, 255, 255, 50 - (i * 5)); // Color tenue con opacidad decreciente
            noStroke();
            rect(t.x, t.y, this.s_width, this.s_height); // Dibujar la estela
          }
        }
    
        image(this.imagesAlive[this.imageState], this.pos.x, this.pos.y, this.s_width, this.s_height);
        pop();
      }
    }       
  }