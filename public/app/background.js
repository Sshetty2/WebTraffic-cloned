
const meetup_client_key = 'rd4j2luc2buqrg44s86ka6fhse'
const redirect_Uri =  'https://jodnpnodmbflogmledmffojgmdjljfmj.chromiumapp.org/'
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
const requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=BUILD+WITH+CODE+-+LOS+ANGELES&page=20`

// called after token is received

function makeXhrRequestForGroupId(token) { //.1 
   //.2
   let requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=${groupId}&page=20` 
    return makeXhrRequest('GET', requestUrl, token) // .10
    .then((data) => { // .11
      let parsedData = JSON.parse(data) //.12

      return parsedData //.15
    })

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
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){ //.1
    if (request.action === 'meetupRequest'){ //.2
      chrome.identity.launchWebAuthFlow({ //.3
        url: `https://secure.meetup.com/oauth2/authorize?client_id=${meetup_client_key}&response_type=code&redirect_uri=${redirect_Uri}`,
        interactive: true
      },
      function(redirectUrl) { //.4 
        console.log(redirectUrl)
        let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1)
        makeXhrPostRequest(code, 'authorization_code')
          .then(data => {
            data = JSON.parse(data)
            makeXhrRequestForGroupId(data.token)


          })
          .catch(err => console.log(err))







        // console.log('redirectUrl')
        // chrome.runtime.sendMessage({type: 'redirectUrl', redirectUrl: redirectUrl}, (response) => {
        //   if (response) {
        //       console.log(`the response from the client was ${response}`);
        //   }
        // });
        

        // let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1) //.5
  
        // makeXhrPostRequest(code, 'authorization_code') //.6
        //   .then(data => {
        //     data = JSON.parse(data) //.7
        //     chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){//.8
        //       if ( //.9
        //         changeInfo.status === 'complete' && tab.url.indexOf('spotify') > -1
        //       || changeInfo.status === 'complete' && tab.url.indexOf('spotify') > -1 && tab.url.indexOf('user') > -1 && tab.url.indexOf('playlists') === -1
        //     ) {
        //         chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ //.10
        //             chrome.tabs.sendMessage(tabs[0].id, {token: data.access_token}, function (response) { //.11
        //               console.log('response is ', response) //.12
        //             });//end chrome send message
        //         })//end chrome tab query
        //       }
        //     })//end onUpdated event listener
        //     return data //.13
        //   })//end promise
        //   .catch(err => console.error(err)) //.14
      }) //launch web auth flow
  
    }
    return true; //if statment
  })// exte







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