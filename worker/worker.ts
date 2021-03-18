import { SceneLoader} from '../src/SceneLoader'
declare var self: any;
var sceneLoader;

//boilerplate wrapper

self.window = {
    addEventListener: function (event, fn, opt) {
        bindHandler('window', event, fn, opt);
    },
    setTimeout: self.setTimeout.bind(self),
    PointerEvent: true,
};

self.document = {
    addEventListener: function (event, fn, opt) {
        bindHandler('document', event, fn, opt);
    },
    // Uses to detect wheel event like at src/Inputs/scene.inputManager.ts:797
    createElement: function () {
        return {
            onwheel: true
        };
    },
    defaultView: self.window,
};

// Not works without it
class HTMLElement { }

/**
 * All event handlers
 * @type {Map<String, Function>} key as (documentcontextmenu, canvaspointerup...)
 */
self.handlers = new Map();

/**
 * @type {OffscreenCanvas}
 */
self.canvas = null;

// getBoundingInfo()
const rect = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    height: 0,
    width: 0,
};

/**
 * addEventListener hooks
 * 1. Store callback in worker
 * 2. Send info to Main thread to bind to DOM elements
 * @param {String} targetName  ['canvas', 'document', 'window']
 * @param {String} eventName
 * @param {Function} fn
 * @param {Boolean} opt third addEventListener argument
 */

function bindHandler(targetName, eventName, fn, opt) {

    const handlerId = targetName + eventName;

    self.handlers.set(handlerId, fn);

    self.postMessage({
        type: 'event',
        targetName: targetName,
        eventName: eventName,
        opt: opt,
    })
}

/**
 * Events from Main thread call this handler which calls right callback saved earlier
 * @param event
 */

function handleEvent(event) {

    const handlerId = event.targetName + event.eventName;

    event.eventClone.preventDefault = noop;

    // Cameras/Inputs/freeCameraMouseInput.ts:79
    event.eventClone.target = self.canvas;

    // Just in case
    if (!self.handlers.has(handlerId)) {
        throw new Error('Unknown handlerId: ' + handlerId);
    }

    self.handlers.get(handlerId)(event.eventClone);

}

function onResize(originalRect) {

    for (let prop of Object.keys(rect)) {
        rect[prop] = originalRect[prop];
    }

    self.canvas.clientWidth = rect.width;
    self.canvas.clientHeight = rect.height;

    self.canvas.width = rect.width;
    self.canvas.height = rect.height;

}

function noop() { }

/**
 * Preparing and hooks canvas
 * @param data
 * @returns {OffscreenCanvas}
 */

function prepareCanvas(data) {

    const canvas = data.canvas;
    self.canvas = canvas;

    canvas.clientWidth = data.width;
    canvas.clientHeight = data.height;

    canvas.width = data.width;
    canvas.height = data.height;

    rect.right = rect.width = data.width;
    rect.bottom = rect.height = data.height;

    canvas.setAttribute = function (name, value) {
        self.postMessage({
            type: 'canvasMethod',
            method: 'setAttribute',
            args: [name, value],
        })
    };

    canvas.addEventListener = function (event, fn, opt) {
        bindHandler('canvas', event, fn, opt);
    };

    canvas.getBoundingClientRect = function () {
        return rect;
    };

    canvas.focus = function () {
        self.postMessage({
            type: 'canvasMethod',
            method: 'focus',
            args: [],
        })
    };

    // noinspection JSUnusedGlobalSymbols
    const style = {
        set touchAction(value) {
            self.postMessage({
                type: 'canvasStyle',
                name: 'touchAction',
                value: value,
            })
        }
    };

    Object.defineProperty(canvas, 'style', {
        get() {
            return style
        }
    });



    return canvas;
}

//---------------

onmessage = function (evt) {
    switch (evt.data.type) {
        case 'event':
            handleEvent(evt.data);
            break;
        case 'resize':
            onResize(evt.data.rect);
            break;
        case 'init':
            init(evt.data);
            break;
    }
}

function init(data) {
    var canvas = data.canvas;
    prepareCanvas({ canvas, width: data.width, height: data.height });


    sceneLoader = new SceneLoader(canvas);
}

