'use strict';

const { createClient } = require('webdav');
const fs = require('fs');

const getFormFilesIfPathExists = async (client, path, locales, foundFormXMlFileNames, localeFolderName) => {
    let foundFiles = [];

    for (let j = 0, jj = locales.length; j !== jj; j++) {
        try {
            let contents = await client.getDirectoryContents(path + '/' + locales[j]);

            for (let i = 0, ii = contents.length; i !== ii; i++) {
                if (contents[i].filename.indexOf('xml') !== -1) {
                    let filePath = contents[i].filename;
                    let fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

                    if (!foundFormXMlFileNames.includes(fileName)) {
                        foundFiles.push(filePath);
                        foundFormXMlFileNames.push(fileName);

                        fs.appendFileSync(localeFolderName + '\\fullpaths.txt', fileName + ',' + path + '/' + locales[j] + '/' + fileName + '\r\n');
                    }
                } else {
                    let val = await getFormFilesIfPathExists(client, contents[i].filename, foundFormXMlFileNames, localeFolderName);
                    foundFiles = foundFiles.concat(val);
                }
            }
        } catch (e) {      
            if (!e.response)
            {
                console.log(e);        
            }
            else if (e.response.status !== 404) {
                console.log(path + '\r\n' + e + '\r\n');
            }
        }
    }

    return foundFiles;
}

const getFormXMLsOfSiteCartridges = async (baseURL, bmUser, bmPass, activeCodeVersion, cartridges, locales) => {
    console.log('starting to get form xmls\r\n');

    let client = createClient(baseURL + '/on/demandware.servlet/webdav/Sites/Cartridges/', { username: bmUser, password: bmPass });

    let preparedLocales = locales.map(locale => [locale.language + '_' + locale.country, locale.language, 'default']);
    let paths = cartridges.map(cartridge => '/' + activeCodeVersion + '/' + cartridge + '/cartridge/forms');

    for (let j = 0, jj = preparedLocales.length; j !== jj; j++) {
        let foundFromXMLFilePaths = [];
        let foundFormXMlFileNames = [];

        var localeName = preparedLocales[j][1];
        var localeFolderName = __dirname + '\\files\\' + localeName;
        if (!fs.existsSync(localeFolderName)) {
            fs.mkdirSync(localeFolderName, { recursive: true }, (r) => { if (r != null) { console.log(r); } });
        }

        for (let i = 0, ii = paths.length; i !== ii; i++) {
            foundFromXMLFilePaths = foundFromXMLFilePaths.concat(await getFormFilesIfPathExists(client, paths[i], preparedLocales[j], foundFormXMlFileNames, localeFolderName));
        }

        console.log('\r\n' + foundFromXMLFilePaths.length + ' form found for ' + localeName + ' locale\r\n');   

        for (let i = 0, ii = foundFromXMLFilePaths.length; i !== ii; i++) {
            var formXMLContent = await client.getFileContents(foundFromXMLFilePaths[i], { format: 'text' });
            let fileName = foundFromXMLFilePaths[i].substring(foundFromXMLFilePaths[i].lastIndexOf('/') + 1);

            await fs.writeFile(localeFolderName + '\\' + fileName, formXMLContent, (r) => { if (r != null) { console.log(r); } });
        }
    }
};

module.exports = {
    getFormXMLsOfSiteCartridges: getFormXMLsOfSiteCartridges
};
