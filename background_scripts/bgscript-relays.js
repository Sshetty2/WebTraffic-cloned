/*global chrome*/

const loadScreenRelay = () => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{type: "loadingScreenInit"},
			response => {
				console.log(response);
			}
		);
	});
};

const loadingScreenOffRelay = () => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{type: "loadingScreenOff"},
			response => {
				console.log(response);
			}
		);
	});
};

const resetTextFieldRelay = () => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type: "resetTextField"}, response => {
			console.log(response);
		});
	});
};
