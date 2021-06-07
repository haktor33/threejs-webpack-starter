import md5 from 'crypto-js/md5';
import { Panorama } from '../components/panorama';

const { config, location } = window['runConfig'];

function getPanoramabyCoordinates(coordinates) {
    if (!coordinates) { throw ("Coordinates must be defined"); }

    const opts = {
        requestbody: {
            operation: "get-panoramas",
            parameters: {
                request: {
                    "subject-location": { lon: coordinates[0], lat: coordinates[1], alt: 0.0 },
                    "search-radius": 750,
                    "max-results": 1
                }
            }
        }
    };

    return apiCall(opts);
}

function getPanoramabyID(ID) {

    const opts = {
        requestbody:
        {
            operation: "get-panoramas",
            parameters: { request: { "panorama-ids": [ID] } }
        }
    };

    return apiCall(opts);
}


function apiCall(opts) {

    if (!opts) { throw ("Options must be defined"); }
    if (!config) { throw ("Configuration must be defined"); }

    let timestamp = Math.floor((new Date()).getTime() / 1000);
    let hash = md5(config.apiKey + config.secretKey + timestamp).toString();
    let earthmineurl = `${config.serviceUrl}?sig=${hash}&timestamp=${timestamp}`;
    let requestbody = opts.requestbody;


    return new Promise(function (resolve, reject) {
        fetch(earthmineurl, {
            method: 'post',
            headers: { 'Content-Type': 'application/json', "x-earthmine-auth-id": config.apiKey },
            body: JSON.stringify(requestbody)
        }).then(response => response.json())
            .then(response => {
                if (response.result.panoramas) {
                    resolve(new Panorama(response.result.panoramas[0], config.baseDataUrl));
                }
                else {
                    reject();
                }
            });
    });

}

export { getPanoramabyCoordinates, getPanoramabyID }
