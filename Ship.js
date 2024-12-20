// Duraciones globales de los power-ups
const DURATION_SHIELD = 5000; // Duración del escudo
const DURATION_SPEED = 5000; // Duración del boost de velocidad
const DURATION_FREEZE = 5000; // Duración del congelamiento
const DURATION_DOUBLE_POINTS = 5000; // Duración de puntos dobles

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
    this.shieldActivation = 0;
    this.shieldDuration = 5000;
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
    this.speedBoostDuration = 5000;
    this.speedBoostStartTime = 0;
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
      if (!this.isShooting || millis() - this.lastShotTime < this.shootDelay) return;
      s.setVolume(0.1);
      soundshoot.play();
      let bulletVel = createVector(0, -8);
      let bulletPos = this.pos.copy().add(this.s_width / 2, 0);
      this.lastShotTime = millis();
      myBullets.push(new Bullet(bulletPos, bulletVel, 5, 10, color(255)));
    }
  
    isDeath() {
      if (this.lifes < 1) return true;
      for (let i = 0; i < enemyBullets.length; i++) {
        let bullet = enemyBullets[i];
        if ((bullet.pos.x + bullet.b_width >= this.pos.x && bullet.pos.x <= this.pos.x + this.s_width) &&
          bullet.pos.y + bullet.b_height >= this.pos.y && bullet.pos.y <= this.pos.y + this.s_height) {
          enemyBullets.splice(i, 1);
          if (this.hasShield) {
            soundbrokenshield.play();
            this.hasShield = false;
            return false;
          } else {
            this.loseOneLife();
            if (this.lifes < 1) return true;
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
          soundpowerup.play();
          this.usePower(power);
        }
      }
    }
  
    usePower(power) {
      console.log("Power-up capturado:", power.type);
      switch (power.type) {
          case PowerUpType.SPEED:
              if (!this.speedBoostActive) {
                  console.log("Activando SPEED");
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
              console.log("Activando DOUBLE_POINTS");
              doublePoints = true;
              doublePointsActivation = millis();
              doublePointsDuration = DURATION_DOUBLE_POINTS;
              break;
  
          case PowerUpType.FREEZE:
              console.log("Activando FREEZE");
              alienGroup.freezeActivation = millis();
              alienGroup.freezeDuration = DURATION_FREEZE; // Asignar duración centralizada
              alienGroup.freezealienshipgroup();
              break;
  
          case PowerUpType.NOENEMYBULLETS:
              console.log("Eliminando balas enemigas");
              enemyBullets = [];
              break;
  
          case PowerUpType.EXTRA_LIFE:
              console.log("Ganando vida extra");
              this.lifes++;
              break;
  
          case PowerUpType.SHIELD:
              console.log("Activando SHIELD");
              this.hasShield = true;
              this.shieldActivation = millis();
              this.shieldDuration = DURATION_SHIELD; // Asignar duración centralizada
              break;
  
          default:
              console.warn("Tipo de power-up desconocido:", power.type);
              break;
      }
  
      // Eliminar el power-up de la lista global
      let index = powerUps.indexOf(power);
      if (index !== -1) {
          powerUps.splice(index, 1);
          console.log("Power-up eliminado de la lista global.");
      }
  }     
  
    startDeathAnimation() {
      this.isDead = true;
      this.deadAnimStartTime = millis();
    }
  
    isDeathAnimationFinished() {
      s.setVolume(0.05);
      soundshipdeath.play();
      return millis() - this.deadAnimStartTime > this.deadAnimDuration * this.imagesDead.length;
    }
  
    loseOneLife() {
      enemyBullets = [];
      myBullets = [];
      powerUps = [];
      this.lifes--;
      this.startDeathAnimation();
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
      if (doublePoints && millis() - doublePointsActivation > doublePointsDuration) {
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
        if (this.hasShield) {
          tint(0, 0, 255, 150); // Efecto visual para el escudo
        }
        if (this.speedBoostActive) {
          stroke(255, 0, 0);
          strokeWeight(2);
          noFill();
          ellipse(this.pos.x + this.s_width / 2, this.pos.y + this.s_height / 2, this.s_width + 20); // Efecto visual de velocidad
        }
        image(this.imagesAlive[this.imageState], this.pos.x, this.pos.y, this.s_width, this.s_height);
        pop();
      }
    }    
  }