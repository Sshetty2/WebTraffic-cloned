/*global chrome*/


if (document.getElementById('simple-cal-export')) {
  // style injection
  document.getElementById('simple-cal-export').setAttribute("style", "height:50px; margin-left: 78.5px");
}
// build array of group names from meetup homepage using doc selectors

function buildGroupArray(els){
  let propArr = []
  let innerText
      for(let i = 0; i < els.length; i++)  {
          innerText = els[i].getElementsByTagName('span')[0].innerText;
              if (!(propArr.includes(innerText))) propArr.push(innerText)
       }
  return propArr
  }


// modified buildGroupArray to build a list of tuples of both the urlpathname uniqueid and the GroupName so that this can be used instead of doing a roundabout search for the groupname

// function buildGroupArray(els){  
//   let combinedArr = []
//   let hrefArr = []
//   let href, grpName  
//       for(let i = 0; i < els.length; i++)  {
//           let tempArr = []
//           href = els[i].children[1].children[0].children[1].href.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/events)/)[0]
//           if (!(hrefArr.indexOf(href) !== -1 )) { 
//           hrefArr.push(href)
//           console.log(hrefArr)
//           tempArr.push(href)
//           grpName = els[i].children[1].children[0].children[0].getElementsByTagName('span')[0].innerText;
//           tempArr.push(grpName)
//           combinedArr.push(tempArr)
//           }
//        }
//   return combinedArr
//   }

// buildGroupArray(document.getElementsByClassName('row event-listing clearfix doc-padding'))
  

// event listener that listens for messages from bg script everytime the page is reloaded

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'onUpdateFrmEvent') {
    sendResponse('the the onupdate listener is working correctly and we recieved the message to fire our messages')
    //chrome message to set state of textField to empty so that a user can type in it
    chrome.runtime.sendMessage({type: 'resetTextField'}, (response) => {
      //console.log(response)
    }) 

    let pathname = window.location.pathname
    let groupName, grpNameArray;
    // checks current pathname if it has the following strings and if it doesn't and its not empty, then groupName is assigned to the pathname 
    if(!pathname.match( /(find|login|create|messages|account|members|topics|apps|meetup_api)/ ) && pathname.slice(1)) { 
      pathname = pathname.slice(1)
      groupName = pathname.slice(0, pathname.indexOf('/')) 
    } else {
      groupName = ""
    }
    chrome.runtime.sendMessage({type: 'urlGroupName', urlGroupName: groupName})
    chrome.storage.local.set({urlGroupName: groupName}) 
    grpNameArray = buildGroupArray(document.getElementsByClassName('text--labelSecondary'));
    console.log(`the value of the grpNameArray is ${grpNameArray}`)
    chrome.storage.local.set({grpNameArray: grpNameArray})
  }
  return true;
});

// event listener that listens for messages that come from the application script 

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let groupName, groupNameArray;
  if (request.type === 'popupInit') {
    let pathname = window.location.pathname
    console.log('popupinit')
    if(!pathname.match( /(find|login|create|messages|account|members|topics|apps)/ ) && pathname.slice(1)) { 
      pathname = pathname.slice(1)
      groupName = pathname.slice(0, pathname.indexOf('/')) 
    } else {
      groupName = ""
    }
    chrome.storage.local.set({urlGroupName: groupName}) 
    groupNameArray = buildGroupArray(document.getElementsByClassName('text--labelSecondary'))
    console.log(`the value of the groupNameArray is ${groupNameArray}`)
    sendResponse({groupName: groupName, groupNameArray: groupNameArray });
  };
  // style injections
  if(document.getElementsByClassName('rock-salt')[0]) {
    document.getElementsByClassName('rock-salt')[0].setAttribute("style", "margin: 0px 0px 0px 0px; padding-bottom: 15px; line-height: 26pt; font-family: \"Graphik Meetup\",helvetica,arial,sans-serif ; font-size: 28px; color: #00455d");
    document.getElementsByClassName('react-calendar react-calendar--selectRange')[0].setAttribute("style", '#beige; border-radius: 10px;');
    document.getElementById('mbest-form-button').setAttribute("style", "background-color: #00455d;");
  // get the height of the document by querying the node where all of the meetup events reside
    const docHeight = document.getElementsByClassName('searchResults')[0].scrollHeight
    document.getElementById('meetup-batch-event-set').setAttribute("style", 'position: -webkit-sticky; position: sticky; top: 135px; padding-bottom: 0px#b5d2c8; padding-bottom: 5px; box-shadow: 0px 0px 20px 3px rgba(0,0,0,0.64)');    document.getElementsByClassName('App')[0].setAttribute("style", 'padding-top: 10px;padding-bottom: 0px;#e4e6e6; padding-bottom: 5px; box-shadow: 0px 0px 17px -7px rgba(0,0,0,0.63);');
    document.getElementById('simple-event-filter-column').setAttribute("style", `height: ${docHeight}px`)
  }
    return true;
});

