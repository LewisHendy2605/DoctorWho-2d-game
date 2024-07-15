class AudioManager {
  constructor() {
    this.music = new Audio(); // Create a new Audio object
    this.music.loop = true; // Set the music to loop
  }

  loadMusic(src) {
    this.music.src = src; // Set the source of the music
    this.music.load(); // Load the music file
  }

  playMusic() {
    if (this.music.src) {
      this.music.play(); // Play the music
    }
  }

  pauseMusic() {
    this.music.pause(); // Pause the music
  }

  stopMusic() {
    this.music.pause(); // Pause the music
    this.music.currentTime = 0; // Reset the music to the start
  }

  playBackground(src) {
    const effect = new Audio(src);
    effect
      .play()
      .catch((error) => console.error("Failed to play effect:", error));
  }
}
