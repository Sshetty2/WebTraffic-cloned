/* eslint-disable no-undef */
/* eslint-disable no-useless-escape */
/*global chrome*/

// function declaration to send errors back to application
const errorLog = err => {
	loadingScreenOffRelay();
	chrome.runtime.sendMessage({ type: "error", error: err }, response => {
		console.log(response);
	});

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { type: "error", error: err }, response => {
			console.log(response);
		});
	});
};

// event listener fires when a tab is updated and sends a message that is received by content script

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	var url = tab.url;
	if (url !== undefined && changeInfo.status === "complete") {
		chrome.tabs.sendMessage(tabId, { type: "onUpdateFrmEvent" }, function (response) {
			console.log(response);
		});
	}
});

// reset text field relay; I cant send messages from the content script to the application thats injected into the content script without rerouting it through the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === "resetTextField") {
		// see bgscript-relays
		resetTextFieldRelay();
	}
});

// a new event listener is registered to listen for a message called meetupRequest which makes a call to the authentication api to redirect the user.

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "meetupRequest") {
		// a relay needs to be added for the injected application to know when the meetup request has been sent to the server so that the loading screen will initiate
		loadScreenRelay();
		chrome.identity.launchWebAuthFlow(
			{
				url: `https://secure.meetup.com/oauth2/authorize?client_id=${mCK}&response_type=code&redirect_uri=${redirect_Uri}&scope=rsvp`,
				interactive: true
			},
			function (redirectUrl) {
				let code = redirectUrl.slice(redirectUrl.indexOf("=") + 1);
				xhrMeetupTokenRequest(code, "authorization_code")
					.then(async data => {
						data = await JSON.parse(data);
						let access_token = data.access_token;
						chrome.storage.local.set({ access_token: access_token }, () =>
							console.log(`the access token has been set in local storage in the background script`)
						);
						makeMeetupRequestWithUrlPathName(access_token);
					})
					.catch(err => errorLog(err));
			}
		);
	}
	return true;
});

const checkDefinition = value => (typeof value === "undefined" ? "" : value);

// called after token is received

function makeMeetupRequestWithUrlPathName(token) {
	chrome.storage.local.get(
		["dateRangeStart", "dateRangeEnd", "grpNameInput", "urlPathName"],
		({ dateRangeStart, dateRangeEnd, grpNameInput, urlPathName = '' }) => {
			const formattedDateRangeStart = formatDateToIsoString(dateRangeStart);
			const formattedDateRangeEnd = formatDateToIsoString(dateRangeEnd);

			console.log(`the urlPathName after it has been pulled from local storage is ${urlPathName}`);
			if (!urlPathName) {
				// if not using urlPathName, find url name first
				return makeXhrRequestGeneric("GET", `https://api.meetup.com/find/groups?&text=${grpNameInput}&radius=global&page=30`, token)
					.then(async data => {
						let parsedData = await JSON.parse(data);
						// filter results for actual data or if it's not found then take the first result from the data object
						let dummyObj =
						{
							id: 555,
							timezone: "US/Eastern"
						}

						let parsedDataRefined = await parsedData.find(
							({ name }) => name.toLowerCase() === grpNameInput.toLowerCase()
						);
						parsedDataRefined = parsedDataRefined
							? parsedDataRefined
							: parsedData["0"]
								? parsedData["0"]
								: dummyObj;
						let timezone = parsedDataRefined.timezone;
						chrome.storage.local.set({ timezone: timezone }, () =>
							console.log(`timezone has been set in bg local storage to ${parsedDataRefined.timezone}`)
						);
						let groupUrlName = parsedDataRefined.urlname;

						return groupUrlName;
					}) // end promise to make query for groupId using raw search text
					.then(async groupUrlName => {
						urlPathName = groupUrlName

					})
					.catch(err => {
						return errorLog(err);
					});
			}
			makeXhrGetWithUrlPathName(urlPathName, formattedDateRangeStart, formattedDateRangeEnd)
		}
	); // end chrome local storage callback
} // end makeMeetupRequestWithUrlPathName(token) function

chrome.runtime.onMessage.addListener(({type, parsedDataObj}, sendResponse) => {
	if (type === "googleAuthFlow") {
		chrome.storage.local.get(["access_token"], ({access_token}) => {
			let results = parsedDataObj;
			let eventUrl, urlPathName, eventId;
			// try to RSVP for events with Meetup API using returned JSON data from client else catch error and log it
			try {
				return Promise.all(
					results.map(x => {
						eventUrl = x["link"];
						urlPathName = eventUrl.match(/(?<=\meetup\.com\/)(.*?)(?=\s*\/events)/)[0];
						eventId = x["id"];
						if (!/\d/.test(eventId))
							// checks to see if there is NOT number in the string (numbers mean the event has passed)
							return makeXhrPostRequestJSON(
								"POST",
								`https://api.meetup.com/${urlPathName}/events/${eventId}/rsvps?&sign=true&photo-host=public&response=yes`,
								access_token
							);
					})
				);
			} catch (err) {
				errorLog(err);
			} finally {
				chrome.storage.local.get(["timezone"], result => {
					let timezone = result.timezone;
					let paramsArr = results.map(x => ({
						end: {
							dateTime: `${convertToGoogleDTime(x["time"] + x["duration"])}`,
							timeZone: `${timezone}`
						},
						start: {
							dateTime: `${convertToGoogleDTime(x["time"])}`,
							timeZone: `${timezone}`
						},
						description: `This event is hosted by ${x["group"]["name"]} at ${typeof x["venue"] !== "undefined" ? x["venue"]["name"] : "N/A"
							}; More details regarding this event can be found at: ${checkDefinition(x["event_url"])}`,
						summary: `${x["name"]}`,
						location: `${typeof x["venue"] !== "undefined" ? checkDefinition(x["venue"]["address_1"]) : ""
							} ${typeof x["venue"] !== "undefined" ? checkDefinition(x["venue"]["address_2"]) : ""} - ${typeof x["venue"] !== "undefined" ? checkDefinition(x["venue"]["city"]) : ""
							} ${typeof x["venue"] !== "undefined" ? checkDefinition(x["venue"]["state"]) : ""}`,
						reminders: {
							useDefault: true
						}
					}));
					chrome.identity.getAuthToken({ interactive: true }, function (token) {
						return Promise.all(
							paramsArr.map(x => {
								return makeXhrPostRequestJSON(
									"POST",
									`https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${gAK}`,
									token,
									x
								);
							})
						)
							.then(() => {
								chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
									chrome.tabs.sendMessage(tabs[0].id, { type: "success" }, response => {
										if (response) {
											console.log(response);
										}
									});
								});

								chrome.runtime.sendMessage({ type: "success" }, response => {
									if (response) {
										console.log(response);
									}
								});
							})
							.catch(err => errorLog(err)); // end promise all
					}); // end identity auth token
				}); // end chrome storage api callback
			} // end finally block that is attached to the catch try that will try to make the RSVPs
		}); // end chrome local storage call back for access token for the meetup api post request
	} // end if statement nested inside of on message listener
}); // end on message listener
