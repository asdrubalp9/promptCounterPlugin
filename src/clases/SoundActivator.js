import ElementMonitor from './ElementMonitor.js'; // import the ElementMonitor class
import ConfigHandler from './ConfigHandler.js';
export default class SoundActivator {
  constructor() {
    const audioUrl = chrome.runtime.getURL('sounds/ding.mp3');
    this.audio = new Audio(audioUrl);
    this.configHandler = null
    
    this.elementMonitor = new ElementMonitor(/(Stop generating)/i, /(Regenerate response|New response|There was an error generating a response|Generate new response)/i, "eventStartTalking", document, 'FORM', 200);
  }

  async init() {
    this.configHandler = await ConfigHandler.create();
    console.log('initializing SoundMoinitor', this.configHandler)
    this.elementMonitor.init();
    document.addEventListener(this.elementMonitor.eventName, () => {
      console.log("DING!")
      this.playSound();
    });
  }

  playSound() {
    // Get the sound setting from the Chrome storage
    chrome.storage.sync.get(['sound'], (result) => {
      const soundSetting = result.sound;

      // If the sound setting is 'never', don't play the sound
      if (soundSetting === 'never') {
        return;
      }

      chrome.runtime.sendMessage({ message: 'getTabUrl' }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }

        // If the sound setting is 'notFocused' and the tab is focused, don't play the sound
        if (soundSetting === 'notFocused' && response.tabUrl.includes('chat.openai.com')) {
          return;
        }

        this.audio.play();
      });
    });
  }
}


