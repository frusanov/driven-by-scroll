
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

module.exports = DrivenByScroll;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvbm9ybW9saXNlUHJvZ3Jlc3MudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O1NBQXdCLGlCQUFpQixDQUFDLEtBQWE7SUFDckQsSUFBSSxDQUFDLEdBQUcsS0FBSztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLElBQUksQ0FBQyxHQUFHLEtBQUs7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4QixPQUFPLEtBQUssQ0FBQztBQUNmOzs7SUMrRUUsd0JBQVksT0FBb0IsRUFBRSxRQUFrQjtRQXJFN0MsU0FBSSxHQUFHLENBQUMsQ0FBQztRQUNULFlBQU8sR0FBRyxDQUFDLENBQUM7UUFDWixXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDbEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIscUJBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGFBQVEsR0FBRyxDQUFDLENBQUM7UUErRGxCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUlyQixjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQztJQW5FTSxvQkFBSyxHQUFaO1FBQ0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0QsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLGNBQWMsQ0FBQyxRQUFR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
