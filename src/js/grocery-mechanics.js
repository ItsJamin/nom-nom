// All Mechanics and Functions for the grocery-site

import * as db from './database-handler.js';
import { capitalizeFirstLetter } from './utils.js';

const searchBar = document.querySelector(".search-bar");
const searchResults = document.querySelector(".search-results");
const list = document.querySelector(".list");

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
                <input type="checkbox" class="checkbox" id="${i}">
                <label class="checkmark" for="${i}"></label>
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
                    addItemToList(capitalizeFirstLetter(item.name), item.categoryItem);
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
                <span class="name">${capitalizeFirstLetter(query)}</span>
            </div>
            <div class="right"></div>
        `;
        ghostResult.addEventListener("click", () =>
            addItemToList(capitalizeFirstLetter(query), "ㅤ")
        );
        searchResults.appendChild(ghostResult);
    }
}