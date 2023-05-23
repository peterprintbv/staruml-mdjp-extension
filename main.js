const MDJPFile = require('./mdjp-file');
const pathHelper = require("path");
const fs = require("fs");
exports.init = () => {
    // Override the fs.writeFileSync to catch and handle all reads to .mdjp files.
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = (...args) => {
        let data = originalReadFileSync(...args);
        if (pathHelper.extname(args[0]) === '.mdjp') {
            data = JSON.stringify(MDJPFile.loadOwnedElements(args[0], JSON.parse(data)), null, 4);
        }
        return data;
    };

    // Override the fs.writeFileSync to catch and handle all writes to .mdjp files.
    const originalWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = (...args) => {
        if (pathHelper.extname(args[0]) === '.mdjp') {
            const resultObject = MDJPFile.storeOwnedElements(args[0], JSON.parse(args[1]));
            args[1] = JSON.stringify(resultObject, null, 4);
        }
        return originalWriteFileSync(...args);
    };

    // Override the showSaveDialog to add .mdjp as allowed file type.
    const originalShowSaveDialog = app.dialogs.showSaveDialog;
    app.dialogs.showSaveDialog = (title, defaultPath, filters) => {
        if (Array.isArray(filters) && filters.find((item) => item.name === 'Models' && item.extensions.indexOf('mdj') >= 0)) {
            filters.push({
                name: 'Models (Git safe)',
                extensions: ['mdjp']
            });
        }
        return originalShowSaveDialog(title, defaultPath, filters)
    }

    // Override the showOpenDialog to add .mdjp as allowed file type.
    const originalShowOpenDialog = app.dialogs.showOpenDialog;
    app.dialogs.showOpenDialog = (title, defaultPath, filters, options) => {
        if (Array.isArray(filters)) {
            const modelsFilter = filters.find((item) => item.name === 'Models' && item.extensions.indexOf('mdj') >= 0 && item.extensions.indexOf('mdjp') < 0);
            if (modelsFilter !== undefined) {
                modelsFilter.extensions.push('mdjp');
            }
        }
        return originalShowOpenDialog(title, defaultPath, filters, options);
    }
};