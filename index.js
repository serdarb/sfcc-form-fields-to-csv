'use strict';

const ocapi = require('./ocapi-calls');
const webdav = require('./webdav-calls');
const formFileUtil = require('./form-file-util');

const dotenv = require('dotenv');
dotenv.load();
const config = dotenv.config().parsed;

ocapi.getToken(config.BASE_URL,
               config.BM_USER, config.BM_PASS,
               config.CLIENT_ID, config.CLIENT_KEY).then((token) => {

    // console.log(token);
    ocapi.getActiveCodeVersion(config.BASE_URL, token).then((activeCodeVersion) => {

        // console.log(activeCodeVersion);
        ocapi.getSiteCartridges(config.BASE_URL, config.SITE_ID, token).then((cartridges) => {
            
            // console.log(cartridges);
            ocapi.getSiteLocales(config.BASE_URL, config.SITE_ID, token).then((locales) => {

                // console.log(locales);
                console.log('\r\nretrived site information from ocapi\r\n');
                
                webdav.getFormXMLsOfSiteCartridges(config.BASE_URL,
                                                   config.BM_USER, config.BM_PASS,
                                                   activeCodeVersion, cartridges, locales).then(() => {

                    console.log('downloaded form files from webdav\r\n');

                    formFileUtil.processFiles();      

                    console.log('\r\ncompleted!\r\n');

                });
            }).catch((err) => {
                // console.log(err.message);
            });
        }).catch((err) => {
            // console.log(err.message);
        });
    }).catch((err) => {
        // console.log(err.message);
    });
}).catch((err) => {
    // console.log(err.message);
});
