class AlienShip {
  constructor(type, pos, s_width, s_height, lifes, imagesAlive, imagesDead) {
      this.type = type;
      this.pos = pos.copy();
      this.vel = createVector(1, 0);
      this.lifes = lifes;
      this.s_width = s_width;
      this.s_height = s_height;
      this.imagesAlive = imagesAlive;
      this.imagesDead = imagesDead;
      this.maxImageStates = imagesAlive.length;
      this.isDead = false;
      this.canShoot = false;
      this.deadAnimStartTime = 0;
      this.deadAnimDuration = config.alienSettings.deadAnimDuration || 1000; // Duración centralizada
      this.lastShotTime = 0;
      this.shotDelay = random(...config.alienSettings.shotDelayRange || [1500, 3000]); // Rango centralizado
      this.lastMoveTime = 0;
      this.timeToMove = config.alienSettings.timeToMove || 1; // Tiempo centralizado
      this.imageDelay = config.alienSettings.imageDelay || 1000; // Centralizado
      this.prevMillis = 0;
      this.imageState = 0;
      this.newPowerUp = null;

      // Puntajes centralizados por tipo
      this.scoreValue = config.scores[type] || 0;
  }

  isDeath() {
      if (!this.isDead) {
          for (let i = 0; i < myBullets.length; i++) {
              let bullet = myBullets[i];
              if (
                  bullet.pos.x + bullet.b_width >= this.pos.x &&
                  bullet.pos.x <= this.pos.x + this.s_width &&
                  bullet.pos.y <= this.pos.y + this.s_height &&
                  bullet.pos.y + bullet.b_height >= this.pos.y
              ) {
                  myBullets.splice(i, 1);
                  this.startDeathAnimation();
                  this.newPowerUp = this.spawnPowerUp();
                  if (this.newPowerUp != null) {
                      powerUps.push(this.newPowerUp);
                  }

                  // Uso de `scoreManager` para gestionar el puntaje
                  scoreManager.addScore(this.scoreValue * (doublePoints ? 2 : 1));
                  return true;
              }
          }
      }
      return false;
  }

  startDeathAnimation() {
      this.isDead = true;
      this.deadAnimStartTime = millis();
      audioManager.playSound('invaderKilled'); // Usar AudioManager
  }

  isDeathAnimationFinished() {
      return millis() - this.deadAnimStartTime > this.deadAnimDuration;
  }

  move() {
      if (millis() - this.lastMoveTime > this.timeToMove) {
          this.pos.add(this.vel);
          this.lastMoveTime = millis();
      }
  }

  shoot() {
      if (millis() - this.lastShotTime < this.shotDelay) return;
      audioManager.playSound('alienShoot'); // Usar AudioManager para sonido
      let bulletVel = createVector(0, random(2, 4));
      let bulletPos = this.pos.copy().add(this.s_width / 2, 0);
      this.lastShotTime = millis();
      enemyBullets.push(new Bullet(bulletPos, bulletVel, 5, 10, color(200, 0, 50)));
  }

  spawnPowerUp() {
      let spawnProbability = config.powerUpSettings.spawnProbability || 0.25; // Probabilidad centralizada
      if (random() < spawnProbability) {
          let powerUpPos = createVector(this.pos.x, this.pos.y);
          let vel = random(...config.powerUpSettings.velocityRange || [1, 3]);
          let powerUpVel = createVector(0, vel);

          // Mapeo de tipos de power-ups centralizado
          let powerUpTypes = config.powerUpSettings.types || [];
          let typePowerProb = random();

          for (let i = 0; i < powerUpTypes.length; i++) {
              if (typePowerProb < powerUpTypes[i].prob) {
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
      if (this.canShoot) {
          this.shoot();
      }
      if (this.isDeath()) {
          scoreManager.addScore(this.scoreValue);
      }
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
