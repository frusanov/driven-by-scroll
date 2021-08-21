import normoliseProgress from './utils/normoliseProgress';
import throttle from './utils/throttle';

interface DrivenByScrollStatus {
  instance: DrivenByScroll;
  viewPortTopLine: number;
  viewPortBottomLine: number;
  fromEnterToOut: number;
  fromEnterToMiddle: number;
  fromTopToBottom: number;
}

class DrivenByScroll {
  static intersectionObserver?: IntersectionObserver;
  static resizeObserver?: ResizeObserver;
  static windowHeight = window.innerHeight;
  static viewPortTopLine = window.scrollY;
  static viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
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
  public isVisable = false;

  private callback: (status: DrivenByScrollStatus) => void;

  constructor(element: HTMLElement, callback: (status: DrivenByScrollStatus) => void) {
    this.$element = element;
    this.callback = callback;

    this.calcBaseSizes();
    this.scrollHandler();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    DrivenByScroll.resizeObserver!.observe(this.$element);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    DrivenByScroll.intersectionObserver!.observe(this.$element);
    DrivenByScroll.observed.push(this);
    DrivenByScroll.onScroll();
  }

  public destroy(): void {
    const index = DrivenByScroll.observed.indexOf(this);
    DrivenByScroll.observed.splice(index, 1);
  }

  public calcBaseSizes(): void {
    const rect = this.$element.getBoundingClientRect();

    this.height = rect.height;
    this.top = Math.round(rect.top + DrivenByScroll.viewPortTopLine);
    this.bottom = Math.round(this.top + this.height);

    this.enterPosition = this.top - DrivenByScroll.windowHeight;
    this.exitPosition = this.bottom;

    this.actionAreaHeight = this.exitPosition - this.enterPosition;
    this.stepPerPixel = 1 / this.actionAreaHeight;
  }

  public scrollHandler(): void {
    if (!this.isVisable) return;

    const progressInPixels = DrivenByScroll.viewPortTopLine - this.bottom + this.actionAreaHeight;
    const progress = normoliseProgress(progressInPixels / this.actionAreaHeight);

    const fromTopToBottom = normoliseProgress(
      (DrivenByScroll.viewPortTopLine - this.bottom + this.height) / (this.height - DrivenByScroll.windowHeight)
    );

    this.callback({
      instance: this,
      viewPortTopLine: DrivenByScroll.viewPortTopLine,
      viewPortBottomLine: DrivenByScroll.viewPortBottomLine,
      fromEnterToOut: progress,
      fromEnterToMiddle: normoliseProgress(progress * 2),
      fromTopToBottom,
    });
  }

  /**
   * Static methods
   */

  static start(): void {
    DrivenByScroll.resizeObserver = new ResizeObserver(throttle(DrivenByScroll.onResize, 500));
    DrivenByScroll.intersectionObserver = new IntersectionObserver(DrivenByScroll.onIntersect);

    window.addEventListener('scroll', DrivenByScroll.onScroll);
    DrivenByScroll.onScroll();
    DrivenByScroll.onResize();
  }

  static stop(): void {
    delete DrivenByScroll.resizeObserver;
    delete DrivenByScroll.intersectionObserver;
    window.removeEventListener('scroll', DrivenByScroll.onScroll);
  }

  static destroyAll(): void {
    DrivenByScroll.observed.splice(0, DrivenByScroll.observed.length);
  }

  static throttledOnResize?(): unknown;
  static onResize(): void {
    DrivenByScroll.lastResize = Date.now();
    DrivenByScroll.windowHeight = Math.round(window.innerHeight);
    DrivenByScroll.observed.forEach((instance) => instance.calcBaseSizes());
    DrivenByScroll.onScroll();
  }

  static onScroll = throttle(() => {
    const scrollTop = Math.round(window.pageYOffset);
    const clientTop = Math.round(document.documentElement.clientTop);

    DrivenByScroll.viewPortTopLine = scrollTop - clientTop;
    DrivenByScroll.viewPortBottomLine = DrivenByScroll.viewPortTopLine + DrivenByScroll.windowHeight;
    DrivenByScroll.observed.forEach((instance) => {
      instance.scrollHandler();
    });
  }, 1000 / DrivenByScroll.maxFPS);

  static onIntersect(entries: Array<IntersectionObserverEntry>): void {
    entries.forEach((entry) => {
      const isVisable = entry.isIntersecting;
      const element = entry.target;
      const instance = DrivenByScroll.observed.find((item) => item.$element === element);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      instance!.isVisable = isVisable;

      if (isVisable) instance?.calcBaseSizes();
    });
  }
}

DrivenByScroll.start();

export default DrivenByScroll;
