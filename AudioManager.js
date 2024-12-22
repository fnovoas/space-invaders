class AudioManager {
    constructor(audioConfig) {
      this.sounds = {};
      for (const [key, path] of Object.entries(audioConfig)) {
        console.log(`Cargando sonido: ${path}`); // Depuración
        this.sounds[key] = loadSound(path, 
          () => console.log(`Sonido cargado: ${key}`), 
          () => console.warn(`Error al cargar sonido: ${key}`)
        );
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
  