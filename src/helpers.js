/**
 * Inserts HTML into the specified selector at the specified position.
 * @param {string} HTML - The HTML to insert.
 * @param {string} selector - The CSS selector for the element to insert into.
 * @param {string} position - The position to insert the HTML. Can be 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'.
 */
export function HTMLInjector(HTML, selector, position) {
  // 'beforebegin': Antes del elemento en sí.
  // 'afterbegin': Justo dentro del elemento, antes de su primer hijo.
  // 'beforeend': Justo dentro del elemento, después de su último hijo.
  // 'afterend': Después del elemento en sí.
  var intervalId = setInterval(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach((element) => {
        element.insertAdjacentHTML(position, HTML);
      });
      clearInterval(intervalId);
    }
  }, 1000); // 1000ms = 1s
}

/**
 * Waits for an element with the specified CSS selector to exist in the DOM, then resolves with the element.
 * @param {string} cssSelector - The CSS selector for the element to wait for.
 * @returns {Promise} A promise that resolves with the element when it exists in the DOM.
 */
export function waitForElement(cssSelector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const element = document.querySelector(cssSelector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 300);
  });
}

/**
 * Attaches an event listener to the document that listens for the specified event type on an element with the specified text content, tag name, and class name. When the element is clicked, the specified event handler is called with the event object.
 * @param {Object} elementInfo - An object containing the text content, tag name, and class name of the element to listen for.
 * @param {string} eventType - The type of event to listen for.
 * @param {function} eventHandler - The function to call when the element is clicked.
 */
export function delegateEventListenerByText(
  elementInfo,
  eventType,
  eventHandler,
) {
  /*
  elementInfo = {
    innerText: '',
    tagName: '',
    className: '',
  }
  */
  console.log(
    'elementInfo, eventType, eventHandler',
    elementInfo,
    eventType,
    eventHandler,
  );
  // agregar el evento al document (elemento padre)
  document.addEventListener(
    eventType,
    function (event) {
      // obtener el elemento al que se hizo clic
      var targetElement = event.target;
      // recorrer la cadena de ancestros del elemento hasta encontrar un elemento que coincida con el texto
      while (targetElement != null) {
        if (
          targetElement.textContent.trim().toLowerCase() ===
            elementInfo.innerText &&
          targetElement.tagName.toLowerCase() ===
            elementInfo.tagName.toLowerCase() &&
          targetElement.className.toLowerCase() ===
            elementInfo.className.toLowerCase()
        ) {
          eventHandler.call(targetElement, event);
          break;
        }
        targetElement = targetElement.parentElement;
      }
    },
    false,
  );
}

/**
 * Attaches an event listener to the document that listens for the specified event type on an element with the specified CSS selector. When the element is clicked, the specified event handler is called with the event object.
 * @param {string} selector - The CSS selector for the element to listen for.
 * @param {string} eventType - The type of event to listen for.
 * @param {function} eventHandler - The function to call when the element is clicked.
 */
export function delegateEventListener(selector, eventType, eventHandler) {
  // agregar el evento al document (elemento padre)
  document.addEventListener(
    eventType,
    function (event) {
      // obtener el elemento al que se hizo clic
      var targetElement = event.target;

      // recorrer la cadena de ancestros del elemento hasta encontrar un elemento que coincida con el selector
      while (targetElement != null) {
        if (targetElement.matches(selector)) {
          eventHandler.call(targetElement, event);
          break;
        }
        targetElement = targetElement.parentElement;
      }
    },
    false,
  );
}

/**
 * Gets the value stored in Chrome storage for the specified key, or the specified default value if the key is not found.
 * @param {string} key - The key to retrieve the stored value for.
 * @param {*} defaultValue - The default value to return if the key is not found.
 * @returns {Promise} A promise that resolves with the stored value or the default value if the key is not found.
 */
export function getStoredValue(key, defaultValue) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key] == undefined ? defaultValue : result[key]);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Watches for changes in the stored value for the specified key and calls the specified callback function with the new value when a change is detected.
 * @param {string} key - The key to watch for changes in the stored value.
 * @param {function} callback - The function to call with the new value when a change is detected.
 * @throws {Error} Unsupported browser if the browser is not Chrome or Firefox.
 */
export function watchStoredValue(key, callback) {
  if (typeof chrome !== 'undefined') {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[key]) {
        callback(changes[key].newValue);
      }
    });
  } else if (typeof browser !== 'undefined') {
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[key]) {
        callback(changes[key].newValue);
      }
    });
  } else {
    throw new Error('Unsupported browser');
  }
}
/**
 * Gets the internationalized message for the specified key.
 * @param {string} key - The key for the internationalized message.
 * @returns {string} The internationalized message for the specified key.
 * @throws {Error} Unsupported browser if the browser is not Chrome or Firefox.
 */
export function geti18nMessage(key) {
  if (typeof chrome !== 'undefined') {
    // Chrome browser detected
    return chrome.i18n.getMessage(key);
  } else if (typeof browser !== 'undefined') {
    // Firefox browser detected
    return browser.i18n.getMessage(key);
  } else {
    // Unknown browser
    throw new Error('Unsupported browser');
  }
}
