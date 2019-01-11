'use strict';

const dotenv = require('dotenv');

const ocapi = require('./ocapi-calls');
const webdav = require('./webdav-calls');
const formFileUtil = require('./form-file-util');

dotenv.load();

(async ({ BASE_URL, BM_USER, BM_PASS, CLIENT_ID, CLIENT_KEY, SITE_ID }) => {
    try {
        const token = await ocapi.getToken(BASE_URL, BM_USER, BM_PASS, CLIENT_ID, CLIENT_KEY);
        const activeCodeVersion = await ocapi.getActiveCodeVersion(BASE_URL, token);
        const cartridges = await ocapi.getSiteCartridges(BASE_URL, SITE_ID, token);
        const locales = await ocapi.getSiteLocales(BASE_URL, SITE_ID, token);
        
        console.log('\r\nretrived site information from ocapi\r\n');
        await webdav.getFormXMLsOfSiteCartridges(BASE_URL, BM_USER, BM_PASS, activeCodeVersion, cartridges, locales);
        
        console.log('downloaded form files from webdav\r\n');
        await formFileUtil.processFiles();      

        console.log('\r\ncompleted!\r\n');
    }
    catch(err) {
        console.error(err);
        process.exit(1);
    }
})(dotenv.config().parsed);
