class AudioManager {
    constructor(audioConfig) {
      this.sounds = {};
      for (const [key, path] of Object.entries(audioConfig)) {
        this.sounds[key] = loadSound(path);
      }
    }
  
    playSound(key) {
      if (this.sounds[key]) {
        this.sounds[key].play();
      }
    }
  
    setVolume(key, volume) {
      if (this.sounds[key]) {
        this.sounds[key].setVolume(volume);
      }
    }
  }
  