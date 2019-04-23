//converts Utc milliseconds since the epoch into a format that can be digested by google

function convertToGoogleDTime(utcMilliseconds) {
    var d = new Date(0);
    d.setUTCMilliseconds(utcMilliseconds);
    //takes date object
    function pad(n) {
        return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds()) + 'Z'
}

function formatDateToIsoString(utcMilliseconds){
    var d = new Date(0);
    let newDateStr, newDateStrIndexOfZ
    d.setUTCMilliseconds(utcMilliseconds);
    newDateStr =  d.toISOString()
    newDateStrIndexOfZ = newDateStr.indexOf('Z')
    newDateStr = newDateStr.slice(0, newDateStrIndexOfZ)
    return newDateStr
}
