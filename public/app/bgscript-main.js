/* eslint-disable no-useless-escape */
/*global chrome*/

// function declaration to send errors back to application 
const errorLog = (err) => {
  chrome.runtime.sendMessage({type: 'error', error: err}, (response) => {
    console.log(response)
  }) 

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'error', error: err }, (response) => {
      console.log(response);
    });
  });
}

// event listener fires when a tab is updated and sends a message that is received by content script

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
  if (url !== undefined && changeInfo.status === "complete"){
    chrome.tabs.sendMessage(tabId, {type: 'onUpdateFrmEvent'}, function (response) {
      console.log(response)
    })
  }
})


// chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//   if(details.frameId === 0) {
//       // Fires only when details.url === currentTab.url
//       chrome.tabs.get(details.tabId, function(tab) {
//           if(tab.url === details.url) {
//             chrome.tabs.sendMessage(details.tabId, {type: 'onUpdateFrmEvent'}, function (response) {
//               console.log(response)
//             })
//           }
//       });
//   }
// });

// a new event listener is registered to listen for a message called meetupRequest which makes a call to the authentication api to redirect the user.     

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.action === 'meetupRequest'){ 
    chrome.identity.launchWebAuthFlow({ 
      url: `https://secure.meetup.com/oauth2/authorize?client_id=${mCK}&response_type=code&redirect_uri=${redirect_Uri}&scope=rsvp`,
      interactive: true
    },
    function(redirectUrl) {
      let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1)
      xhrMeetupTokenRequest(code, 'authorization_code')
        .then(async data => {
          data = await JSON.parse(data);
          let access_token = data.access_token
          chrome.storage.local.set({access_token: access_token}, () => console.log(`the access token has been set in local storage in the background script`));
          makeXhrRequestWithGroupId(access_token)
        }).catch(err => errorLog(err))
    })
  }
  return true;
})

// reset text field relay; I cant send messages from the content script to the application thats injected into the content script before rerouting it through the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "resetTextField") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'resetTextField' }, (response) => {
        console.log(response);
      });
    });
  }
});

let checkDefinition = value => typeof value === 'undefined' ? "" : value

// called after token is received

function makeXhrRequestWithGroupId(token) {
  chrome.storage.local.get(['dateRangeStart', 'dateRangeEnd', 'grpNameInput', 'urlPathName'], (result) => {
    let dateRangeStart = result.dateRangeStart
    let dateRangeEnd = result.dateRangeEnd
    let formattedDateRangeStart = formatDateToIsoString(dateRangeStart) 
    let formattedDateRangeEnd = formatDateToIsoString(dateRangeEnd) 
    let grpNameInput = result.grpNameInput
    let urlPathName = result.urlPathName
    let requestUrl
    console.log(`the urlPathName after it has been pulled from local storage is ${urlPathName}`)
    if (urlPathName) {
      console.log(`making request with the url path name which is ${urlPathName}`)
      requestUrl = `https://api.meetup.com/${urlPathName}/events?&sign=true&photo-host=public&no_later_than=${formattedDateRangeEnd}&no_earlier_than=${formattedDateRangeStart}&page=20`
      console.log(`${formattedDateRangeStart} ${formattedDateRangeEnd}`)
      return makeXhrRequestGeneric('GET', requestUrl, token)
      .then(async data => { // 
        let dummyObj = 
        [
          {
            "timezone": "US/Eastern"
          }
        ]
        let parsedData= await JSON.parse(data)
        let timezone = parsedData.length ? parsedData[0]["group"]["timezone"] : dummyObj[0]["timezone"]
        chrome.storage.local.set({timezone: timezone},()=>console.log(`timezone has been set in bg local storage in the background script`));
        chrome.runtime.sendMessage({ type: 'meetupEventData', meetupEventData: parsedData }, (response) => {
          console.log(response);
        });
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'meetupEventData', meetupEventData: parsedData }, (response) => {
            console.log(response);
          });
        });
      }).catch(err => {console.log(err); return errorLog(err)}) // end promise + async/await to query meetup's API with the group Id, date range start and date range end for meetup event data  
   
    // spaces for readability

      } else {
      console.log(`not making the request with the url path name which is ${urlPathName}`)
      requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=${grpNameInput}&page=20` 
      return makeXhrRequestGeneric('GET', requestUrl, token) 
      .then(async data => {
        let parsedData = await JSON.parse(data)
        // filter results for actual data or if it's not found then take the first result from the data object
        let dummyObj = 
        [
          {
            "id": 555,
            "timezone": "US/Eastern"
          }
        ]
        let parsedDataRefined = await parsedData.filter(x => x.name.toLowerCase() === grpNameInput.toLowerCase())
        parsedDataRefined = parsedDataRefined.length ? parsedDataRefined["0"] :  parsedData["0"] ? parsedData["0"] : dummyObj["0"]
        let timezone = parsedDataRefined.timezone
        chrome.storage.local.set({timezone: timezone},()=>console.log(`timezone has been set in bg local storage to ${parsedDataRefined.timezone}`));
        let groupId = parsedDataRefined.id;
        
        return groupId
      }) // end promise to make query for groupId using raw search text
      .then(async groupId => {
          requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${groupId}&time=${dateRangeStart},${dateRangeEnd}&page=20`
          try {
          const data = await makeXhrRequestGeneric('GET', requestUrl, token);
          let parsedData = await JSON.parse(data);
          let resultData = parsedData["results"];
          chrome.runtime.sendMessage({ type: 'meetupEventData', meetupEventData: resultData }, (response) => {
            console.log(response);
          });


          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'meetupEventData', meetupEventData: resultData }, (response) => {
              console.log(response);
            });
          });

          
        } // end try block to make query and then parse JSON data and set it in local storage using chrome's platform API --THIS WILL WORK--
        catch (err) {
          console.log(err);
          return errorLog(err);
        } 
        }).catch(err => {console.log(err); return errorLog(err)}) // end promise + async/await to query meetup's API with the group Id, date range start and date range end for meetup event data 
      } // end conditional check for url pathname / if a raw input string is given, this will be used to query Meetup.com's API
    }) // end chrome local storage callback
   } // end makeXhrRequestWithGroupId(token) function 
        

  chrome.runtime.onMessage.addListener((request, sendResponse) => {
    if (request.type === 'googleAuthFlow') {
      chrome.storage.local.get(['access_token'], (result) => {
        let access_token = result.access_token
        let results = request.parsedDataObj
        let eventUrl, urlPathName, eventId
        // try to RSVP for events with Meetup API using returned JSON data from client else catch error and log it
        try {
          return Promise.all(results.map(x => {
            eventUrl = x["event_url"]
            urlPathName = eventUrl.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/events)/)[0]
            eventId = x["id"]
            if (!(/\d/.test(eventId))) // checks to see if there is NOT number in the string (numbers mean the event has passed)
            return makeXhrPostRequestJSON('POST', `https://api.meetup.com/${urlPathName}/events/${eventId}/rsvps?&sign=true&photo-host=public&response=yes`, access_token)
          }))
        } catch (err) {
          console.log(err)
        } finally {
          chrome.storage.local.get(['timezone'], (result) => {
            let timezone = result.timezone
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
                "description":`This event is hosted by ${x["group"]["name"]} at ${ typeof x["venue"] !== 'undefined' ? x["venue"]["name"]: "N/A"}; More details regarding this event can be found at: ${checkDefinition(x["event_url"])}`,
                "summary":`${x["name"]}`,
                "location":`${ typeof x["venue"] !== 'undefined' ? checkDefinition(x["venue"]["address_1"]): ""} ${typeof x["venue"] !== 'undefined' ? checkDefinition(x["venue"]["address_2"]) : ""} - ${typeof x["venue"] !== 'undefined' ? checkDefinition(x["venue"]["city"]): ""} ${ typeof x["venue"] !== 'undefined' ? checkDefinition(x["venue"]["state"]): ""}`,
                "reminders":{  
                    "useDefault":true
                }
              }) 
            )
            chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
              return Promise.all(paramsArr.map(x => {
                  return makeXhrPostRequestJSON('POST', `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${gAK}`, token, x)
              }))
                .then(()=>{

                  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'success'}, (response) => {
                       if (response) {
                         console.log(response)
                       }
                      });
                   });

                  chrome.runtime.sendMessage({type: 'success'}, (response) => {
                    if (response) {
                      console.log(response)
                    }
                  });
                }
              ).catch(err => errorLog(err)) // end promise all
            }) // end identity auth token
          }) // end chrome storage api callback
        } // end finally block that is attached to the catch try that will try to make the RSVPs 
      }) // end chrome local storage call back for access token for the meetup api post request
    }; // end if statement nested inside of on message listener
  }) // end on message listener
    
     


