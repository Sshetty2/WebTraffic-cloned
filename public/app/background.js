const meetup_client_key = 'rd4j2luc2buqrg44s86ka6fhse'
const redirect_Uri =  'https://mkoendagbaclehcbfngejdkecaplledj.chromiumapp.org/'
const meetupClientSecret = 'tm034sb7uq41r55qeea3etjd28'
const meetupAccessTokenEndPoint = 'https://secure.meetup.com/oauth2/access'
const googleAPIKey = 'AIzaSyBDxenr7SA1hbdkm_k-1eP7DZTfKaju-UE'

const testGoogleReferenceObj = 
{  
  "end":{  
     "dateTime":"2019-01-23T18:00:00Z",
     "timeZone":"US/Eastern"
  },
  "start":{ 
     "dateTime":"2019-01-23T16:00:00Z",
     "timeZone":"US/Eastern"
  },
  "description":"TEST DESCRIPTION",
  "summary":"TEST SUMMARY ",
  "location":"33 Irving Pl - 33 Irving Place - New York, NY, us",
  "reminders":{  
     "useDefault":true
  }
}


// a message is send every time a tab is updated to the content script to be handled called onUpdateFrmEvent
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {type: 'onUpdateFrmEvent'}, function (response) {
      console.log(`The response object that was received when we sent the message that ran onUpdated is ${response[0]}`)
      chrome.storage.local.get(['grpNameArray'], function(result) {
        console.log('Value currently is ' + result.grpNameArray[0]);
        });
      })
    };
  })

// a new event listener is registered to listen for a message called meetupRequest which call the authentication api to redirect the user.    
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.action === 'meetupRequest'){ 
    chrome.identity.launchWebAuthFlow({ 
      url: `https://secure.meetup.com/oauth2/authorize?client_id=${meetup_client_key}&response_type=code&redirect_uri=${redirect_Uri}`,
      interactive: true
    },
    function(redirectUrl) {
      console.log(`this is the redirectUrl ${redirectUrl}`)
      let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1)
      console.log(`the access code prior to making the post request is ${code}`)
      makeXhrPostRequest(code, 'authorization_code')
        .then(data => {
          data = JSON.parse(data)
          console.log(`the access token that I can use to make API calls from Meetup is ${data.access_token}`)
          makeXhrRequestForGroupId(data.access_token)
        })
        .catch(err => console.log(err))
    })
  }
  return true;
})


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
    xhr.open('POST', meetupAccessTokenEndPoint, true);
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
      `client_id=${meetup_client_key}&client_secret=${meetupClientSecret}&grant_type=${grantType}&refresh_token=${refreshToken}` 
      :
      `client_id=${meetup_client_key}&client_secret=${meetupClientSecret}&grant_type=${grantType}&redirect_uri=${redirect_Uri}&code=${code}`
      console.log(`the request body for the post request is ${requestBody}`)
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
  
  chrome.storage.local.get(['dateRangeStart', 'dateRangeEnd', 'grpNameInput'], (result) => {
    let dateRangeStart = result.dateRangeStart
    let dateRangeEnd = result.dateRangeEnd
    let grpNameInput = result.grpNameInput
    
    let requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=${grpNameInput}&page=20` 
      return makeXhrRequest('GET', requestUrl, token) 
      .then((data) => {
        let parsedData = JSON.parse(data)
        let resultsArr = []
        resultsArr.push(parsedData["0"].id, parsedData["0"].timezone);
        console.log(`the group ID is ${resultsArr[0]}`)
        return resultsArr
      }).then((resultsArr) => {
        requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${resultsArr[0]}&time=${dateRangeStart},${dateRangeEnd}&page=20`
        console.log(`the request Url being used to query for all events is ${requestUrl}`)
        return makeXhrRequest('GET', requestUrl, token)
        .then((data) => {
          let parsedData= JSON.parse(data)
          let resultData = parsedData["results"]
          console.log(resultData)
          return resultData
        }).then((results) => {
          let timezone = resultsArr[1]
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
              return gCalXhrRequest('POST', `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${googleAPIKey}`, token, x)
            })) // end promise all
          }) // end identity auth token
        }).catch(err => console.log(err)) // end promise chain from make XHR request for events
      }).catch(err => console.log(err)) // end promise from make XHR request for group ID
    }) // end local store get call back
  } // end makeXhrRequestForGroupId(token) function 




