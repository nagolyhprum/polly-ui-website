import PollyUI from 'polly-ui'
import App from './app'
import color from './res/color'
import string from './res/string'
import font from './res/font'
import state from './res/state'
import drawable from './res/drawable'
PollyUI.start(App, { color, string, font, drawable }, state)
