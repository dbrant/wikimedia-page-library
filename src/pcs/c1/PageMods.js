import BodySpacingTransform from '../../transform/BodySpacingTransform'
import CollapseTable from '../../transform/CollapseTable'
import DimImagesTransform from '../../transform/DimImagesTransform'
import LazyLoadTransformer from '../../transform/LazyLoadTransformer'
import Scroller from './Scroller'
import ThemeTransform from '../../transform/ThemeTransform'

/**
 * Executes common JS functionality the client should start, like hooking up events for
 * lazy loading and table collapsing/expanding.
 * Client side complement of server-side DOM transformations.
 * Note: this will be called automatically when DOM is ready
 * @param {!Window} window
 * @param {!Document} document
 * @return {void}
 */
const onPageLoad = (window, document) => {
  const lazyLoader = new LazyLoadTransformer(window, 2)
  lazyLoader.collectExistingPlaceholders(document.body)
  lazyLoader.loadPlaceholders()

  CollapseTable.setupEventHandling(window, document, true, Scroller.scrollWithDecorOffset)
}

/**
 * @typedef {function} OnSuccess
 * @return {void}
 */

/**
 * Makes multiple page modifications based on client specific settings, which should be called
 * during initial page load.
 * @param {!Document} document
 * @param {!{}} settings client settings
 *   { theme, dimImages, margins, areTablesCollapsed, scrollTop }
 * @param {?OnSuccess} onSuccess callback
 * @return {void}
 */
const setMulti = (document, settings, onSuccess) => {
  if (settings.theme !== undefined) {
    ThemeTransform.setTheme(document, settings.theme)
  }
  if (settings.dimImages !== undefined) {
    // TODO: update once DimImagesTransform doesn't require the window parameter anymore
    DimImagesTransform.dim(document.defaultView, settings.dimImages)
  }
  if (settings.margins !== undefined) {
    BodySpacingTransform.setMargins(document.body, settings.margins)
  }
  if (settings.areTablesCollapsed) {
    CollapseTable.toggleCollapsedForAll(document.body)
  }
  if (settings.scrollTop !== undefined) {
    Scroller.setScrollTop(settings.scrollTop)
  }

  if (onSuccess instanceof Function) {
    onSuccess()
  }
}

/**
 * Sets the theme.
 * @param {!Document} document
 * @param {!string} theme one of the values in Themes
 * @param {?OnSuccess} onSuccess callback
 * @return {void}
 */
const setTheme = (document, theme, onSuccess) => {
  ThemeTransform.setTheme(document, theme)

  if (onSuccess instanceof Function) {
    onSuccess()
  }
}

/**
 * Turns on dimming of images.
 * @param {!Document} document
 * @param {!boolean} dimImages true if images should be dimmed, false otherwise
 * @param {?OnSuccess} onSuccess callback
 * @return {void}
 */
const setDimImages = (document, dimImages, onSuccess) => {
  // TODO: update once DimImagesTransform doesn't require the window parameter anymore
  DimImagesTransform.dim(document.defaultView, dimImages)

  if (onSuccess instanceof Function) {
    onSuccess()
  }
}

/**
 * Sets the margins.
 * @param {!Document} document
 * @param {!{BodySpacingTransform.Spacing}} margins
 * @param {?OnSuccess} onSuccess callback
 * @return {void}
 */
const setMargins = (document, margins, onSuccess) => {
  BodySpacingTransform.setMargins(document.body, margins)

  if (onSuccess instanceof Function) {
    onSuccess()
  }
}

/**
 * Sets the top scroll position for collapsing of tables (when bottom close button is tapped).
 * @param {!Document} document
 * @param {!number} scrollTop height of decor covering the top portion of the Viewport in pixel
 * @param {?OnSuccess} onSuccess callback
 * @return {void}
 */
const setScrollTop = (document, scrollTop, onSuccess) => {
  Scroller.setScrollTop(scrollTop)

  if (onSuccess instanceof Function) {
    onSuccess()
  }
}

/**
 * Gets the Scroller object. Just for testing!
 * @return {{setScrollTop, scrollWithDecorOffset}}
 */
const getScroller = () => Scroller


export default {
  onPageLoad,
  setMulti,
  setTheme,
  setDimImages,
  setMargins,
  setScrollTop,
  testing: {
    getScroller
  }
}

// automatically invoked when DOM is ready
document.addEventListener('DOMContentLoaded', () => onPageLoad(window, document))