const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Загружаем `index.html` из `dist/`
    mainWindow.loadURL(`file://${path.join(__dirname, 'frontend/dist/index.html')}`);

});
