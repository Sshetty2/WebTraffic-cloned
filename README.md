
# Meetup Batch-Event-Set Tool !
[
![MBEST Youtube vid](https://i.imgur.com/j2E8Y1s.png)](https://www.youtube.com/watch?v=SrPmpsEeKl0)


* [Introduction](##introduction)
	* [Download Link](###download-link)
* [Summary](##summary)
* [The Background Script](##the-background-script)
* [The Content Script](##the-content-script)
* [The Application/Content Script](##the-application/popup-script)
	* [Other Notes Regarding React View Layer](###other-notes-regarding-react-view-layer)

##**Introduction** 

This project is a chrome extension that uses React for the user-interface. It allows the user to schedule multiple Meetup.com events to their Google Calendar and RSVP for them at one time by inputting a group name and selecting a date range and clicking 'schedule'. 

###**Download Link**

You can download it here from the chrome extension store! 

https://chrome.google.com/webstore/detail/meetup-batch-event-set-to/cabfodbfjmgloaallchcnnkgcfpnobem

##**Summary** 

Chrome extensions are created by configuring three essentially containerized Javascript environments that communicate with each other through Google Chrome's messaging platform API; the content script,  application/popup script, and the background script. 

*Messaging example on background script:*

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){ 
	    if (request.action === 'meetupRequest'){
		    ...{do something}    
		}
		return true
	} 




These three scripts are separated from one another to prevent from cross-scripting attacks within the browser during run-time. They are allowed different types of permissions and must be configured separately. Several Chrome platform API's are  available to assist with development though they can only be run in specific contexts that will be explained in detail. 

*visual representation of the interaction of scripts:*

![Imgur](https://i.imgur.com/c8zZt9M.png)


##**The Background Script**

The background script runs in the background of the browser as you are browsing and is loaded when the extension is installed. This script has access to most of Chrome’s platform APIs and can and should be used to register event listeners that will trigger if and when certain events occur in your application.

In this use-case, event listeners that ‘listen’ for when tabs are updated  and when Authentication flow needs to be initiated are registered when the code is first executed and triggered when the respective event occurs. The background script also handles the XML HTTP Requests and data parsing. The XML HTTP Requests' response headers needed to be configured with valid authentication tokens and so OAuth is heavily employed to attain redirect uri codes and then authentication tokens to be used within the response headers of the asynchronous XHRs.

*visual representation of OAuth Flow:*

![Imgur](https://i.imgur.com/jFWfVU4.png)

*NOTE: Please refer to the background script for further explanation of the various XHR's and API calls. The scripts are heavily annotated.*

##**The Content Script**

The content script is responsible for executing code in the context of the content that is currently being displayed to the user within the browser.Content scripts have access to a limited range of chrome platform APIs including messaging and local storage, however, they are the only scripts that have access to the document object of the displayed page. 

In this use-case, content scripts were used to pull group names from Meetup’s website either from the. The content script would set the value of a ‘groupNameArray’ object in googles local storage object every time a tab is updated. It would learn this information from an incoming message from the background script. *

 The content script will also query for the current pathname and uses regex to parse the pathname in order to separate out a group name if the user has navigated to an associated group page. The reason for this is because the url pathname as it applies to the Meetup.com group is the most acceptable query parameter when querying Meetup.com's API. Therefore, the group name is autopopulated when the user has navigated to any associated page. The content script will pull the pathname and store in local storage where it will be handled later in the the application/popup script.

see snippet below: 

     chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
	    if (request.type === 'onUpdateFrmEvent') { 
		    chrome.runtime.sendMessage({type: 'resetTextField'}, (response) => {
		    console.log(response)
	    }) 
	    let pathname = window.location.pathname
	    let groupName 
	    if(!pathname.match(/(find|login|create|messages|account|members|topics|apps|meetup_api)/) && pathname.slice(1)) {
		    pathname = pathname.slice(1)
		    groupName = pathname.slice(0, pathname.indexOf('/')) 
	    } else {
	      groupName = ""
	    }
	    chrome.runtime.sendMessage({type: 'urlGroupName', urlGroupName: groupName})
	    chrome.storage.local.set({urlGroupName: groupName}) 
	    grpNameArray = buildPropArr(document.getElementsByClassName('text--labelSecondary'))
	    chrome.storage.local.set({grpNameArray: grpNameArray})
	    }
	    return true;
	});





##**The Application/Popup Script**


The Application/Popup script runs in the context of the running extension application. This script has a limited access to chrome’s platform APIs and is not readily aware of the current tab opened. In order for your underlying application logic to be dynamic and communicate with the rest of the internet, the user must grant explicit permissions that will have been stated in the manifest.json file. Messages will need to be sent or listeners will need to be registered in order to communicate with either the content or background script in order to request or send information using chrome’s messaging platform API.

In this use-case, the popup script houses the react application and the listeners are effectively registered in the ComponentDidMount lifecycle method. Messages are configured to be sent when the user clicks the schedule and confirmation buttons and when messages are recieved back, certain switches in state are toggled that tell the application which windows need to be opened. 

*see snippet below:*

    componentDidMount() {
	    chrome.runtime.sendMessage({type: 'popupInit'}, (response) => {
		    if (response) {
			    this.setState({
				    grpNameArray: response.groupNameArray,
				    textField: response.groupName,
				    urlGroupName: response.groupName
				 });
			}
		...{other messages and component methods}
		});

###**Other notes regarding React View Layer**

The React part of the application utilizes a collection of different components that help to separate workflow and essentially make the input fields more dynamic. It uses a calendar component borrowed from react-calendar, an Autosuggest component borrowed from react-autosuggest and collection of styled input components borrowed from Google's material ui. No state management library was implemented in this project because the number of components being utilized was relatively small. 




