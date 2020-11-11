// pre-token
// A generic post request for an access token. The request body may need to be reformatted depending on the API being queried.

function xhrMeetupTokenRequest(code, grantType, refreshToken) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", gATEP, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				return resolve(xhr.response);
			} else {
				reject(
					Error({
						status: xhr.status,
						statusTextInElse: xhr.statusText
					})
				);
			}
		};
		xhr.onerror = function() {
			reject(
				Error({
					status: xhr.status,
					statusText: xhr.statusText
				})
			);
		};
		let requestBody = refreshToken
			? `client_id=${mCK}&client_secret=${mCS}&grant_type=${grantType}&refresh_token=${refreshToken}&scope=rsvp`
			: `client_id=${mCK}&client_secret=${mCS}&grant_type=${grantType}&redirect_uri=${redirect_Uri}&code=${code}&scope=rsvp`;
		xhr.send(requestBody);
	});
}

//post-token
// A generic XHR request code, requires an HTTP XML request method, a request url, and an access token.

function makeXhrRequestGeneric(method, url, token) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				return resolve(xhr.response);
			} else {
				reject(
					Error({
						status: xhr.status,
						statusTextInElse: xhr.statusText
					})
				);
			}
		};
		xhr.onerror = function() {
			reject(
				Error({
					status: xhr.status,
					statusText: xhr.statusText
				})
			);
		};
		xhr.send();
	});
}

function makeXhrPostRequestJSON(method, url, token, params = null) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				return resolve(xhr.response);
			} else {
				reject(
					Error({
						status: xhr.status,
						statusTextInElse: xhr.statusText
					})
				);
			}
		};
		xhr.onerror = function() {
			reject(
				Error({
					status: xhr.status,
					statusText: xhr.statusText
				})
			);
		};
		let stringifiedParams = JSON.stringify(params);
		xhr.send(stringifiedParams);
	});
}


function makeXhrGetWithUrlPathName(urlPathName, formattedDateRangeStart, formattedDateRangeEnd, token) {
	requestUrl = `https://api.meetup.com/${urlPathName}/events?&sign=true&photo-host=public&no_later_than=${formattedDateRangeEnd}&no_earlier_than=${formattedDateRangeStart}&page=20`;
	console.log(`${formattedDateRangeStart} ${formattedDateRangeEnd}`);
	return makeXhrRequestGeneric("GET", requestUrl, token)
		.then(async data => {
			//
			let dummyObj = [
				{
					timezone: "US/Eastern"
				}
			];
			let parsedData = await JSON.parse(data);
			let timezone = parsedData.length
				? parsedData[0]["group"]["timezone"]
				: dummyObj[0]["timezone"];
			chrome.storage.local.set({ timezone: timezone }, () =>
				console.log(`timezone has been set in bg local storage in the background script`)
			);
			chrome.runtime.sendMessage(
				{ type: "meetupEventData", meetupEventData: parsedData },
				response => {
					console.log(response);
				}
			);
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(
					tabs[0].id,
					{ type: "meetupEventData", meetupEventData: parsedData },
					response => {
						console.log(response);
					}
				);
			});
		})
		.catch(err => {
			console.log(err);
			return errorLog(err);
		}); // end promise + async/await to query meetup's API with the group Id, date range start and date range end for meetup event data
}