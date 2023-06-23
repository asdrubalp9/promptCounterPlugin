// Para soportar tanto Google Chrome como Mozilla Firefox
import ReviewReminder from './clases/ReviewReminder.js';
const extension = typeof browser !== 'undefined' ? browser : chrome;

extension.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateBadge') {
        let count = request.data.count;

        // Actualizar el color del badge dependiendo del conteo
        let textColor = [255, 255, 255, 255]; // Blanco por defecto
        let color;
        if (count < 10) color = [0, 255, 0, 255]; // verde
        else if (count < 20) color = [255, 255, 0, 255]; // amarillo
        else color = [255, 0, 0, 255]; // rojo
        if (color.toString() === [255, 255, 0, 255].toString()) {
          textColor = [0, 0, 0, 255]; // Negro para amarillo
        }
        
        if (typeof browser !== 'undefined') {
            // Firefox usa 'browser'
            browser.browserAction.setBadgeBackgroundColor({ color: color });
            browser.browserAction.setBadgeText({ text: count.toString() });
            browser.browserAction.setBadgeTextColor({ color: textColor });
        } else {
            // Chrome usa 'chrome'
            chrome.action.setBadgeBackgroundColor({ color: color });
            chrome.action.setBadgeText({ text: count.toString() });
            chrome.action.setBadgeTextColor({ color: textColor });
        }
    }
});


extension.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'getTabUrl') {
    // Obtén la URL de la pestaña actual
    extension.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        sendResponse({ tabUrl: tabs[0].url });
      } else {
        // Maneja el caso en que no hay pestañas activas
        sendResponse({ tabUrl: '' });
      }
    });

    // Esto es necesario para hacer que sendResponse sea asincrónico
    return true;
  }
});

(async function() {
  const reviewUrl = 'https://chrome.google.com/webstore/detail/gpt4-promptcounter/hllmajaolaombcgdgdfodckdmhaphbli';
  const reviewReminder = new ReviewReminder(reviewUrl);
  await reviewReminder.initReminder();
})();
