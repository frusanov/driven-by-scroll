
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
        window.addEventListener('scroll', DrivenByScroll.onScroll);
        DrivenByScroll.onScroll();
        DrivenByScroll.onResize();
    };
    DrivenByScroll.stop = function () {
        delete DrivenByScroll.resizeObserver;
        window.removeEventListener('scroll', DrivenByScroll.onScroll);
    };
    DrivenByScroll.destroyAll = function () {
        DrivenByScroll.observed.splice(0, DrivenByScroll.observed.length);
    };
    DrivenByScroll.onResize = function () {
        DrivenByScroll.lastResize = Date.now();
        DrivenByScroll.windowHeight = Math.round(window.innerHeight);
        DrivenByScroll.observed.forEach(function (instance) { return instance.calcBaseSizes(); });
        DrivenByScroll.onScroll();
    };
    DrivenByScroll.onScroll = function () {
        if (1000 / DrivenByScroll.maxFPS > Date.now() - DrivenByScroll.lastScroll)
            return;
        DrivenByScroll.lastScroll = Date.now();
        var scrollTop = Math.round(window.pageYOffset);
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
    DrivenByScroll.windowHeight = window.innerHeight;
    DrivenByScroll.viewPortTopLine = window.scrollY;
    DrivenByScroll.viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
    DrivenByScroll.maxFPS = 60;
    DrivenByScroll.observed = [];
    DrivenByScroll.lastResize = Date.now();
    DrivenByScroll.lastScroll = Date.now();
    return DrivenByScroll;
}());
DrivenByScroll.start();

module.exports = DrivenByScroll;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvbm9ybW9saXNlUHJvZ3Jlc3MudHMiLCIuLi9zcmMvdXRpbHMvdGhyb3R0bGUudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7U0FBd0IsaUJBQWlCLENBQUMsS0FBYTtJQUNyRCxJQUFJLENBQUMsR0FBRyxLQUFLO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEIsSUFBSSxDQUFDLEdBQUcsS0FBSztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sS0FBSyxDQUFDO0FBQ2Y7O0FDQ0EsSUFBTSxRQUFRLEdBQUcsVUFBQyxFQUFZLEVBQUUsSUFBa0I7SUFBbEIscUJBQUEsRUFBQSxVQUFrQjtJQUNoRCxJQUFJLFVBQW1CLEVBQ3JCLE1BQXFDLEVBQ3JDLFFBQWdCLENBQUM7SUFDbkIsT0FBTztRQUNMLElBQU0sT0FBTyxHQUFHLElBQUksRUFDbEIsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEIsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0QixVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO2FBQU07WUFDTCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsTUFBTSxHQUFHLFVBQVUsQ0FBQztnQkFDbEIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxJQUFJLElBQUksRUFBRTtvQkFDakMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3hCLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQ3ZCO2FBQ0YsRUFBRSxJQUFJLENBQUMsR0FB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
