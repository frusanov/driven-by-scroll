
  /**
   * @license
   * author: Feodor Rusanov <f.rusanov@gmail.com> (https://feodor.me)
   * DrivenByScroll.js v1.0.0-alpha
   * Released under the MIT license.
   */

'use strict';

function normoliseProgress(value) {
    if (0 > value)
        return 0;
    if (1 < value)
        return 1;
    return value;
}

var throttle = function (fn, wait) {
    if (wait === void 0) { wait = 300; }
    var inThrottle, lastFn, lastTime;
    return function () {
        var context = this, args = arguments;
        if (!inThrottle) {
            fn.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        }
        else {
            clearTimeout(lastFn);
            lastFn = setTimeout(function () {
                if (Date.now() - lastTime >= wait) {
                    fn.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};

var DrivenByScroll = (function () {
    function DrivenByScroll(element, callback) {
        var _a;
        this.top = 0;
        this.bottom = 0;
        this.height = 0;
        this.enterPosition = 0;
        this.exitPosition = 0;
        this.actionAreaHeight = 0;
        this.stepPerPixel = 0;
        this.priority = 1;
        this.$element = element;
        this.callback = callback;
        this.calcBaseSizes();
        this.scrollHandler();
        (_a = DrivenByScroll.resizeObserver) === null || _a === void 0 ? void 0 : _a.observe(this.$element);
        DrivenByScroll.observed.push(this);
    }
    DrivenByScroll.prototype.destroy = function () {
        var index = DrivenByScroll.observed.indexOf(this);
        DrivenByScroll.observed.splice(index, 1);
    };
    DrivenByScroll.prototype.calcBaseSizes = function () {
        var rect = this.$element.getBoundingClientRect();
        this.height = rect.height;
        this.top = Math.round(rect.top + DrivenByScroll.viewPortTopLine);
        this.bottom = Math.round(this.top + this.height);
        this.enterPosition = this.top - DrivenByScroll.windowHeight;
        this.exitPosition = this.bottom;
        this.actionAreaHeight = this.exitPosition - this.enterPosition;
        this.stepPerPixel = 1 / this.actionAreaHeight;
    };
    DrivenByScroll.prototype.calculateInstancePriority = function () {
        var screensFromPosition = 0;
        if (this.top > DrivenByScroll.viewPortTopLine &&
            this.bottom > DrivenByScroll.viewPortTopLine) {
            screensFromPosition =
                (this.top - DrivenByScroll.viewPortTopLine) /
                    DrivenByScroll.windowHeight;
        }
        else if (this.bottom < DrivenByScroll.viewPortTopLine) {
            screensFromPosition =
                (DrivenByScroll.viewPortTopLine - this.bottom) /
                    DrivenByScroll.windowHeight;
        }
        screensFromPosition = Math.round(screensFromPosition);
        if (5 < screensFromPosition)
            screensFromPosition = 5;
        this.priority = screensFromPosition;
    };
    DrivenByScroll.prototype.scrollHandler = function () {
        if (this.priority > DrivenByScroll.currentPriority)
            return;
        var progressInPixels = DrivenByScroll.viewPortTopLine - this.bottom + this.actionAreaHeight;
        var progress = normoliseProgress(progressInPixels / this.actionAreaHeight);
        var fromTopToBottom = normoliseProgress((DrivenByScroll.viewPortTopLine - this.bottom + this.height) /
            (this.height - DrivenByScroll.windowHeight));
        this.callback({
            instance: this,
            viewPortTopLine: DrivenByScroll.viewPortTopLine,
            viewPortBottomLine: DrivenByScroll.viewPortBottomLine,
            fromEnterToOut: progress,
            fromEnterToMiddle: normoliseProgress(progress * 2),
            fromTopToBottom: fromTopToBottom,
        });
        this.calculateInstancePriority();
    };
    DrivenByScroll.start = function () {
        DrivenByScroll.resizeObserver = new ResizeObserver(throttle(DrivenByScroll.onResize, 500));
        globalThis.addEventListener('scroll', DrivenByScroll.onScroll);
        DrivenByScroll.onScroll();
        DrivenByScroll.onResize();
    };
    DrivenByScroll.stop = function () {
        delete DrivenByScroll.resizeObserver;
        globalThis.removeEventListener('scroll', DrivenByScroll.onScroll);
    };
    DrivenByScroll.destroyAll = function () {
        DrivenByScroll.observed.splice(0, DrivenByScroll.observed.length);
    };
    DrivenByScroll.onResize = function () {
        DrivenByScroll.lastResize = Date.now();
        DrivenByScroll.windowHeight = Math.round(globalThis.innerHeight);
        DrivenByScroll.observed.forEach(function (instance) { return instance.calcBaseSizes(); });
        DrivenByScroll.onScroll();
    };
    DrivenByScroll.onScroll = function () {
        if (1000 / DrivenByScroll.maxFPS > Date.now() - DrivenByScroll.lastScroll)
            return;
        DrivenByScroll.lastScroll = Date.now();
        var scrollTop = Math.round(globalThis.pageYOffset);
        var clientTop = Math.round(document.documentElement.clientTop);
        DrivenByScroll.viewPortTopLine = scrollTop - clientTop;
        DrivenByScroll.viewPortBottomLine =
            DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
        DrivenByScroll.observed.forEach(function (instance) {
            instance.scrollHandler();
        });
        DrivenByScroll.nextGlobalPriority();
    };
    DrivenByScroll.nextGlobalPriority = function () {
        if (5 > DrivenByScroll.currentPriority) {
            DrivenByScroll.currentPriority++;
        }
        else {
            DrivenByScroll.currentPriority = 1;
        }
    };
    DrivenByScroll.currentPriority = 1;
    DrivenByScroll.windowHeight = globalThis.innerHeight;
    DrivenByScroll.viewPortTopLine = globalThis.scrollY;
    DrivenByScroll.viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
    DrivenByScroll.maxFPS = 60;
    DrivenByScroll.observed = [];
    DrivenByScroll.lastResize = Date.now();
    DrivenByScroll.lastScroll = Date.now();
    return DrivenByScroll;
}());
DrivenByScroll.start();

module.exports = DrivenByScroll;
//# sourceMappingURL=index.cjs.js.map
