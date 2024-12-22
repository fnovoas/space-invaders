class LevelManager {
  constructor(config) {
    this.levels = config.levels;
    this.currentLevel = 1;
  }

  getCurrentLevelConfig() {
    return this.levels[this.currentLevel - 1] || null;
  }

  advanceLevel() {
    if (this.currentLevel < this.levels.length) {
      this.currentLevel++;
      return true; // Nivel avanzado
    }
    return false; // No hay más niveles
  }

  resetLevels() {
    this.currentLevel = 1;
  }
}
