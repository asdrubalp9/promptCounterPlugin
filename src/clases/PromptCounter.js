import ConfigHandler from './ConfigHandler.js';
import { delegateEventListener, waitForElement } from './../helpers.js';
import browser from "webextension-polyfill";
//import * as browser from './webextension-polyfill.js';


export default class PromptCounter {

    /*
    TODO: revisar si se resetea el counting despues de 3 horas
    no esta contando bien los prompts despues de ir de una pagina a otra
    hacer que vigile los botones con el contenido: regenerate response, continue generating y contarlos
    verificar que el tiempo se tome bien
    /*/
    constructor() {
        this.modelosGpt4 = [
            "model: web browsing",
            "model: gpt-4",
            "model: plugins",
            "gpt-4"
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

    validateIfGPTVersionIsCountable(html){
        if(this.modelosGpt4.some(modelo => html.toLowerCase().includes(modelo.toLowerCase()))){
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
                let countPrompt = false
                if(block){
                    console.log("🚀 ~ setPromptCounterListeners ~ block", block, block.outerHTML.includes('GPT-4'), this.validateIfGPTVersionIsCountable(block.outerHTML), window.location.href, this.validateIfGPTVersionIsCountable(window.location.href))
                    if (this.validateIfGPTVersionIsCountable(window.location.href)) {
                        countPrompt = true
                    }
                    if (this.validateIfGPTVersionIsCountable(block.outerHTML)) {
                        countPrompt = true
                    }
                    if(countPrompt){
                        await this.addPromptCount();
                        this.updateBadge();
                    }
                }
            }
        });

        delegateEventListener('FORM button.absolute:last-child', 'click', async () => {
            console.log('--------------->>>>FORM button.absolute:last-child')
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
        console.log("🚀 ~ hoursSinceLastPrompt:", hoursSinceLastPrompt)
        if (hoursSinceLastPrompt > 3)  return true
        return false
    }

    async addPromptCount(){
        if(await this.checkIfResetIsNeeded()){
            await this.resetPromptCount();
        }
        if(this.promptCount < this.maxPromptCount){
            this.promptCount++;
            console.log("🚀 ~ Adding to count:", this.promptCount)
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
