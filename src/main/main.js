const { app, BrowserWindow, ipcMain, Menu, dialog, Tray } = require('electron')
const { isDevEnv } = require('./env')
const path = require('path')
const { detectEncoding, readTxtFile } = require('./txtparse')

const Store = require("electron-store");
const store = new Store();
let resourcesRoot = path.resolve(app.getAppPath());
let publicRoot = path.join(__dirname, '../../public')

if (!isDevEnv) {
    resourcesRoot = path.dirname(resourcesRoot);
    publicRoot = path.join(__dirname, '../../dist')
}

let mainWin = null, tray = null
let options = {
    width: 1050,
    height: 660,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
    },
};

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) {
    app.quit();
} else {
    app.on("second-instance", (event, argv, workingDir) => {
        if (mainWin) {
            if (!mainWin.isVisible()) mainWin.show();
            mainWin.focus();
        }
    });
}
/* 自定义函数 */
const startup = () => {
    init()
}

const init = () => {
    app.whenReady().then(() => {
        mainWin = createWindow();
        initWindowBounds(mainWin);
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


//创建浏览窗口
const createWindow = () => {
    if (!mainWin) {
        // 从 electron-store 中获取窗口大小和位置
        const windowWidth = parseInt(store.get("mainWindowWidth") || 1050);
        const windowHeight = parseInt(store.get("mainWindowHeight") || 660);
        const windowX = parseInt(store.get("mainWindowX"));
        const windowY = parseInt(store.get("mainWindowY"));
        const mainWindow = new BrowserWindow({
            ...options,
            width: windowWidth,
            height: windowHeight,
            x: windowX,
            y: windowY
        });
        if (isDevEnv) {
            mainWindow.loadURL("http://localhost:2000/")
            // Open the DevTools.
            mainWindow.webContents.openDevTools()
        } else {
            // Load the index.html of the app.
            mainWindow.loadFile('dist/index.html')
        }

        tray = new Tray(path.join(publicRoot, '/images/logo.png'));
        tray.setToolTip('Txt2Epub');
        let contextMenu = generateContextMenu();
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => {
            mainWindow.show();
        });
        mainWindow.once('ready-to-show', () => {
            mainWindow.show()
        })

        mainWindow.once('ready-to-show', () => {
            mainWindow.show()
        })
        // 监听窗口大小改变事件
        mainWindow.on("resize", () => {
            if (!mainWindow.isDestroyed()) {
                if (!mainWindow.isMaximized()) {
                    let bounds = mainWindow.getBounds();
                    store.set({
                        mainWindowWidth: bounds.width,
                        mainWindowHeight: bounds.height,
                    });
                } else {
                    console.log('当前为大化状态，不保存窗口大小和位置');
                }
            }
        });
        // 监听窗口移动事件
        mainWindow.on("move", () => {
            if (!mainWindow.isDestroyed()) {
                if (!mainWindow.isMaximized()) {
                    let bounds = mainWindow.getBounds();
                    store.set({
                        mainWindowX: bounds.x,
                        mainWindowY: bounds.y,
                    });
                }
            }
        });
        return mainWindow
    }
    return mainWin;
}

// 动态生成上下文菜单
const generateContextMenu = () => {
    return Menu.buildFromTemplate([
        {
            label: '打开主界面',
            icon: path.join(publicRoot, '/images/app.png'),
            click: () => {
                mainWin.show();
            },
        },
        { type: 'separator' }, // 添加分隔线

        {
            label: '退出',
            icon: path.join(publicRoot, '/images/quit.png'),
            click: function () {
                app.quit();
            },
        },
    ]);
};

const initWindowBounds = (win) => {
    store.get('mainWindowWidth') || store.set('mainWindowWidth', win.getSize()[0]);
    store.get('mainWindowHeight') || store.set('mainWindowHeight', win.getSize()[1]);
    store.get('mainWindowX') || store.set('mainWindowX', win.getPosition()[0]);
    store.get('mainWindowY') || store.set('mainWindowY', win.getPosition()[1]);
}

ipcMain.on('window-min', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});

ipcMain.on('window-max', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    if (win.isMaximized()) {
        const width = store.get("mainWindowWidth") || 1050;
        const height = store.get("mainWindowHeight") || 660;
        const x = store.get("mainWindowX") || mainWin.getPosition()[0];
        const y = store.get("mainWindowY") || mainWin.getPosition()[1];
        if (width && height) {
            win.setSize(width, height);
            if (x && y) {
                win.setPosition(x, y);
            }
        }
    } else {
        win.maximize();
    }
});

ipcMain.on('window-close', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});

ipcMain.handle('open-file-dialog', async (event, fileType) => {
    console.log(fileType);
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWin, {
        properties: ['openFile'],
        filters: [
            { name: 'E-Books', extensions: [fileType] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (!canceled) {
        const filePath = filePaths[0];
        try {
            // 检测文件编码
            const encoding = await detectEncoding(filePath);
            console.log(`检测到文件编码为: ${encoding}`);
            // 读取 TXT 文件内容
            const fileContent = await readTxtFile(filePath, encoding);
            // 将文件内容发送给渲染端
            sendToRenderer('file-content', { filePath, fileContent });
        } catch (error) {
            console.error('读取文件时出错:', error);
        }
        return filePath;
    }
    return null;
});

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin) mainWin.webContents.send(channel, args)
    } catch (error) {
    }
}


//启动应用
startup()

