const { app, BrowserWindow, ipcMain,
    Menu, dialog, powerMonitor,
    shell, powerSaveBlocker, Tray,
    globalShortcut, session } = require('electron')
const { isMacOS, isWinOS, useCustomTrafficLight, isDevEnv,
    USER_AGENT, USER_AGENT_APPLE, AUDIO_EXTS, IMAGE_EXTS, APP_ICON } = require('./env')
const path = require('path')
let mainWin = null
const appWidth = 1080, appHeight = 720
/* 自定义函数 */
const startup = () => {
    init()
    registryGlobalListeners()
}

const init = () => {
    app.whenReady().then(() => {
        mainWin = createWindow()
    })

    app.on('activate', (event) => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWin = createWindow()
        }
    })

    app.on('window-all-closed', (event) => {
        if (!isDevEnv) {
            app.quit()
        }
    })

    app.on('before-quit', (event) => {
        sendToRenderer('app-quit')
    })
}

//全局事件监听
const registryGlobalListeners = () => {
    //主进程事件监听
    ipcMain.on('app-quit', () => {
        app.quit()
    }).on('app-min', () => {
        if (mainWin.isFullScreen()) mainWin.setFullScreen(false)
        if (mainWin.isMaximized() || mainWin.isNormal()) mainWin.minimize()
    }).on('app-max', () => {
        let isFullScreen = false
        if (isWinOS) {
            isFullScreen = toggleWinOSFullScreen()
        } else {
            isFullScreen = !mainWin.isFullScreen()
            mainWin.setFullScreen(isFullScreen)
        }
        sendToRenderer('app-max', isFullScreen)
    }).on('app-zoom', (e, value) => {
        setAppWindowZoom(value)
    }).on('app-zoom-noResize', (e, value) => {
        setAppWindowZoom(value, true)
    })
}

//创建浏览窗口
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: appWidth,
        height: appHeight,
        minWidth: appWidth,
        minHeight: appHeight,
        // titleBarStyle: 'hidden',
        trafficLightPosition: { x: 15, y: 15 },
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            webSecurity: false  //TODO 有风险，暂时保留此方案，留待后期调整
        }
    })

    if (isDevEnv) {
        mainWindow.loadURL("http://localhost:2000/")
        // Open the DevTools.
        mainWindow.webContents.openDevTools()
    } else {
        // Load the index.html of the app.
        mainWindow.loadFile('dist/index.html')
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })


    return mainWindow
}

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin) mainWin.webContents.send(channel, args)
    } catch (error) {

    }
}

const toggleWinOSFullScreen = () => {
    if (!isWinOS) return null
    const isMax = mainWin.isMaximized()
    if (isMax) {
        mainWin.unmaximize()
    } else {
        mainWin.maximize()
    }
    return !isMax
}

const setAppWindowZoom = (value, noResize) => {
    const zoom = Number(value || 100)
    const zoomFactor = parseFloat(zoom / 100)
    const width = parseInt(appWidth * zoomFactor)
    const height = parseInt(appHeight * zoomFactor)
    mainWin.webContents.setZoomFactor(zoomFactor)
    if (noResize) return
    mainWin.setMinimumSize(width, height)
    if (mainWin.isNormal()) {
        mainWin.setSize(width, height)
        mainWin.center()
    }
}

//启动应用
startup()

