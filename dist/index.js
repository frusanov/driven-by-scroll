
  /**
   * @license
   * author: Feodor Rusanov <f.rusanov@gmail.com> (https://feodor.me)
   * DrivenByScroll.js v1.0.0-alpha
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

    return DrivenByScroll;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy9ub3Jtb2xpc2VQcm9ncmVzcy50cyIsIi4uL3NyYy91dGlscy90aHJvdHRsZS50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7YUFBd0IsaUJBQWlCLENBQUMsS0FBYTtRQUNyRCxJQUFJLENBQUMsR0FBRyxLQUFLO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsS0FBSztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sS0FBSyxDQUFDO0lBQ2Y7O0lDQ0EsSUFBTSxRQUFRLEdBQUcsVUFBQyxFQUFZLEVBQUUsSUFBa0I7UUFBbEIscUJBQUEsRUFBQSxVQUFrQjtRQUNoRCxJQUFJLFVBQW1CLEVBQ3JCLE1BQXFDLEVBQ3JDLFFBQWdCLENBQUM7UUFDbkIsT0FBTztZQUNMLElBQU0sT0FBTyxHQUFHLElBQUksRUFDbEIsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNuQixJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4QixRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN0QixVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ25CO2lCQUFNO2dCQUNMLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckIsTUFBTSxHQUFHLFVBQVUsQ0FBQztvQkFDbEIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxJQUFJLElBQUksRUFBRTt3QkFDakMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3hCLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQ3ZCO2lCQUNGLEVBQUUsSUFBSSxDQUFD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
