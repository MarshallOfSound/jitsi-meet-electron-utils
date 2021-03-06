const electron = require('electron');
const { BrowserWindow } = electron;

const SIZE = {
    width: 320,
    height: 180
};

/**
 * Handles new-window events for the main process in order to customize the
 * BrowserWindow options of the always on top window. This handler will be
 * executed in the context of the main process.
 *
 * @param {BrowserWindow} jitsiMeetWindow - the BrowserWindow object which
 * displays Jitsi Meet.
 *
 * NOTE: All other parameters are standard for electron webcontent's new-window
 * event listeners.
 * @see {@link https://github.com/electron/electron/blob/master/docs/api/web-contents.md#event-new-window}
 */
function onAlwaysOnTopWindow(
        jitsiMeetWindow,
        event,
        url,
        frameName,
        disposition,
        options) {
    if (frameName === 'AlwaysOnTop') {
        event.preventDefault();
        const win = event.newGuest = new BrowserWindow(
            Object.assign(options, {
                backgroundColor: 'transparent',
                width: SIZE.width,
                height: SIZE.height,
                minWidth: SIZE.width,
                minHeight: SIZE.height,
                maxWidth: SIZE.width,
                maxHeight: SIZE.height,
                minimizable: false,
                maximizable: false,
                resizable: false,
                alwaysOnTop: true,
                fullscreen: false,
                fullscreenable: false,
                skipTaskbar: true,
                titleBarStyle: undefined,
                frame: false,
                show: false
            }, getPosition())
        );
        win.once('ready-to-show', () => {
            win.showInactive();
        });
        jitsiMeetWindow.webContents.send('jitsi-always-on-top', {
            type: 'event',
            data: {
                id: win.id,
                name: 'new-window'
            }
        });
    }
}

/**
 * Returns the coordinates for the always on top window in order to display it
 * in the top right corner.
 *
 * @returns {{x: number, y: number}}
 */
function getPosition () {
    const Screen = electron.screen;
    const {
        x,
        y,
        width
    } = Screen.getDisplayNearestPoint(Screen.getCursorScreenPoint()).workArea;

    return {
        x: x + width - SIZE.width,
        y
    };
}

/**
 * Initializes the always on top functionality in the main electron process.
 *
 * @param {BrowserWindow} jitsiMeetWindow - the BrowserWindow object which
 * displays Jitsi Meet
 */
module.exports = function setupAlwaysOnTopMain(jitsiMeetWindow) {
    jitsiMeetWindow.webContents.on(
        'new-window',
        (...args) => {
            onAlwaysOnTopWindow(jitsiMeetWindow, ...args);
        }
    );
};
