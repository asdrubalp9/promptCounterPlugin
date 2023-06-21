import ElementMonitor from './ElementMonitor.js'; // import the ElementMonitor class
import ConfigHandler from './ConfigHandler.js';
import browser from "webextension-polyfill";
export default class SoundActivator {
  constructor() {
    const audioUrl = chrome.runtime.getURL('sounds/ding.mp3');
    this.audio = new Audio(audioUrl);
    this.configHandler = null
    this.soundConfig = 'always'
    this.elementMonitor = null
  }

  async init() {
    this.configHandler = await ConfigHandler.create();
    // console.log('initializing SoundMoinitor', this.configHandler)
    this.elementMonitor = new ElementMonitor(/(Stop generating)/i, /(Regenerate response|New response|There was an error generating a response|Generate new response)/i, "eventStartTalking", document, 'FORM', 200);
    this.elementMonitor.init();
    document.addEventListener(this.elementMonitor.eventName, () => {
      this.playSound();
    });
  }

  async destroy() {
    return new Promise ((resolve, reject) => {
      document.removeEventListener("eventStartTalking", () => {});
      this.configHandler = null
      this.elementMonitor = null
      setTimeout(() => {
        resolve()
      }, 300)
    })
  }

  async playSound() {
    // Get the sound setting from the Chrome storage
    this.soundConfig = await this.configHandler.getItem('sound');
    // console.log("🚀 ~ soundConfig:", this.soundConfig)
    if (this.soundConfig === 'never') {
      return;
    }
    try {
      // Use `browser` instead of `chrome`
      const response = await browser.runtime.sendMessage({ message: 'getTabUrl' });
      // console.log("🚀 ~response:", response)
      // If the sound setting is 'notFocused' and the tab is focused, don't play the sound
      if (this.soundConfig === 'notFocused' && response.tabUrl.includes('chat.openai.com')) {
        return;
      }
      console.log("DING! 🛎️")
      this.audio.play();
    } catch (error) {
      console.error('Failed DING',error);
    }
  }
}


