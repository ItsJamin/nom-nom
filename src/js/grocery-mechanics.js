// All Mechanics and Functions for the grocery-site

import * as db from './database-handler.js';
import { capitalizeFirstLetter } from './utils.js';

const searchBar = document.querySelector(".search-bar");
const searchResults = document.querySelector(".search-results");
const listItems = document.querySelector(".list");

searchBar.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    updateSearchResults(query);
});



function updateSearchResults(query) {
    searchResults.innerHTML = ""; // Alte Ergebnisse löschen

    if (query === "") return; // Keine Suche bei leerem Input

    // Auf die Datenbank zugreifen und Ergebnisse holen
    const filteredItems = db.getObjectsForQuery(query);

    // Gefundene Ergebnisse anzeigen
    var i = 0;
    filteredItems.forEach((item) => {
        const result = document.createElement("div");
        result.classList.add("result");
        result.innerHTML = `
            <div class="left">
                <span>${item.categoryItem}</span>
                <span class="name">${capitalizeFirstLetter(item.name)}</span>
            </div>
            <div class="right">
                <input type="checkbox" class="checkbox" id="${item.name}">
                <label class="checkmark" for="${item.name}"></label>
            </div>
        `;

        const checkbox = result.querySelector("input[type='checkbox']");

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                // Element aus der Liste entfernen
                result.classList.add("disappear");
                setTimeout(() => {
                    result.remove();
                }, 200);
            }
        });

        result.addEventListener("click", () => {
            setTimeout(() => {
                if (!result.classList.contains("disappear")) {
                    addItemToList(item);
                }
            }, 10);
        });

        searchResults.appendChild(result);
        i++;
    });

    if (filteredItems.length === 0) {
        // Keine exakte Übereinstimmung: Geist-Item anzeigen
        const ghostResult = document.createElement("div");
        ghostResult.classList.add("result");
        ghostResult.innerHTML = `
            <div class="left">
                <span>ㅤ</span>
                <span class="name" id="Ghost">${capitalizeFirstLetter(query)}</span>
            </div>
            <div class="right"></div>
        `;
        ghostResult.addEventListener("click", () => {
            // TODO: Create new database entry
            item = null;
            addItemToList(item);
        });
        searchResults.appendChild(ghostResult);
    }
}

function addItemToList(item) {
    const div = document.createElement("div");

    div.classList.add("item");
    div.setAttribute("draggable", "true");

    
    // Check if item is already in the list
    const divElements = document.querySelectorAll('div > div');
    const matchingDiv = Array.from(divElements).find(outerDiv => {
        const span = outerDiv.querySelector('span'); // Check for a span within the inner div
        return span && span.textContent === item.name; // Match the exact text
    });

    if (matchingDiv != null) {
        return null;
    }

    div.innerHTML = `
      <div class="left">
        <p class="icon">${item.categoryItem || ""}</p> 
        <span class="name">${capitalizeFirstLetter(item.name)}</span>
      </div>
      <div class="right">
        <input type="text" class="amount" value="" readonly>
        <input type="checkbox" class="checkbox" id="${item.name}">
        <label class="checkmark" for="${item.name}"></label>
      </div>
    `;

    listItems.insertBefore(div, listItems.firstChild);
    searchBar.value = ""; // Suchleiste leeren
    searchResults.innerHTML = ""; // Suchergebnisse leeren

    searchBar.value = ""; // Suchleiste leeren
    searchResults.innerHTML = "";
  
    // Mengenbearbeitung aktivieren
    activateAmountEditing(div.querySelector(".amount"));
    //activateDragAndDrop(div);

    const checkbox = div.querySelector("input[type='checkbox']");

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            div.classList.add('disappear');
            setTimeout(() => {
                div.remove();
            }, 200);
            
        }
    });
}