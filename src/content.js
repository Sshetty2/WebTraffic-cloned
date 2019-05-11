/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* src/content.js */

import React from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";

let column = document.getElementById("simple-event-filter-column") || "";
let block_to_insert = document.createElement("div");
block_to_insert.id = "meetup-batch-event-set";
if (column) {
	column.appendChild(block_to_insert);
	// App injection
	ReactDOM.render(<div>{column ? <App /> : ""}</div>, block_to_insert);
}
