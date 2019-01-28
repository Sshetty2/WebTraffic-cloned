const mCK = 'rd4j2luc2buqrg44s86ka6fhse'
// const redirect_Uri =  'https://cabfodbfjmgloaallchcnnkgcfpnobem.chromiumapp.org/'
const redirect_Uri =  'https://mkoendagbaclehcbfngejdkecaplledj.chromiumapp.org/'
// production = 466748401928-m88okvel4gdsc9rjo9qlo8em25ihs65s.apps.googleusercontent.com
// development = 466748401928-clsj0b12h299emdtcngqcdkon8i8n0nk.apps.googleusercontent.com


const mCS = 'tm034sb7uq41r55qeea3etjd28'
const gATEP = 'https://secure.meetup.com/oauth2/access'
const gAK = 'AIzaSyBDxenr7SA1hbdkm_k-1eP7DZTfKaju-UE'


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
    if (url !== undefined && changeInfo.status == "complete"){
    chrome.tabs.sendMessage(tabId, {type: 'onUpdateFrmEvent'}, function (response) {
      console.log(response)
    })
  }
})

// a new event listener is registered to listen for a message called meetupRequest which call the authentication api to redirect the user.    
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.action === 'meetupRequest'){ 
    chrome.identity.launchWebAuthFlow({ 
      url: `https://secure.meetup.com/oauth2/authorize?client_id=${mCK}&response_type=code&redirect_uri=${redirect_Uri}`,
      interactive: true
    },
    function(redirectUrl) {
      let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1)
      makeXhrPostRequest(code, 'authorization_code')
        .then(data => {
          data = JSON.parse(data)
          makeXhrRequestForGroupId(data.access_token)
        }).catch(err => errorLog(err))
    })
  }
  return true;
})


function errorLog(err){
  chrome.runtime.sendMessage({type: 'error', error: err}, (response) => {
    console.log(response)
  }) 
}

// pre-token
// A generic post request for an access token. The request body may need to be reformatted depending on the API being queried


//converts Utc milliseconds since the epoch into a format that can be digested by google

function convertToGoogleDTime(utcMilliseconds){
  var d = new Date(0);
  d.setUTCMilliseconds(utcMilliseconds);
  //takes date object
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
       + pad(d.getUTCMonth()+1)+'-'
       + pad(d.getUTCDate())+'T'
       + pad(d.getUTCHours())+':'
       + pad(d.getUTCMinutes())+':'
       + pad(d.getUTCSeconds())+'Z'}


function makeXhrPostRequest(code, grantType, refreshToken){
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', gATEP, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function(){
      if (xhr.status >= 200 && xhr.status < 300){
          return resolve(xhr.response);
      } else {
        reject(Error({
          status: xhr.status,
          statusTextInElse: xhr.statusText
        }))
      }
    }
    xhr.onerror = function(){
      reject(Error({
        status: xhr.status,
        statusText: xhr.statusText
      }))
    }
     let requestBody = (refreshToken) ?
      `client_id=${mCK}&client_secret=${mCS}&grant_type=${grantType}&refresh_token=${refreshToken}` 
      :
      `client_id=${mCK}&client_secret=${mCS}&grant_type=${grantType}&redirect_uri=${redirect_Uri}&code=${code}`
    xhr.send(requestBody)
  })
}


//post-token
// A generic XHR request code, requires an HTTP XML request method, a request url, and an access token.

function makeXhrRequest(method, url, token) {
  return new Promise((resolve, reject) => { 
    let xhr = new XMLHttpRequest(); 
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    xhr.onload = function(){ 
      if (xhr.status >= 200 && xhr.status < 300){
        return resolve(xhr.response);
      } else {
        reject(Error({
          status: xhr.status,
          statusTextInElse: xhr.statusText
        }))
      }
    }
    xhr.onerror = function(){
      reject(Error({
        status: xhr.status,
        statusText: xhr.statusText
      }))
    }
    xhr.send()
  })
}


function gCalXhrRequest(method, url, token, params) {
  return new Promise((resolve, reject) => { 
    let xhr = new XMLHttpRequest(); 
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    xhr.onload = function(){ 
      if (xhr.status >= 200 && xhr.status < 300){
        return resolve(xhr.response);
      } else {
        reject(Error({
          status: xhr.status,
          statusTextInElse: xhr.statusText
        }))
      }
    }
    xhr.onerror = function(){
      reject(Error({
        status: xhr.status,
        statusText: xhr.statusText
      }))
    }
    let stringifiedParams = JSON.stringify(params)
    xhr.send(stringifiedParams)
  })
}

checkDefinition = value => typeof value == 'undefined' ? "" : value

// called after token is received

function makeXhrRequestForGroupId(token) {
  
  chrome.storage.local.get(['dateRangeStart', 'dateRangeEnd', 'grpNameInput', 'urlPathName'], (result) => {
    let dateRangeStart = result.dateRangeStart
    let dateRangeEnd = result.dateRangeEnd
    let grpNameInput = result.grpNameInput
    let urlPathName = result.urlPathName
    let requestUrl
    if (urlPathName) {
      requestUrl = `https://api.meetup.com/2/groups?&sign=true&photo-host=public&group_urlname=${urlPathName}&page=20`
      console.log(requestUrl)
      console.log(urlPathName)
      return makeXhrRequest('GET', requestUrl, token)
      .then((data) => {
        console.log(data)
        let parsedData= JSON.parse(data)
        let groupId = parsedData["results"][0]["id"]
        let timezone = parsedData["results"][0]["timezone"]
        chrome.storage.local.set({timezone: timezone},()=>console.log(`timezone has been set in bg local storage in the background script`));
        return groupId
      })
      .then(groupId => {
        requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${groupId}&time=${dateRangeStart},${dateRangeEnd}&page=20`
        return makeXhrRequest('GET', requestUrl, token)
        
        .then((data) => {
          let parsedData= JSON.parse(data)
          let resultData = parsedData["results"]
          chrome.runtime.sendMessage({type: 'meetupEventData', meetupEventData: resultData}, (response) => {
            console.log(response)
          }) 
      }).catch(err => errorLog(err)) 
    }).catch(err => errorLog(err)) 
    
    } else {
      requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=${grpNameInput}&page=20` 
      return makeXhrRequest('GET', requestUrl, token) 
      .then((data) => {
        let parsedData = JSON.parse(data)
        chrome.storage.local.set({timezone: parsedData["0"].timezone},()=>console.log(`timezone has been set in bg local storage to ${parsedData["0"].timezone}`));
        let groupId = parsedData["0"].id;
        return groupId
      }).then((groupId) => {
          requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${groupId}&time=${dateRangeStart},${dateRangeEnd}&page=20`
          return makeXhrRequest('GET', requestUrl, token)
          .then((data) => {
            let parsedData= JSON.parse(data)
            let resultData = parsedData["results"]
            chrome.runtime.sendMessage({type: 'meetupEventData', meetupEventData: resultData}, (response) => {
              console.log(response)
            }) 
          }).catch(err => errorLog(err)) 
        }).catch(err => errorLog(err)) // end promise for  
      }
    }) // end chrome local storage callback
   } // end makeXhrRequestForGroupId(token) function 
        

  chrome.runtime.onMessage.addListener((request, sendResponse) => {
    if (request.type === 'googleAuthFlow') {
      chrome.storage.local.get(['timezone'], (result) => {
        let timezone = result.timezone
        let results = request.parsedDataObj
        let paramsArr = results.map(x=> (
          {  
            "end":{  
                "dateTime":`${convertToGoogleDTime(x["time"] + x["duration"])}`,
                "timeZone":`${timezone}`
            },
            "start":{ 
                "dateTime":`${convertToGoogleDTime(x["time"])}`,
                "timeZone":`${timezone}`
            },
            "description":`This event is hosted by ${x["venue"]["name"]}; More details regarding this event can be found at: ${checkDefinition(x["event_url"])}`,
            "summary":`${x["name"]}`,
            "location":`${checkDefinition(x["venue"]["address_1"])} ${checkDefinition(x["venue"]["address_2"])} - ${checkDefinition(x["venue"]["city"])} ${checkDefinition(x["venue"]["state"])}`,
            "reminders":{  
                "useDefault":true
            }
          }) 
        )
        console.log(paramsArr) 
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          return Promise.all(paramsArr.map(x => {
              return gCalXhrRequest('POST', `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${gAK}`, token, x)
          }))
            .then(()=>{
              chrome.runtime.sendMessage({type: 'success'}, (response) => {
                if (response) {
                  console.log(response)
                }
              });
            }
          ).catch(err => errorLog(err)) // end promise all
        }) // end identity auth token
      })
    }; // end if statement nested inside of on message listener
  }) // end on message listener
    // end promise from make XHR request for group ID
    
     


