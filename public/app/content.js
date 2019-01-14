
var textArray = []
var text = $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
    var text = $(this).text();
    if (!textArray.includes(text)) textArray.push(text)
});



chrome.runtime.sendMessage({greeting: textArray}, function(response) {
    console.log(response.farewell);
  });