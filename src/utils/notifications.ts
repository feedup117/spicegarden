export class NotificationSound {
  private static audioMap: { [key: string]: HTMLAudioElement } = {};
  private static initialized = false;
  private static userInteracted = false;

  static init() {
    try {
      this.audioMap = {
        notify: new Audio('/assets/sounds/preparing.mp3'), // Use preparing sound as fallback for notify
        preparing: new Audio('/assets/sounds/preparing.mp3'),
        ready: new Audio('/assets/sounds/foodready.mp3')
      };

      // Preload all sounds and track initialization
      Object.entries(this.audioMap).forEach(([key, audio]) => {
        audio.load();
        console.log(`Loaded sound: ${key}`);
        
        // Add event listeners for debugging
        audio.addEventListener('playing', () => console.log(`Playing ${key} sound`));
        audio.addEventListener('error', (e) => console.error(`Error playing ${key} sound:`, e));
      });

      this.initialized = true;
      console.log('NotificationSound initialized successfully');
    } catch (err) {
      console.error('Failed to initialize NotificationSound:', err);
      this.initialized = false;
    }
  }

  // Call this on any user gesture (e.g., click/tap)
  static setUserInteracted() {
    this.userInteracted = true;
    // Optionally, unlock all audio elements by playing muted
    Object.values(this.audioMap).forEach(audio => {
      audio.muted = true;
      audio.play().catch(() => {});
      setTimeout(() => { audio.pause(); audio.muted = false; }, 100);
    });
  }

  static play(type: 'notify' | 'preparing' | 'ready' = 'notify') {
    try {
      if (!this.initialized || !this.audioMap[type]) {
        console.log('Reinitializing NotificationSound...');
        this.init();
      }

      if (!this.audioMap[type]) {
        throw new Error(`Sound type ${type} not found`);
      }

      // Only play if user has interacted
      if (!this.userInteracted) {
        console.warn('User has not interacted with the page yet. Sound will not play.');
        return;
      }

      // Reset the audio to the beginning if it's already playing
      this.audioMap[type].currentTime = 0;
      
      console.log(`Attempting to play sound: ${type}`);
      const playPromise = this.audioMap[type].play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log(`Successfully started playing ${type} sound`))
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              console.warn('Autoplay blocked: user interaction required for sound.');
            } else {
              console.error(`Failed to play ${type} sound:`, err);
            }
            // Fallback to system notification if available
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Order Status Update');
            }
          });
      }
    } catch (err) {
      console.error('Error in NotificationSound.play:', err);
    }
  }
}

export const orderStatusMessages = {
  pending: "Your order has been received! 📝",
  preparing: "Your order is being prepared! 👨‍🍳",
  'order is ready': "Your order is ready! 🍽️",
  cancelled: "Your order has been cancelled 😔"
};