export class Timer {
    ended: boolean = false;
    disabled: boolean = false;

    constructor(
        public callback: () => void = () => { },
        public delay?: number,
    ) {
        this._setup();
    }

    private _timeout: any;
    private _setup() {
        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = null;
        if (this.delay && !this.ended && !this.disabled) {
            this._timeout = setTimeout(() => {
                this.ended = true;
                this.callback();
            }, this.delay);
        }
    }

    resetWithDelay(delay: number) {
        this.delay = delay;
        this.reset();
        return this;
    }

    setCallback(cb: () => void) {
        this.callback = cb;
        return this;
    }

    reset() {
        this.ended = false;
        this._setup();
        return this;
    }

    end() {
        this.ended = true;
        this._setup();
        this.callback();
        return this;
    }
};
