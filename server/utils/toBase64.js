const {Base64} = require('js-base64')
const freshAuth = require('../auth/authFresh')

const toBase64 = ()=>{
    const data = 'yPLGYeOxHMbbT81CqUk2:X';
    const base64data = Base64.btoa(data);

    return base64data
}

exports = {
    toBase64
}