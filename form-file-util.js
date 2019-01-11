'use strict';

const fs = require('fs');
const xmlParser = require('xml2js').parseString;

const filesFolder = __dirname + '\\files';

function processFiles() {

    fs.readdir(filesFolder, function (err, localeFolders) {
        if (localeFolders == null) { return; }

        for (var i = 0; i < localeFolders.length; i++) {
            let localeFolder = localeFolders[i];

            let localeFolderPath = filesFolder + '\\' + localeFolder;
            fs.readdir(localeFolderPath, function (err, fileNames) {
                if (fileNames == null) { return; }

                let fullPathFileArray = fs.readFileSync(localeFolderPath + '\\fullpaths.txt').toString().split("\r\n");
                let fullPaths = fullPathFileArray.map(p => { var items = p.split(','); 
                                                             return { 'key': items[0], 'value': items[1] }; });

                for (let j = 0; j < fileNames.length; j++) {
                    let fileName = fileNames[j];
                    if(!fileName.endsWith('xml')) {
                        continue;
                    }

                    let fileNamePretty = fileName.replace('.xml', '');                 
                    let fullPath = fullPaths.filter(x => x.key === fileName)[0].value;                                

                    fs.readFile(localeFolderPath + '\\' + fileName, 'utf8', function (err, xmlContent) {
                        xmlParser(xmlContent, function (err, xmlObject) {                      

                            let fields = xmlObject.form.field;
                            if (fields) {
                                fields.forEach(fld => { getFieldInfo(fullPath, localeFolder, fileNamePretty, fld); });
                            }

                            let groups = xmlObject.form.group;
                            if (groups) {
                                groups.forEach(group => { getGroupFields(fullPath, localeFolder, fileNamePretty, group); });
                            }

                            let lists = xmlObject.form.list;
                            if (lists) {
                                lists.forEach(list => { getListFields(fullPath, localeFolder, fileNamePretty, list); });
                            }
                        });
                    });
                }
            });
        }
      });
}

const getGroupFields = async (path, locale, fileName, group, prefix) => {
    let groupFields = group.field;
    if (!groupFields) { return; }
  
    prefix = prefix != null || prefix !== undefined ? prefix + '.' + group.$['formid'] : group.$['formid'];
  
    groupFields.forEach(groupField => { getFieldInfo(path, locale, fileName, groupField, prefix); });
  
    let groupGroups = group.group;
    if (groupGroups) {
      groupGroups.forEach(grp => { getGroupFields(path, locale, fileName, grp, prefix); });
    }
}
  
const getListFields = async (path, locale, fileName, list, prefix) => {
    let listFields = list.field;
    if (!listFields) { return; }
  
    prefix = prefix != null || prefix !== undefined ? prefix + '.' + list.$['formid'] : list.$['formid'];
  
    listFields.forEach(listField => { getFieldInfo(path, locale, fileName, listField, prefix); });
  
    let listLists = list.list;
    if (listLists) {
      listLists.forEach(lst => { getListFields(path, locale, fileName, lst, prefix); });
    }
  
    let listGroups = list.group;
    if (listGroups) {
      listGroups.forEach(grp => { getGroupFields(path, locale, fileName, grp, prefix); });
    }
}
  
const getFieldInfo = async (path, locale, fileName, field, prefix) => {
    let info = {
      'path': path,
      'locale': locale,
      'fileName': fileName,  
      'name': prefix != null ? prefix + '.' + field.$['formid'] : field.$['formid'],
      'mandatory': field.$['mandatory'] || '',
      'regexp': field.$['regexp'] || '',
      'max-length': field.$['max-length'] || '',
      'min-length': field.$['min-length'] || ''
    };
    //let infoObjectString = JSON.stringify(info);  

    fs.appendFileSync(filesFolder + '\\export-' + locale + '.csv', 
                      info.fileName + ',' + 
                      info.name + ',' + 
                      info.mandatory + ',' + 
                      info.regexp + ',' + 
                      info['max-length'] + ',' + 
                      info['min-length'] + ','+
                      info.path +
                      '\r\n');
    return info;
}

module.exports = {
    processFiles : processFiles,
    getFieldInfo : getFieldInfo,
    getListFields : getListFields,
    getGroupFields : getGroupFields 
};
