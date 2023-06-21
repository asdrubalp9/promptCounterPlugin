import DrusPlugins from './clases/DrusPlugins.js';
import PromptCounter from './clases/PromptCounter.js';
import SoundActivator from './clases/SoundActivator.js';
import { HTMLInjector, delegateEventListener } from './helpers.js';


const plugin = new DrusPlugins();
const counter = new PromptCounter();
const dingus = new SoundActivator();

dingus.init();
counter.init()
  .then(() => console.log('PromptCounter initialized.'))
  .catch(err => console.error('Failed to initialize PromptCounter:', err));