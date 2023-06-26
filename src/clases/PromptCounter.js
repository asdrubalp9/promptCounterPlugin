import ConfigHandler from './ConfigHandler.js';
import { delegateEventListener, waitForElement } from './../helpers.js';
import browser from "webextension-polyfill";
//import * as browser from './webextension-polyfill.js';


export default class PromptCounter {

    /*
    TODO:
    hacer que vigile los botones con el contenido: regenerate response, continue generating y contarlos
    /*/
    constructor() {
        this.notCountableModels = [
            "gpt-3.5",
            "gpt-3",
        ]
        this.configHandler = null
        this.fechaUltimoPrompt = null
        this.promptCount = 0
        this.maxPromptCount = 25
        //PromptCounter.resetPlugin()
    }

    async init () {
        this.configHandler = await ConfigHandler.create();
        this.initializePromptCountingVariables();
        this.setPromptCounterListeners();
    }

    validateIfGPTVersionIsCountable(){
        const block = document.querySelector('main > div > div > div > div > div');
        let countPrompt = true
        const html = block.outerHTML
        if(block){
            if(this.notCountableModels.some(modelo => html.toLowerCase().includes(modelo.toLowerCase()))){
                countPrompt = false
            }
        }
        if(this.notCountableModels.some(modelo => window.location.href.toLowerCase().includes(modelo.toLowerCase()))){
            countPrompt = false
        }
        if(countPrompt){
            this.addPromptCount()
            .then(() => {
                this.updateBadge();
            });
        }
    }
    
    setPromptCounterListeners() {
        console.log('setPromptCounterListeners')
        function isEnterBeingPressed(evt){
            const tagName = document.activeElement.tagName.toLowerCase();
            if ((tagName === 'input' || tagName === 'textarea') && evt.key === 'Enter' && !evt.shiftKey) {
                this.validateIfGPTVersionIsCountable()
            }
        }
        document.addEventListener('keydown', (e) => {isEnterBeingPressed(e)});

        delegateEventListener('FORM button.absolute:last-child', 'click', async () => {
            console.log('button Clicked')
            this.validateIfGPTVersionIsCountable()
        });
    }

    async initializePromptCountingVariables() {
        this.fechaUltimoPrompt = await this.configHandler.getItem('fechaUltimoPrompt');
        this.promptCount = await this.configHandler.getItem('promptCount');
        if(await this.checkIfResetIsNeeded()){
            await this.resetPromptCount();
        }
        this.updateBadge();
    }

    checkIfResetIsNeeded (){
        let now = new Date();
        let hoursSinceLastPrompt = (now - new Date(this.fechaUltimoPrompt)) / 1000 / 60 / 60;
        console.log("🚀 ~ hoursSinceLastPrompt:", hoursSinceLastPrompt)
        if (hoursSinceLastPrompt > 3)  return true
        return false
    }

    async addPromptCount(){
        return new Promise(async (resolve, reject) => {
            if(await this.checkIfResetIsNeeded()){
                await this.resetPromptCount();
            }
            if(this.promptCount < this.maxPromptCount){
                this.promptCount++;
                console.log("🚀 ~ Adding to count:", this.promptCount)
                await this.setCountingSettings();
                this.updateBadge();
            }
            resolve();
        })
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
        browser.runtime.sendMessage({action: 'updateBadge', data: {count: this.promptCount}});
    }

    async destroy(){
        console.log('promptcounter destroyed')
        return new Promise((resolve) => {
            this.configHandler = null
            this.fechaUltimoPrompt = null
            this.promptCount = 0
            const sendBtn = document.querySelector('FORM button.absolute:last-child');
            sendBtn.removeEventListener("click", () => {});
            document.removeEventListener("keydown", () => {});
            setTimeout(() => {
                resolve()
            }, 300)
        });
    }
    static async resetPlugin(){
        // esta funcion solo es para reiniciar los valores del plugin, quizas buscas la funcion destroy
        const configHandler = await ConfigHandler.create();
        await configHandler.setSettings({ 'promptCount': 0, 'fechaUltimoPrompt': new Date().toString() });
        browser.runtime.sendMessage({action: 'updateBadge', data: {count: 0}});
    }
}
