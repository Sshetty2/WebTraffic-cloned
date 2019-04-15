/* src/content.js */
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