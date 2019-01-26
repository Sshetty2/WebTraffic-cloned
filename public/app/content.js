
// var textArray = []
// var text = $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
//     var text = $(this).text();
//     if (!textArray.includes(text)) textArray.push(text)
// });



// chrome.runtime.sendMessage({greeting: textArray}, function(response) {
//     console.log(response.farewell);
//   });


function buildPropArr(els){
  let propArr = []
  let innerText
      for(i = 0; i < els.length; i++)  {
          innerText = els[i].getElementsByTagName('span')[0].innerText;
              if (!(propArr.includes(innerText))) propArr.push(innerText)
       }
  return propArr
  }
  



chrome.extension.onMessage.addListener(function(request, sender, response) {
    if (request.type === 'onUpdateFrmEvent') {
      let pathname = window.location.pathname
      let groupName
      // checks current pathname if it has the following strings and if it doesn't and its not empty, then groupName is assigned to the pathname 
      if(!pathname.match( /(find|login|create|messages|account|members|topics|apps)/ ) && pathname.slice(1)) { 
        pathname = pathname.slice(1)
        groupName = pathname.slice(0, pathname.indexOf('/')) 
      } else {
        groupName = ""
      }
      if(groupName){
        chrome.runtime.sendMessage({type: 'urlgroupName', urlgroupName: groupName}, (response) => {
          console.log(response)
        }) 
      } else{
        grpNameArray = buildPropArr(document.getElementsByClassName('text--labelSecondary'))
        chrome.storage.local.set({grpNameArray: grpNameArray}, function() {
          console.log('Value is set to ' + grpNameArray[0]);
        })
        response(grpNameArray);
      };
    }
    return true;
  });

chrome.runtime.onMessage.addListener(function(request, sender, response) {
  if (request.type === 'popupInit') {
    response(buildPropArr(document.getElementsByClassName('text--labelSecondary')));
  };
  return true;
});



// $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
//     var text = $(this).text();
//     console.log(text);
// });

// group page
// $(('.groupHomeHeader-groupName'), '.groupHomeHeader-groupNameLink').textContent



// event page
// $('.event-info-group--groupName').textContent