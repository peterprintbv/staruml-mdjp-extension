const fs = require('fs');
const path = require('path');

class MDJPFile
{
    static typesToSplit = [
        'Project',
        'UMLModel',
        'UMLSubsystem',
        'UMLPackage',
        'UMLClassDiagram',
        'UMLPackageDiagram',
        'UMLActivityDiagram'
    ];

    /**
     * Load the owned elements from the separate files.
     *
     * @param {string} filePath
     * @param {Object} object
     *
     * @returns {Object}
     */
    static loadOwnedElements(filePath, object) {
        if (!object.hasOwnProperty('ownedElements')) {
            object.ownedElements = [];
        }

        const nodePath = path.join(path.dirname(filePath), path.parse(filePath).name);
        if (fs.existsSync(nodePath) && fs.lstatSync(nodePath).isDirectory()) {
            fs.readdirSync(nodePath).forEach(file => {
                if (path.extname(file) === '.mdjps') {
                    const fullPath = path.join(nodePath, file);
                    const ownedElement = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    this.loadOwnedElements(fullPath, ownedElement);
                    object.ownedElements.push(ownedElement);
                }
            });
        }
        return object;
    }

    /**
     * Store the owned elements separately.
     *
     * @param {string} path
     * @param {Object} object
     *
     * @returns {Object}
     */
    static storeOwnedElements(filePath, object) {
        filePath = path.join(path.dirname(filePath), path.parse(filePath).name);
        if (object.hasOwnProperty('ownedElements')) {
            const ownedElementsToSave = object.ownedElements.filter(ownedElement => this.typesToSplit.indexOf(ownedElement._type) >= 0);
            if (ownedElementsToSave.length > 0) {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                }
                object.ownedElements = object.ownedElements.filter(ownedElement => this.typesToSplit.indexOf(ownedElement._type) < 0);
                for (let ownedElement of ownedElementsToSave) {
                    const ownedElementPath = filePath + '/' + (ownedElement._type + '.' + ownedElement.name).replace(/[^a-z0-9.]/gi, '_').toLowerCase() + '.mdjps';
                    ownedElement = this.storeOwnedElements(ownedElementPath, ownedElement);
                    fs.writeFileSync(ownedElementPath, JSON.stringify(ownedElement, null, 4), 'utf8');
                }
            }
        }
        return object;
    }
}

module.exports = MDJPFile;