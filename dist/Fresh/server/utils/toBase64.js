const {Base64} = require('js-base64')

const toBase64 = ()=>{
    const data = 'dgLkkL6tVD7CWkqxOup:X';
    const base64data = Base64.btoa(data);

    return base64data
}

exports = {
    toBase64
}