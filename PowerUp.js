class PowerUp {
  constructor(type, pos, s_width, s_height, vel, image) {
    this.type = type;
    this.pos = pos.copy();
    this.s_width = s_width;
    this.s_height = s_height;
    this.vel = vel;
    this.image = image;
    this.active = true;
    this.duration = config.powerUpDurations[type] || 5000; // Centralizado
  }

  render() {
    image(this.image, this.pos.x, this.pos.y, this.s_width, this.s_height);
  }

  update() {
    this.pos.add(this.vel);
    if (this.pos.y > height) {
      this.active = false;
    }
  }
}
