/* src/content.js */
/*global chrome*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';



let column = document.getElementById('simple-event-filter-column') || ''
let block_to_insert = document.createElement( 'div' );
block_to_insert.id = 'meetup-batch-event-set'
if(column) { column.appendChild( block_to_insert );
console.log('app was set');
ReactDOM.render(<div>{column ? <App />: ""}</div>, block_to_insert) }

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
