
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
          console.log(`the access token that I can use to make API calls is ${data.access_token}`)
          makeXhrRequestForGroupId(data.access_token)
        })
        .catch(err => console.log(err))
    })
  }
  return true;
})












const meetup_client_key = 'rd4j2luc2buqrg44s86ka6fhse'
const redirect_Uri =  'https://mkoendagbaclehcbfngejdkecaplledj.chromiumapp.org/'
const clientSecret = 'tm034sb7uq41r55qeea3etjd28'
const meetupAccessTokenEndPoint = 'https://secure.meetup.com/oauth2/access'



const googleReferenceObj = 
{  
  "end":{  
    //  add duration to start datetime and convert it
     "dateTime":"2019-01-23T16:00:00Z",
     // take timezone straight from meetup API call
     "timeZone":"US/Eastern"
  },
  "start":{  
    //  use start datetime and convert it
     "dateTime":"2019-01-23T14:00:00Z",
     // take timezone straight from meetup API call
     "timeZone":"US/Eastern"
  },
  // create string and use meetup event url 
  "description":"TEST DESCRIPTION",
  // use event name from meetup API call
  "summary":"TEST SUMMARY ",
  // use location from meetup API call
  "location":"33 Irving Pl - 33 Irving Place - New York, NY, us",
  "reminders":{  
     "useDefault":true
  }
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
      `client_id=${meetup_client_key}&client_secret=${clientSecret}&grant_type=${grantType}&refresh_token=${refreshToken}` 
      :
      `client_id=${meetup_client_key}&client_secret=${clientSecret}&grant_type=${grantType}&redirect_uri=${redirect_Uri}&code=${code}`
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

//hardcoded group id for now

var hardcodedAccessCode = 'b3f438942c1d175b0298612c7bcd8c6b'

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
        let groupId = parsedData["0"].id
        let timezone = parsedData["0"].timezone
        console.log(`the group ID is ${groupId}`)
        return groupId
      }).then((groupId) => {
        requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${groupId}&time=${dateRangeStart},${dateRangeEnd}&page=20`
        makeXhrRequest('GET', requestUrl, token)
        .then((data) => {
          let parsedData= JSON.parse(data)
          let results = parsedData["results"]
          return results
          //TODO: Connect to google Calendar API and add new calendar items. The results are exactly in the form that i want them. 




        }).then(results => {
          chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            console.log(`the access token sent by google is ${token}`)
            // Use the token.
          })
        }) // end promise from make XHR request for events
      




      }).catch(err => console.log(err)) // end promise from make XHR request for group ID
    }) // end local storage callback
  }




