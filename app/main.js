const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const winston = require('winston');


let feedUrl = 'http://localhost:80/update/win64/' + app.getVersion() +'/RELEASES';
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.loadFile('app/index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
    autoUpdater.setFeedURL(feedUrl);
    winston.log('info', 'initiating version check');
    autoUpdater.checkForUpdates();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
})

autoUpdater.on('update-available', () => {
    winston.log('info', 'update-available');
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    winston.log('info', 'update-downloaded');

    mainWindow.webContents.send('update_downloaded');
});

autoUpdater.on('error', (data) => {
    winston.log('error', 'error-on-update');
    winston.log('info', data);
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});
