// Para soportar tanto Google Chrome como Mozilla Firefox
const extension = typeof browser !== 'undefined' ? browser : chrome;

extension.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('BACKGROUND ACTIVATED!!!request', request)
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
