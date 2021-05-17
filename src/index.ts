import normoliseProgress from './utils/normoliseProgress';

interface DrivenByScrollStatus {
  instance: DrivenByScroll;
  viewPortTopLine: number;
  viewPortBottomLine: number;
  fromEnterToOut: number;
  fromEnterToMiddle: number;
  fromTopToBottom: number;
}

class DrivenByScroll {
  static currentPriority = 1;
  static windowHeight = window.innerHeight;
  static viewPortTopLine = window.scrollY;
  static viewPortBottomLine =
    DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
  static maxFPS = 60;
  static observed: Array<DrivenByScroll> = [];
  static lastResize: number = Date.now();
  static lastScroll: number = Date.now();

  // Static methods you can find at the bottom

  public $element: HTMLElement;
  public top = 0;
  public bottom = 0;
  public height = 0;
  public enterPosition = 0;
  public exitPosition = 0;
  public actionAreaHeight = 0;
  public stepPerPixel = 0;
  public priority = 1;

  private callback: (status: DrivenByScrollStatus) => void;

  constructor(
    element: HTMLElement,
    callback: (status: DrivenByScrollStatus) => void
  ) {
    this.$element = element;
    this.callback = callback;

    this.calcBaseSizes();
    this.scrollHandler();

    DrivenByScroll.observed.push(this);
  }

  public destroy(): void {
    const index = DrivenByScroll.observed.indexOf(this);
    DrivenByScroll.observed.splice(index, 1);
  }

  // public forceCalc() {
  //   const memPriority = this.priority;
  //   this.priority = 0;
  //   onResizeInstanceHandler(this);
  //   onScrollInstanceHandler(this);
  // }

  public calcBaseSizes(): void {
    const rect = this.$element.getBoundingClientRect();

    this.height = rect.height;
    this.top = rect.top + DrivenByScroll.viewPortTopLine;
    this.bottom = this.top + this.height;

    this.enterPosition = this.top - DrivenByScroll.windowHeight;
    this.exitPosition = this.bottom;

    this.actionAreaHeight = this.exitPosition - this.enterPosition;
    this.stepPerPixel = 1 / this.actionAreaHeight;
  }

  public calculateInstancePriority(): void {
    let screensFromPosition = 0;

    /**
     * Если обозреваемый элемент вне зоны видимости, вычесляет колличество
     * экранов до него.
     */
    if (
      this.top > DrivenByScroll.viewPortTopLine &&
      this.bottom > DrivenByScroll.viewPortTopLine
    ) {
      // Выше зоны видимости
      screensFromPosition =
        (this.top - DrivenByScroll.viewPortTopLine) /
        DrivenByScroll.windowHeight;
    } else if (this.bottom < DrivenByScroll.viewPortTopLine) {
      // Ниже зоны видимости
      screensFromPosition =
        (DrivenByScroll.viewPortTopLine - this.bottom) /
        DrivenByScroll.windowHeight;
    }

    screensFromPosition = Math.round(screensFromPosition);
    if (5 < screensFromPosition) screensFromPosition = 5;

    this.priority = screensFromPosition;
  }

  public scrollHandler(): void {
    if (this.priority > DrivenByScroll.currentPriority) return;

    const progressInPixels =
      DrivenByScroll.viewPortTopLine - this.bottom + this.actionAreaHeight;
    const progress = normoliseProgress(
      progressInPixels / this.actionAreaHeight
    );

    const fromTopToBottom = normoliseProgress(
      (DrivenByScroll.viewPortTopLine - this.bottom + this.height) /
        (this.height - DrivenByScroll.windowHeight)
    );

    this.callback({
      instance: this,
      viewPortTopLine: DrivenByScroll.viewPortTopLine,
      viewPortBottomLine: DrivenByScroll.viewPortBottomLine,
      fromEnterToOut: progress,
      fromEnterToMiddle: normoliseProgress(progress * 2),
      fromTopToBottom,
    });

    this.calculateInstancePriority();
  }

  /**
   * Static methods
   */

  static start(): void {
    window.addEventListener('scroll', DrivenByScroll.onScroll);
    window.addEventListener('resize', DrivenByScroll.onResize);
    DrivenByScroll.onScroll();
    DrivenByScroll.onResize();
  }

  static stop(): void {
    window.removeEventListener('scroll', DrivenByScroll.onScroll);
    window.removeEventListener('resize', DrivenByScroll.onResize);
  }

  static destroyAll(): void {
    DrivenByScroll.observed.splice(0, DrivenByScroll.observed.length);
  }

  static onResize(): void {
    if (500 > Date.now() - DrivenByScroll.lastResize) return;
    DrivenByScroll.lastResize = Date.now();
    DrivenByScroll.windowHeight = window.innerHeight;
    DrivenByScroll.observed.forEach((instance) => instance.calcBaseSizes());
  }

  static onScroll(): void {
    if (1000 / DrivenByScroll.maxFPS > Date.now() - DrivenByScroll.lastScroll)
      return;

    DrivenByScroll.lastScroll = Date.now();

    /**
     * На каждом пятом скролле пересчитываются позиции элементов
     *
     * TODO: это место необходимо оптимизировать чтобы пересчет был существенно реже.
     */
    if (DrivenByScroll.currentPriority === 5) DrivenByScroll.onResize();

    const scrollTop = window.pageYOffset;
    const clientTop =
      document.documentElement.clientTop || document.body.clientTop || 0;

    DrivenByScroll.viewPortTopLine = scrollTop - clientTop;
    DrivenByScroll.viewPortBottomLine =
      DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
    DrivenByScroll.observed.forEach((instance) => {
      instance.scrollHandler();
    });

    DrivenByScroll.nextGlobalPriority();
  }

  static nextGlobalPriority(): void {
    if (5 > DrivenByScroll.currentPriority) {
      DrivenByScroll.currentPriority++;
    } else {
      DrivenByScroll.currentPriority = 1;
    }
  }
}

DrivenByScroll.start();

export default DrivenByScroll;
