/* eslint-disable no-useless-escape */
/*global chrome*/

// style injection to decrease the size of the 'export calendar' div if it exists
if (document.getElementById('simple-cal-export')) {
  document.getElementById('simple-cal-export').setAttribute("style", "height:50px; margin-left: 78.5px");
}
// build array of group names from meetup homepage using doc selectors
// modified buildGroupArray to build a list of tuples of both the urlpathname uniqueid and the GroupName so that this can be used instead of doing a roundabout search for the groupname

function buildGroupArray(){  
  let grpNameCollection = document.getElementsByClassName('row event-listing clearfix doc-padding');
  let combinedArr = []
  let hrefArr = []
  let href, grpName  
      for(let i = 0; i < grpNameCollection.length; i++)  {
          let tempArr = []
          try {
            href = grpNameCollection[i].children[1].children[0].children[1].href.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/)/)[0]
          } catch(err) {
              href = ""
          }
          if (!(hrefArr.indexOf(href) !== -1 )) { 
          hrefArr.push(href)
          tempArr.push(href)
          grpName = grpNameCollection[i].children[1].children[0].children[0].getElementsByTagName('span')[0].innerText;
          tempArr.push(grpName)
          combinedArr.push(tempArr)
          }
       }
  return combinedArr
}

// buildGroupArray(document.getElementsByClassName('row event-listing clearfix doc-padding'))
  
// event listener that listens for messages from bg script everytime the page is reloaded

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'onUpdateFrmEvent') {
    sendResponse('the the onupdate listener is working correctly and we recieved the message to fire our messages')
    //chrome message to set state of textField to empty so that a user can type in it
    chrome.runtime.sendMessage({type: 'resetTextField'}) 
    let pathname = window.location.pathname
    let groupName, grpNameArray
    // checks current pathname if it has the following strings and if it doesn't and its not empty, then groupName is assigned to the pathname 
    if(!pathname.match( /(find|login|create|messages|account|members|topics|apps|meetup_api)/ ) && pathname.slice(1)) { 
      pathname = pathname.slice(1)
      groupName = pathname.slice(0, pathname.indexOf('/')) 
    } else {
      groupName = ""
    }

    // a message is sent to the extension script just in case it needs to be imperatively set in the text field and the chrome local storage object is updated so that it can be pulled when the API request is being made
    chrome.runtime.sendMessage({type: 'urlGroupName', urlGroupName: groupName})
    chrome.storage.local.set({urlGroupName: groupName})
    // A new array of tuples is built using the current page's dom nodes. the tuples include the url path group name (api unique id) as the first entry and the formal capitalized version of the group name as second entry
    grpNameArray = buildGroupArray()
    // set the array of tuples in the local storage object to be accessed whenever needed
    chrome.storage.local.set({grpNameArray: grpNameArray})

    // button(s) injection script after the app has been loaded
    let columnContainerCollection = document.getElementsByClassName('row event-listing clearfix doc-padding')
    let columnContainerCollectionArray = [...columnContainerCollection]

    // initialize onClick to set date time start to todays date and the current time and the date range end to one day from today 
    function onClick(){
        let urlPathName = this.id.split(' ')[0]
        let startTime = this.id.split(' ')[1]
        // set start range to the utc milliseconds formatted and pulled from the dom node, and the date range end to the date range start plus one day
        chrome.storage.local.set({dateRangeStart: startTime - 14400000, dateRangeEnd: startTime - 14100000, urlPathName: urlPathName})
        chrome.runtime.sendMessage({ 
            action: 'meetupRequest'
        }, response => console.log(response))
    }

    // having an issue where the button injection script will fail because the page hasn't loaded completely yet, and the chome platform api will not catch this because the loading is happening with Iframes. Setting a timeout will not work...
    // check to see if any of the buttons exist then if one of them doesn't then try to add the button injection script
    
    if (document.getElementsByClassName('row-item row-item--shrink friend-container')[0].childElementCount === 1){
      try{
        columnContainerCollectionArray.map(x => {
          let block_to_insert = document.createElement( 'div' );
          let buttonContainer = document.createElement('button')
          buttonContainer.innerHTML = 'MBEST'
          let groupName = x.children[1].children[0].children[1].href.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/)/)[0]
          let startTime = new Date(x.children[0].children[0].children[0].dateTime).getTime()
          buttonContainer.id = `${groupName} ${startTime}`
          buttonContainer.setAttribute("style", 'background-color: #0f1721;color: white;font-family: "Roboto", "Helvetica", "Arial", sans-serif;font-weight: 400;font-size: medium; padding: 10px;');
          buttonContainer.onclick = onClick
          block_to_insert.appendChild(buttonContainer)
          x.children[2].appendChild(block_to_insert)
          x.children[2].setAttribute("style", 'display: flex; flex-direction: column;');
          x.children[2].children[0].setAttribute("style", 'margin-bottom: auto;');
          return 
        })
      }catch(err){return null}
    }
  }
  return true;
});

// event listener that listens for messages that come from the application script 

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let groupName, grpNameArray, grpNameCollection;
  if (request.type === 'popupInit') {
    let pathname = window.location.pathname
    if(!pathname.match( /(find|login|create|messages|account|members|topics|apps)/ ) && pathname.slice(1)) { 
      pathname = pathname.slice(1)
      groupName = pathname.slice(0, pathname.indexOf('/')) 
    } else {
      groupName = ""
    }
    chrome.storage.local.set({urlGroupName: groupName}) 
    grpNameCollection = document.getElementsByClassName('row event-listing clearfix doc-padding');
    grpNameArray = buildGroupArray(grpNameCollection)
    console.log(`the value of the groupNameArray is ${grpNameArray}`)
    // a message is sent back to the App with the valid groupName if user has navigated to a valid Meetup url with the groups name in the path AND the groupNameArray pulled from the dom if they are currently on the homepage
    sendResponse({groupName: groupName, groupNameArray: grpNameArray });
  };
  // style injections
  if(document.getElementsByClassName('rock-salt')[0]) {
    document.getElementsByClassName('rock-salt')[0].setAttribute("style", "margin: 0px 0px 0px 0px; padding-bottom: 15px; line-height: 26pt; font-family: \"Graphik Meetup\",helvetica,arial,sans-serif ; font-size: 28px; color: #00455d");
    document.getElementsByClassName('react-calendar')[0].setAttribute("style", 'background-color: #f5f5dc; border-radius: 10px;');
    document.getElementById('mbest-form-button').setAttribute("style", "background-color: #0f1721;");
  // get the height of the document by querying the node where all of the meetup events reside
    const docHeight = document.getElementsByClassName('searchResults')[0].scrollHeight
    document.getElementById('meetup-batch-event-set').setAttribute("style", 'position: -webkit-sticky; position: sticky; top: 135px; padding-bottom: 0px#b5d2c8; padding-bottom: 5px; box-shadow: 0px 0px 20px 3px rgba(0,0,0,0.64)');    document.getElementsByClassName('App')[0].setAttribute("style", 'padding-top: 10px;padding-bottom: 0px;#e4e6e6; padding-bottom: 5px; box-shadow: 0px 0px 17px -7px rgba(0,0,0,0.23);');
    document.getElementById('simple-event-filter-column').setAttribute("style", `height: ${docHeight}px`)
  }
    return true;
});

