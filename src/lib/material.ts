/*
 * Central registration point for @material/web custom elements. Importing a
 * component here calls `customElements.define(...)` as a side effect, so any
 * `<md-*>` tag used anywhere in the app must have its module imported once
 * from this file. Keep imports scoped (per-component) rather than the
 * `@material/web/all.js` barrel to avoid shipping unused components.
 */
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/fab/fab.js';
import '@material/web/elevation/elevation.js';
import '@material/web/divider/divider.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/radio/radio.js';
import '@material/web/checkbox/checkbox.js';
