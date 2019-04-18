/* src/content.js */
/*global chrome*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// creates a div with an id of 'meetup-batch-event-set' then injects the app into that container
let column = document.getElementById('simple-event-filter-column') || ''
let block_to_insert = document.createElement( 'div' );
block_to_insert.id = 'meetup-batch-event-set'
if(column) { column.appendChild( block_to_insert );
ReactDOM.render(<div>{column ? <App />: ""}</div>, block_to_insert) }

