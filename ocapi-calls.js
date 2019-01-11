'use strict';

const request = require('request-promise');
 
const getToken = async (baseURL, bmUser, bmPass, clientId, clientKey) => {

    let response = await request.post(`${baseURL}/dw/oauth2/access_token`, {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${bmUser}:${bmPass}:${clientKey}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: { 'grant_type': 'urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken' },
        qs: { 'client_id': clientId },
        json: true
    });

    let access_token = response.access_token;  
    if(!access_token) {
        throw new Error('Error parsing response (getToken) >' + JSON.stringify(response));
    }
    else {
    	return access_token;
    }
};

const getActiveCodeVersion = async (baseURL, token) => {

    let response = await request.get(`${baseURL}/s/-/dw/data/v19_1/code_versions`, {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        json: true
    });

    let activeCodeVersion = response.data.filter(x => x.active)[0].id;
    if(!activeCodeVersion) {
        throw new Error('Error parsing response (getActiveCodeVersion) >' + JSON.stringify(response));
    }
    else {
    	return activeCodeVersion;
    }
};

const getSiteCartridges = async (baseURL, siteId, token) => {

    let response = await request.get(`${baseURL}/s/-/dw/data/v19_1/sites/${siteId}`, {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        json: true
    });

    let cartridges = response.cartridges.split(':');
    if(!cartridges) {
        throw new Error('Error parsing response (getSiteCartridges) >' + JSON.stringify(response));
    }
    else {
    	return cartridges;
    }
};

const getSiteLocales = async (baseURL, siteId, token) => {

    let response = await request.get(`${baseURL}/s/-/dw/data/v19_1/sites/${siteId}/locale_info/locales`, {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        json: true
    });

    let locales = response.hits;   
    if(!locales) {
        throw new Error('Error parsing response (getSiteLocales) >' + JSON.stringify(response));
    }
    else {
        
        var result = [];

        locales.forEach(locale => {
            var idInfo = locale.id.split('-');
            var language = idInfo[0];
            var country = idInfo[1];
            result.push({'language':language, 'country':country});
        });
        
    	return result;
    }
};

module.exports = {
    getToken : getToken,
    getActiveCodeVersion : getActiveCodeVersion,
    getSiteCartridges : getSiteCartridges,
    getSiteLocales : getSiteLocales    
};
