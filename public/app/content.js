/*global chrome*/


if (document.getElementById('simple-cal-export')) document.getElementById('simple-cal-export').setAttribute("style", "height:0px; margin-left: 78.5px");


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
  // set styles rq
  if(document.getElementsByClassName('rock-salt')[0]) {
    document.getElementsByClassName('rock-salt')[0].setAttribute("style", "margin: 0px 10px 0px 10px; padding-bottom: 20px; line-height: 26pt");
  }
    return true;
});

// messing around with making the injected app sticky.. for some reason the app is sticky at that bottom and the top so it wont move down beyond a certain pixel range. more experimentation is needed
// document.getElementById('meetup-batch-event-set').setAttribute("style", 'position: -webkit-sticky; position: sticky; top: 500px;');
