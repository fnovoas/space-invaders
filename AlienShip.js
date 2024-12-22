class AlienShip {
    constructor(type, pos, s_width, s_height, lifes, imagesAlive, imagesDead) {
      this.type = type;
      this.pos = pos.copy();
      this.vel = createVector(type === 'specialAlien' ? random([-1, 1]) : 1, 0);
      this.lifes = lifes;
      this.s_width = s_width;
      this.s_height = s_height;
      this.imagesAlive = imagesAlive;
      this.imagesDead = imagesDead;
      this.maxImageStates = imagesAlive.length;
      this.isDead = false;
      this.canShoot = false;
      this.deadAnimStartTime = 0;
      this.deadAnimDuration = 1000;
      this.lastShotTime = 0;
      this.shotDelay = random(1500, 3000);
      this.lastMoveTime = 0;
      this.timeToMove = 1;
      this.imageDelay = 1000;
      this.prevMillis = 0;
      this.imageState = 0;
      this.newPowerUp = null;
      this.scoreValue = type === 'specialAlien' ? 100 : 10;
  
      switch (type) {
        case 'alienA':
          this.scoreValue = 10;
          break;
        case 'alienB':
          this.scoreValue = 30;
          break;
        case 'alienC':
          this.scoreValue = 20;
          break;
        default:
          this.scoreValue = 0;
          break;
      }
    }
  
    isDeath() {
      if (!this.isDead) {
        for (let i = 0; i < myBullets.length; i++) {
          let bullet = myBullets[i];
          if ((bullet.pos.x + bullet.b_width >= this.pos.x && bullet.pos.x <= this.pos.x + this.s_width) &&
            bullet.pos.y <= this.pos.y + this.s_height && bullet.pos.y + bullet.b_height >= this.pos.y) {
            myBullets.splice(i, 1);
            this.startDeathAnimation();
            this.newPowerUp = this.spawnPowerUp();
            if (this.newPowerUp != null) {
              powerUps.push(this.newPowerUp);
            }
  
            if (doublePoints) {
              actualScore += this.scoreValue * 2;
            } else {
              actualScore += this.scoreValue;
            }
            return true;
          }
        }
      }
      return false;
    }
  
    startDeathAnimation() {
      this.isDead = true;
      this.deadAnimStartTime = millis();
      s.setVolume(0.1);
      soundinvader.play();
    }
  
    isDeathAnimationFinished() {
      return millis() - this.deadAnimStartTime > this.deadAnimDuration;
    }
  
    move() {
      if (millis() - this.lastMoveTime > this.timeToMove) {
          this.pos.add(this.vel);
          if (this.type === 'specialAlien' && (this.pos.x < 0 || this.pos.x + this.s_width > width)) {
              this.vel.x *= -1; // Rebote en los bordes para el alien especial
          }
          this.lastMoveTime = millis();
      }
  }
  
    shoot() {
      if (millis() - this.lastShotTime < this.shotDelay) return;
      console.log("Shooting")
      let bulletVel = createVector(0, random(2, 4));
      let bulletPos = this.pos.copy().add(this.s_width / 2, 0);
      this.lastShotTime = millis();
      enemyBullets.push(new Bullet(bulletPos, bulletVel, 5, 10, color(200, 0, 50)));
    }
  
    spawnPowerUp() {
      let spawnProbability = 0.25; // Probabilidad de generación
      if (random() < spawnProbability) {
          let powerUpPos = createVector(this.pos.x, this.pos.y);
          let vel = random(1, 3);
          let powerUpVel = createVector(0, vel);
  
          // Mapeo de probabilidades y tipos de power-ups
          let powerUpTypes = [
              { prob: 0.20, type: PowerUpType.SHIELD, image: shield },
              { prob: 0.34, type: PowerUpType.CADENCY, image: cadency },
              { prob: 0.50, type: PowerUpType.DOUBLE_POINTS, image: doublepoints },
              { prob: 0.70, type: PowerUpType.FREEZE, image: freeze },
              { prob: 0.85, type: PowerUpType.SPEED, image: speed },
              { prob: 0.95, type: PowerUpType.NOENEMYBULLETS, image: nobullets },
              { prob: 1.00, type: PowerUpType.EXTRA_LIFE, image: extralife },
          ];
  
          // Determinar el tipo de power-up
          let typePowerProb = random();
          console.log("Random value for type selection:", typePowerProb);
          for (let i = 0; i < powerUpTypes.length; i++) {
              if (typePowerProb < powerUpTypes[i].prob) {
                  console.log("Selected PowerUp:", powerUpTypes[i].type);
                  return new PowerUp(
                      powerUpTypes[i].type,
                      powerUpPos,
                      32,
                      32,
                      powerUpVel,
                      powerUpTypes[i].image
                  );
              }
          }
      }
      return null; // No generar power-up
  }  
  
  update() {
    this.move();
    if (this.canShoot){
      this.shoot();
    }
    this.isDeath();
    /*
    if (this.isDead && this.isDeathAnimationFinished()) {
      this.isDead = false; // Limpia la animación de muerte
    }
    */
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
      } else {
        image(this.imagesAlive[this.imageState], this.pos.x, this.pos.y, this.s_width, this.s_height);
      }
    }
  }