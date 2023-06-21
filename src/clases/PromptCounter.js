import ConfigHandler from './ConfigHandler.js';
import { delegateEventListener, waitForElement } from './../helpers.js';
import browser from "webextension-polyfill";
//import * as browser from './webextension-polyfill.js';


export default class PromptCounter {

    /*
    TODO: revisar si se resetea el counting despues de 3 horas
    revisar como tomar el primer prompt nuevo y ver si es gpt3 o gpt4 
    que haga el ding cuando termine de responder
    /*/
  constructor() {
    this.modelosGpt4 = [
        "Model: Web Browsing",
        "Model: GPT-4",
        "GPT"
    ]
    this.configHandler = null
    this.fechaUltimoPrompt = null
    this.promptCount = 0
    this.maxPromptCount = 25
  }

    async init () {
        this.configHandler = await ConfigHandler.create();
        this.initializePromptCountingVariables();
        this.setPromptCounterListeners();
    }

    validateIfGPTVersionIsCountable(html){
        if(this.modelosGpt4.some(modelo => html.includes(modelo))){
            return true
        }
        return false
    }
    setPromptCounterListeners() {
        console.log('setPromptCounterListeners')
        document.addEventListener('keydown', async (e) => {
            const tagName = document.activeElement.tagName.toLowerCase();
            const block = document.querySelector('main > div > div > div > div > div');
            //buscar si tiene boton, si tiene boton ver cual esta seleccionado
            // si no tiene boton usar el actual
            if ((tagName === 'input' || tagName === 'textarea') && e.key === 'Enter' && !e.shiftKey) {
                console.log("🚀 ~ setPromptCounterListeners ~ block", block, block.outerHTML.includes('GPT-4'), this.validateIfGPTVersionIsCountable(block.outerHTML))
                if(block.outerHTML.includes('button')){

                }else{
                    if (this.validateIfGPTVersionIsCountable(block.outerHTML)) {
                    //if (block.outerHTML.includes('GPT-4') && block.outerHTML.includes('Model')) {
                        await this.addPromptCount();
                        this.updateBadge();
                    }
                }
            }
        });

        delegateEventListener('FORM button.absolute:last-child', 'click', async () => {
            await this.addPromptCount();
        });
    }

    async initializePromptCountingVariables() {
        this.fechaUltimoPrompt = await this.configHandler.getItem('fechaUltimoPrompt');
        this.promptCount = await this.configHandler.getItem('promptCount');
        if(await this.checkIfResetIsNeeded()){
            await this.resetPromptCount();
        }
        this.updateBadge();
        console.log("🚀🚀🚀initializePromptCountingVariables", this.promptCount, this.fechaUltimoPrompt)
    }

    checkIfResetIsNeeded (){
        let now = new Date();
        let hoursSinceLastPrompt = (now - new Date(this.fechaUltimoPrompt)) / 1000 / 60 / 60;
        if (hoursSinceLastPrompt > 3)  return true
        return false
    }

    async addPromptCount(){
        if(await this.checkIfResetIsNeeded()){
            await this.resetPromptCount();
        }
        if(this.promptCount < this.maxPromptCount){
            let now = new Date();
            this.promptCount++;
            this.fechaUltimoPrompt = now;
            await this.setCountingSettings();
            this.updateBadge();
        }
    }

    async setCountingSettings() {
        await this.configHandler.setSettings({ 'promptCount': this.promptCount, 'fechaUltimoPrompt': this.fechaUltimoPrompt.toString() });
    }

    async resetPromptCount(){
        this.promptCount = 0;
        this.fechaUltimoPrompt = new Date();
        await this.setCountingSettings();
    }

    updateBadge() {
        const color = this.promptCount < 10 ? 'green' : this.promptCount < 20 ? 'yellow' : 'red';
        console.log("🚀 ~ updateBadge ~ color:", color, this.promptCount, this.fechaUltimoPrompt)
        //chrome.action.setBadgeText({ text: count.toString() });
        //chrome.action.setBadgeBackgroundColor({ color: color });
        // browser.action.setBadgeBackgroundColor({ color: 'red' });
        // browser.action.setBadgeText({ text: this.promptCount });
        browser.runtime.sendMessage({action: 'updateBadge', data: {count: this.promptCount}});
        
        // browser.runtime.sendMessage({
        //     action: 'updateBadge',
        //     data: {
        //         count: this.promptCount,
        //         color: color,
        //     }
        // });
        
    }
}
