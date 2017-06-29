import CollapseTable from './CollapseTable'
import ElementUtilities from './ElementUtilities'
import EventThrottle from './EventThrottle'
import LazyLoadTransform from './LazyLoadTransform'
import Rectangle from './Rectangle'

const UNTHROTTLED_RESIZE_EVENT_TYPE = 'resize'
const UNTHROTTLED_SCROLL_EVENT_TYPE = 'scroll'
const THROTTLED_RESIZE_EVENT_TYPE = 'resize:lazy-load-throttled'
const THROTTLED_SCROLL_EVENT_TYPE = 'scroll:lazy-load-throttled'

const THROTTLE_PERIOD_MILLISECONDS = 100

/**
 * This class subscribes to key page events, applying lazy load transforms or inversions as
 * applicable. It has external dependencies on the section-toggled custom event and the following
 * standard browser events: resize, scroll.
 */
export default class {
  /**
   * @param {!Window} window
   * @param {!number} loadDistanceMultiplier viewport distance multiplier.
   */
  constructor(window, loadDistanceMultiplier) {
    this._window = window

    this._placeholders = []
    this._resizeEventThrottle = new EventThrottle(window, THROTTLE_PERIOD_MILLISECONDS)
    this._scrollEventThrottle = new EventThrottle(window, THROTTLE_PERIOD_MILLISECONDS)
    this._loadImagesCallback = () =>
      this._loadImages(this._newLoadEligibilityRectangle(loadDistanceMultiplier))
  }

  /**
   * This function may register.
   * @param {!Element} element
   * @return {void}
   */
  transform(element) {
    const images = LazyLoadTransform.queryTransformImages(element)
    const placeholders = LazyLoadTransform.transform(this._window.document, images)
    this._placeholders = this._placeholders.concat(placeholders)
    this._register()
  }

  /**
   * This method may be safely called even when already unregistered.
   * @return {void}
   */
  deregister() {
    if (!this._registered()) { return }

    this._window.removeEventListener(THROTTLED_SCROLL_EVENT_TYPE, this._loadImagesCallback)
    this._window.addEventListener(THROTTLED_RESIZE_EVENT_TYPE, this._loadImagesCallback)
    this._window.removeEventListener(CollapseTable.SECTION_TOGGLED_EVENT_TYPE,
      this._loadImagesCallback)

    this._scrollEventThrottle.deregister()
    this._resizeEventThrottle.deregister()
  }

  /**
   * This method may be safely called even when already registered.
   * @return {void}
   */
  _register() {
    if (this._registered() || !this._placeholders.length) { return }

    this._resizeEventThrottle.register(this._window, UNTHROTTLED_RESIZE_EVENT_TYPE,
      new CustomEvent(THROTTLED_RESIZE_EVENT_TYPE))
    this._scrollEventThrottle.register(this._window, UNTHROTTLED_SCROLL_EVENT_TYPE,
      new CustomEvent(THROTTLED_SCROLL_EVENT_TYPE))

    this._window.addEventListener(CollapseTable.SECTION_TOGGLED_EVENT_TYPE,
      this._loadImagesCallback)
    this._window.addEventListener(THROTTLED_RESIZE_EVENT_TYPE, this._loadImagesCallback)
    this._window.addEventListener(THROTTLED_SCROLL_EVENT_TYPE, this._loadImagesCallback)
  }

  /** @return {!boolean} */
  _registered() { return this._resizeEventThrottle.registered() }

  /**
   * @param {!Rectangle} viewport
   * @return {void}
   */
  _loadImages(viewport) {
    this._placeholders = this._placeholders.filter(placeholder =>
      !(this._isImageEligibleToLoad(placeholder, viewport)
        && LazyLoadTransform.loadImage(this._window.document, placeholder)))
  }

  /**
   * @param {!HTMLSpanElement} placeholder
   * @param {!Rectangle} viewport
   * @return {!boolean}
   */
  _isImageEligibleToLoad(placeholder, viewport) {
    return ElementUtilities.isVisible(placeholder)
      && ElementUtilities.intersectsViewportRectangle(placeholder, viewport)
  }

  /**
   * @return {!Rectangle} The boundaries for images eligible to load relative the viewport. Images
   *                      within these boundaries may already be loading or loaded; images outside
   *                      of these boundaries should not be loaded as they're ineligible, however,
   *                      they may have previously been loaded.
   */
  _newLoadEligibilityRectangle(loadDistanceMultiplier) {
    const x = 0
    const y = 0
    const width = this._window.innerWidth * loadDistanceMultiplier
    const height = this._window.innerHeight * loadDistanceMultiplier
    return new Rectangle(y, x + width, y + height, x)
  }
}