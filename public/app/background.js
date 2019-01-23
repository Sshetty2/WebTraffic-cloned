
const meetup_client_key = 'rd4j2luc2buqrg44s86ka6fhse'
const redirect_Uri =  'https://mkoendagbaclehcbfngejdkecaplledj.chromiumapp.org/'
const clientSecret = 'tm034sb7uq41r55qeea3etjd28'


// pre-token

function makeXhrPostRequest(code, grantType, refreshToken){
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://secure.meetup.com/oauth2/access', true);
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
  
  //query local storage for input of text and date 
  //TODO: FORMAT REQUEST URL WITH GROUP NAME INPUT

   let requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=BUILD WITH CODE - LOS ANGELES&page=20` 
    return makeXhrRequest('GET', requestUrl, token) 
    .then((data) => {
      let parsedData = JSON.parse(data)
      let groupId = parsedData["0"].id
      console.log(`the group ID is ${groupId}`)
      return groupId
      
    }).then((groupId) => {
      //TODO : FORMAT REQUEST URL WITH DATE RANGE INPUT AND GROUP ID INPUT
      requestUrl = 'https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=21993357&time=1548219600000,1548306000000&page=20'
      makeXhrRequest('GET', requestUrl, token)
      



    }).catch(err => console.log(err))
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
            console.log(`the access token that I can use to make API calls is ${data.access_token}`)
            makeXhrRequestForGroupId(data.access_token)
          })
          .catch(err => console.log(err))
      })
    }
    return true;
  })







// (function() {
//     const tabStorage = {};
//     const networkFilters = {
//         urls: [
//             "*://developer.mozilla.org/*"
//         ]
//     };

//     chrome.webRequest.onBeforeRequest.addListener((details) => {
//         const { tabId, requestId, url, timeStamp } = details;
//         if (!tabStorage.hasOwnProperty(tabId)) {
//             return;
//         }

//         tabStorage[tabId].requests[requestId] = {
//             requestId: requestId,
//             url: url,
//             startTime: timeStamp,
//             status: 'pending'
//         };
//         console.log(tabStorage[tabId].requests[requestId]);
//     }, networkFilters);

//     chrome.webRequest.onCompleted.addListener((details) => {
//         const { tabId, requestId, timeStamp } = details;
//         if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
//             return;
//         }

//         const request = tabStorage[tabId].requests[requestId];

//         Object.assign(request, {
//             endTime: timeStamp,
//             requestDuration: timeStamp - request.startTime,
//             status: 'complete'
//         });
//         console.log(tabStorage[tabId].requests[details.requestId]);
//     }, networkFilters);

//     chrome.webRequest.onErrorOccurred.addListener((details)=> {
//         const { tabId, requestId, timeStamp } = details;
//         if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
//             return;
//         }

//         const request = tabStorage[tabId].requests[requestId];
//         Object.assign(request, {
//             endTime: timeStamp,
//             status: 'error',
//         });
//         console.log(tabStorage[tabId].requests[requestId]);
//     }, networkFilters);

//     chrome.tabs.onActivated.addListener((tab) => {
//         const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
//         if (!tabStorage.hasOwnProperty(tabId)) {
//             tabStorage[tabId] = {
//                 id: tabId,
//                 requests: {},
//                 registerTime: new Date().getTime()
//             };
//         }
//     });

//     chrome.tabs.onRemoved.addListener((tab) => {
//         const tabId = tab.tabId;
//         if (!tabStorage.hasOwnProperty(tabId)) {
//             return;
//         }
//         tabStorage[tabId] = null;
//     });

//     chrome.runtime.onMessage.addListener((msg, sender, response) => {
//         switch (msg.type) {
//             case 'popupInit':
//                 response(tabStorage[msg.tabId]);
//                 break;
//             default:
//                 response('unknown request');
//                 break;
//         }
//     });
// }());