import { SceneLoader } from './SceneLoader'

export class Controller {
	public static create(): void {
		var worker = new Worker(new URL('../worker/worker.ts', import.meta.url));
		var canvas: HTMLCanvasElement = <any>document.getElementById('renderCanvas');
		var offscreen = canvas.transferControlToOffscreen();
		worker.postMessage({
			type: 'init',
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			canvas: offscreen
		}, [offscreen]);

		var controller = new Controller(worker, canvas);
	}

	public static createDirect(): void {
		var canvas: HTMLCanvasElement = <any>document.getElementById('renderCanvas');
		var sceneLoader = new SceneLoader(canvas);
	}

	constructor(private worker: Worker, private canvas: HTMLCanvasElement) {
		worker.onmessage = this.onMessage();
		window.addEventListener('resize', this.onResize(), false);
	}

	// Events props to send to worker
	private mouseEventFields = new Set([
		'altKey',
		'bubbles',
		'button',
		'buttons',
		'cancelBubble',
		'cancelable',
		'clientX',
		'clientY',
		'composed',
		'ctrlKey',
		'defaultPrevented',
		'detail',
		'eventPhase',
		'fromElement',
		'isTrusted',
		'layerX',
		'layerY',
		'metaKey',
		'movementX',
		'movementY',
		'offsetX',
		'offsetY',
		'pageX',
		'pageY',
		'relatedTarget',
		'returnValue',
		'screenX',
		'screenY',
		'shiftKey',
		'timeStamp',
		'type',
		'which',
		'x',
		'y',
		'deltaX',
		'deltaY',
		'deltaZ',
		'deltaMode',

		'altKey',
		'bubbles',
		'cancelBubble',
		'cancelable',
		'charCode',
		'code',
		'composed',
		'ctrlKey',
		'defaultPrevented',
		'detail',
		'eventPhase',
		'isComposing',
		'isTrusted',
		'key',
		'keyCode',
		'location',
		'metaKey',
		'repeat',
		'returnValue',
		'shiftKey',
		'timeStamp',
		'type',
		'which'
	]);

	public onMessage() {
		return (msg) => {
			switch (msg.data.type) {
				case 'event':
					this.bindEvent(msg.data);
					break;
				case 'canvasMethod':
					this.canvas[msg.data.method](...msg.data.args);
					break;
				case 'canvasStyle':
					this.canvas.style[msg.data.name] = msg.data.value;
					break;
				case 'elementStyle':
					Object.assign(document.getElementById(msg.data.id).style, msg.data.style);
					break;
			};
		}
	}

		/**
	 * Bind DOM element
	 * @param data
	 */
	private bindEvent(data) {

		let target;

		switch (data.targetName) {
			case 'window':
				target = window;
				break;
			case 'canvas':
				target = this.canvas;
				break;
			case 'document':
				target = document;
				break;
		}

		if (!target) {
			console.error('Unknown target: ' + data.targetName);
			return;
		}

		if (data.eventName.startsWith('key')) {
			target = document;
		}

		target.addEventListener(data.eventName, (e) => {
			// We can`t pass original event to the worker
			const eventClone = this.cloneEvent(e);
			this.worker.postMessage({
				type: 'event',
				targetName: data.targetName,
				eventName: data.eventName,
				eventClone: eventClone,
			});

		}, data.opt);

	}

	/**
	 * Cloning Event to plain object
	 * @param event
	 */
	private cloneEvent(event) {

		event.preventDefault();

		const eventClone = {};

		for (let field of this.mouseEventFields) {
			eventClone[field] = event[field];
		}

		return eventClone;
	}

	private onResize() {
		return () => {
			this.worker.postMessage({
				type: 'resize',
				rect: this.canvas.getBoundingClientRect(),
			});
		}
	}
}