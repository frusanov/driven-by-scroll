
  /**
   * @license
   * author: Feodor Rusanov <f.rusanov@gmail.com> (https://feodor.me)
   * DrivenByScroll.js v1.0.0-alpha2
   * Released under the MIT license.
   */

var DrivenByScroll = (function () {
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
            this.top = 0;
            this.bottom = 0;
            this.height = 0;
            this.enterPosition = 0;
            this.exitPosition = 0;
            this.actionAreaHeight = 0;
            this.stepPerPixel = 0;
            this.isVisable = false;
            this.$element = element;
            this.callback = callback;
            this.calcBaseSizes();
            this.scrollHandler();
            DrivenByScroll.resizeObserver.observe(this.$element);
            DrivenByScroll.intersectionObserver.observe(this.$element);
            DrivenByScroll.observed.push(this);
            DrivenByScroll.onScroll();
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
        DrivenByScroll.prototype.scrollHandler = function () {
            if (!this.isVisable)
                return;
            var progressInPixels = DrivenByScroll.viewPortTopLine - this.bottom + this.actionAreaHeight;
            var progress = normoliseProgress(progressInPixels / this.actionAreaHeight);
            var fromTopToBottom = normoliseProgress((DrivenByScroll.viewPortTopLine - this.bottom + this.height) / (this.height - DrivenByScroll.windowHeight));
            this.callback({
                instance: this,
                viewPortTopLine: DrivenByScroll.viewPortTopLine,
                viewPortBottomLine: DrivenByScroll.viewPortBottomLine,
                fromEnterToOut: progress,
                fromEnterToMiddle: normoliseProgress(progress * 2),
                fromTopToBottom: fromTopToBottom,
            });
        };
        DrivenByScroll.start = function () {
            DrivenByScroll.resizeObserver = new ResizeObserver(throttle(DrivenByScroll.onResize, 500));
            DrivenByScroll.intersectionObserver = new IntersectionObserver(DrivenByScroll.onIntersect);
            window.addEventListener('scroll', DrivenByScroll.onScroll);
            DrivenByScroll.onScroll();
            DrivenByScroll.onResize();
        };
        DrivenByScroll.stop = function () {
            delete DrivenByScroll.resizeObserver;
            delete DrivenByScroll.intersectionObserver;
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
        DrivenByScroll.onIntersect = function (entries) {
            entries.forEach(function (entry) {
                var isVisable = entry.isIntersecting;
                var element = entry.target;
                var instance = DrivenByScroll.observed.find(function (item) { return item.$element === element; });
                instance.isVisable = isVisable;
                if (isVisable)
                    instance === null || instance === void 0 ? void 0 : instance.calcBaseSizes();
            });
        };
        DrivenByScroll.windowHeight = window.innerHeight;
        DrivenByScroll.viewPortTopLine = window.scrollY;
        DrivenByScroll.viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
        DrivenByScroll.maxFPS = 60;
        DrivenByScroll.observed = [];
        DrivenByScroll.lastResize = Date.now();
        DrivenByScroll.lastScroll = Date.now();
        DrivenByScroll.onScroll = throttle(function () {
            var scrollTop = Math.round(window.pageYOffset);
            var clientTop = Math.round(document.documentElement.clientTop);
            DrivenByScroll.viewPortTopLine = scrollTop - clientTop;
            DrivenByScroll.viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
            DrivenByScroll.observed.forEach(function (instance) {
                instance.scrollHandler();
            });
        }, 1000 / DrivenByScroll.maxFPS);
        return DrivenByScroll;
    }());
    DrivenByScroll.start();

    return DrivenByScroll;

}());
//# sourceMappingURL=index.js.map
