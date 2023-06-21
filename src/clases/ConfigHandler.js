import { config } from './../config.js';
import browser from "webextension-polyfill";
//import * as browser from './webextension-polyfill.js';

export default class ConfigHandler {
  constructor() {
    this.settings = {};

    browser.storage.onChanged.addListener((changes, areaName) => {
      const manifest = ConfigHandler.getManifestData()
      console.log(`==> ${manifest.name}: Config handler, areaName: ${areaName} changes -->`, changes, ConfigHandler.getManifestData())
        if (areaName === 'sync') {
            this.updateSettings(changes);
        }
    });
  }

  static async create() {
    const handler = new ConfigHandler();
    await handler.getSettings();
    console.log(`==> handler`, handler )
    return handler;
  }
  static getManifestData(){
    let manifestData = browser.runtime.getManifest();
    return manifestData
  }
  static displayVersion() {
    let manifestData = browser.runtime.getManifest();
    console.log("🚀 ~ ConfigHandler.js:26 manifestData.version:", manifestData.version)
    return manifestData.version;
  }

  async getSettings() {
    const configKeys = config.filter((field) => field?.name !== undefined);
    const configKeyNames = configKeys.map(key => key.name);
    let result = await browser.storage.sync.get(configKeyNames);

    for (const key of configKeys) {
        this.settings[key.name] = result[key.name] || key.defaultValue;
    }
    return this.settings
  }

  async getItem(itemKey) {
    let result = await browser.storage.sync.get(itemKey);
    return result[itemKey];
  }

  static async obtenerIdiomaNavegador() {
    return new Promise((resolve) => {
      resolve(navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language);
    });
  }

  async setSettings(newSettings) {
    console.log("🚀🚀🚀 ~setSettings ~ newSettings:", newSettings)
    await browser.storage.sync.set(newSettings);
    
  }

  updateSettings(changes) {
    for (let key in changes) {
      let storageChange = changes[key];
      this.settings[key] = storageChange.newValue;
    }
  }
}
