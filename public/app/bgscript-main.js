// event listener fires when a tab is updated and sends a message that is received by content script

const errorLog = (err) => {
  chrome.runtime.sendMessage({type: 'error', error: err}, (response) => {
    console.log(response)
  }) 
}


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
    if (url !== undefined && changeInfo.status == "complete"){
    chrome.tabs.sendMessage(tabId, {type: 'onUpdateFrmEvent'}, function (response) {
      console.log(response)
    })
  }
})

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
          data = await JSON.parse(data)
          makeXhrRequestWithGroupId(data.access_token)
        }).catch(err => errorLog(err))
    })
  }
  return true;
})

checkDefinition = value => typeof value == 'undefined' ? "" : value

// called after token is received

function makeXhrRequestWithGroupId(token) {
  
  chrome.storage.local.get(['dateRangeStart', 'dateRangeEnd', 'grpNameInput', 'urlPathName'], (result) => {
    let dateRangeStart = result.dateRangeStart
    let dateRangeEnd = result.dateRangeEnd
    let grpNameInput = result.grpNameInput
    let urlPathName = result.urlPathName
    let requestUrl
    if (urlPathName) {
      requestUrl = `https://api.meetup.com/2/groups?&sign=true&photo-host=public&group_urlname=${urlPathName}&page=20`
      return makeXhrRequestGeneric('GET', requestUrl, token)
      .then(async data => { // 
        let parsedData= await JSON.parse(data) // may need to promisify data parsing because an odd error of receiving an empty object response from api
        let groupId = parsedData["results"][0]["id"]
        let timezone = parsedData["results"][0]["timezone"]
        console.log(timezone)
        chrome.storage.local.set({timezone: timezone},()=>console.log(`timezone has been set in bg local storage in the background script`));
        return groupId
      })  // end promise to take data from xhr request promise and set the timezone in local storage using chrome\s local storage platform API and then return the groupId
      .then(async groupId => {
        requestUrl = `https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id=${groupId}&time=${dateRangeStart},${dateRangeEnd}&page=20`
        console.log(requestUrl)
        try {
          const data = await makeXhrRequestGeneric('GET', requestUrl, token);
          let parsedData = await JSON.parse(data);
          let resultData = parsedData["results"];
          chrome.runtime.sendMessage({ type: 'meetupEventData', meetupEventData: resultData }, (response) => {
            console.log(response);
          }); 
        } // end try block to make query and then parse JSON data and set it in local storage using chrome's platform API --THIS WILL WORK--
        catch (err) {
          console.log(err);
          return errorLog(err);
        } 
      }).catch(err => {console.log(err); return errorLog(err)}) // end promise + async/await to query meetup's API with the group Id, date range start and date range end for meetup event data  
      
    // spaces for readability

      } else {
      requestUrl = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&text=${grpNameInput}&page=20` 
      return makeXhrRequestGeneric('GET', requestUrl, token) 
      .then(async data => {
        let parsedData = await JSON.parse(data)
        let timezone = parsedData["0"].timezone
        chrome.storage.local.set({timezone: timezone},()=>console.log(`timezone has been set in bg local storage to ${parsedData["0"].timezone}`));
        let groupId = parsedData["0"].id;
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
      let results = request.parsedDataObj

      let eventUrl = results[0]["event_url"]
      let urlPathName = eventUrl.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/events)/)[0]
      console.log(urlPathName)
      let eventId = results[0]["id"]
      console.log(eventId)



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
    
     

