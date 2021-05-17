
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

    var DrivenByScroll = (function () {
        function DrivenByScroll(element, callback) {
            this.yTop = 0;
            this.yBottom = 0;
            this.height = 0;
            this.enterPosition = 0;
            this.exitPosition = 0;
            this.actionAreaHeight = 0;
            this.stepPerPixel = 0;
            this.priority = 1;
            this.$element = element;
            this.callback = callback;
            this.calcBaseSizes();
            DrivenByScroll.observed.push(this);
        }
        DrivenByScroll.start = function () {
            window.addEventListener('scroll', DrivenByScroll.onScroll);
            window.addEventListener('resize', DrivenByScroll.onResize);
            DrivenByScroll.onScroll();
            DrivenByScroll.onResize();
        };
        DrivenByScroll.stop = function () {
            window.removeEventListener('scroll', DrivenByScroll.onScroll);
            window.removeEventListener('resize', DrivenByScroll.onResize);
        };
        DrivenByScroll.destroyAll = function () {
            DrivenByScroll.observed.splice(0, DrivenByScroll.observed.length);
        };
        DrivenByScroll.onResize = function () {
            if (500 > Date.now() - DrivenByScroll.lastResize)
                return;
            DrivenByScroll.lastResize = Date.now();
            DrivenByScroll.windowHeight = window.innerHeight;
            DrivenByScroll.observed.forEach(function (instance) { return instance.calcBaseSizes(); });
        };
        DrivenByScroll.onScroll = function () {
            if (1000 / DrivenByScroll.maxFPS > Date.now() - DrivenByScroll.lastScroll)
                return;
            DrivenByScroll.lastScroll = Date.now();
            if (DrivenByScroll.currentPriority === 5)
                DrivenByScroll.onResize();
            var scrollTop = window.pageYOffset;
            var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
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
        DrivenByScroll.prototype.destroy = function () {
            var index = DrivenByScroll.observed.indexOf(this);
            DrivenByScroll.observed.splice(index, 1);
        };
        DrivenByScroll.prototype.calcBaseSizes = function () {
            var rect = this.$element.getBoundingClientRect();
            this.height = rect.height;
            this.yTop = rect.top + DrivenByScroll.viewPortTopLine;
            this.yBottom = this.yTop + this.height;
            this.enterPosition = this.yTop - DrivenByScroll.windowHeight;
            this.exitPosition = this.yBottom;
            this.actionAreaHeight = this.exitPosition - this.enterPosition;
            this.stepPerPixel = 1 / this.actionAreaHeight;
        };
        DrivenByScroll.prototype.calculateInstancePriority = function () {
            var screensFromPosition = 0;
            if (this.yTop > DrivenByScroll.viewPortTopLine &&
                this.yBottom > DrivenByScroll.viewPortTopLine) {
                screensFromPosition =
                    (this.yTop - DrivenByScroll.viewPortTopLine) /
                        DrivenByScroll.windowHeight;
            }
            else if (this.yBottom < DrivenByScroll.viewPortTopLine) {
                screensFromPosition =
                    (DrivenByScroll.viewPortTopLine - this.yBottom) /
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
            var progressInPixels = DrivenByScroll.viewPortTopLine - this.yBottom + this.actionAreaHeight;
            var progress = normoliseProgress(progressInPixels / this.actionAreaHeight);
            var fromTopToBottom = normoliseProgress((DrivenByScroll.viewPortTopLine - this.yBottom + this.height) /
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy9ub3Jtb2xpc2VQcm9ncmVzcy50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O2FBQXdCLGlCQUFpQixDQUFDLEtBQWE7UUFDckQsSUFBSSxDQUFDLEdBQUcsS0FBSztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEtBQUs7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4QixPQUFPLEtBQUssQ0FBQztJQUNmOzs7UUMrRUUsd0JBQVksT0FBb0IsRUFBRSxRQUFrQjtZQXJFN0MsU0FBSSxHQUFHLENBQUMsQ0FBQztZQUNULFlBQU8sR0FBRyxDQUFDLENBQUM7WUFDWixXQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsa0JBQWEsR0FBRyxDQUFDLENBQUM7WUFDbEIsaUJBQVksR0FBRyxDQUFDLENBQUM7WUFDakIscUJBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLGFBQVEsR0FBRyxDQUFDLENBQUM7WUErRGxCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBRXpCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUlyQixjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQztRQW5FTSxvQkFBSyxHQUFaO1lBQ0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0QsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLGNBQWMsQ0FBQyxRQUFRLEVB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
