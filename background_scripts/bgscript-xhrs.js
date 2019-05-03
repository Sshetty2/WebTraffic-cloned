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
