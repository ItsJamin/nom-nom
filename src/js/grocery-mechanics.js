// All Mechanics and Functions for the grocery-list-site

import * as db from './database-handler.js';
import { capitalizeFirstLetter, activateAmountEditing } from './utils.js';

const searchBar = document.querySelector(".search-bar");
const searchResults = document.querySelector(".search-results");
const listItems = document.querySelector(".list");

searchBar.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    updateSearchResults(query);
});

searchBar.addEventListener("keypress", (event) => {
    const query = event.target.value.trim();
    if (event.key === "Enter" && query.length > 0) {
        var item = db.getOrCreateItemByName(query.toLowerCase());
        addItemToList(item);
    }
});


function updateSearchResults(query) {
    searchResults.innerHTML = ""; // Alte Ergebnisse löschen

    if (query === "") return; // Keine Suche bei leerem Input

    query = query.toLowerCase();

    // Auf die Datenbank zugreifen und Ergebnisse holen
    const filteredItems = db.getObjectsForQuery(query, true);

    // Gefundene Ergebnisse anzeigen
    var i = 0;
    var exactMatch = false;

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
                    db.deleteItem(item.name)
                    result.remove();
                    removeItemFromListByName(item.name);
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

        if (query == item.name) {
            exactMatch = true;
        }
    });

    if (exactMatch == false) {
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
            var item = db.createItem(query);
            addItemToList(item);
        });
        searchResults.insertBefore(ghostResult, searchResults.firstChild);
    }
}

function addItemToList(item) {
    const div = document.createElement("div");

    div.classList.add("item");
    div.setAttribute("draggable", "true");

    searchBar.value = ""; // Suchleiste leeren
    searchResults.innerHTML = ""; // Suchergebnisse leeren

    
    // Check if item is already in the list
    const divElements = document.querySelectorAll('div > div');
    const matchingDiv = Array.from(divElements).find(outerDiv => {
        const span = outerDiv.querySelector('span'); // Check for a span within the inner div
        return span && span.textContent.toLowerCase() === item.name; // Match the exact text
    });

    if (matchingDiv != null) {
        showElementAsInvalid(matchingDiv.querySelector('span').parentElement.parentElement);
        return;
    }

    div.innerHTML = `
      <div class="left">
        <p class="icon">${item.categoryItem || "ㅤ"}</p> 
        <span class="name">${capitalizeFirstLetter(item.name)}</span>
      </div>
      <div class="right">
        <input type="text" class="amount" value="" readonly>
        <input type="checkbox" class="checkbox" id="${item.name}">
        <label class="checkmark" for="${item.name}"></label>
      </div>
    `;

    listItems.insertBefore(div, listItems.firstChild);
  
    // Mengenbearbeitung aktivieren
    activateAmountEditing(div.querySelector(".amount"));
    activateDragAndDrop(div);

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

// Drag-and-Drop-Funktionalität
function activateDragAndDrop(divItem) {
    const placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");


    // Mobile: Touch-based Drag-and-Drop
    divItem.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        divItem.classList.add("dragging");
        divItem.dataset.startX = touch.clientX;
        divItem.dataset.startY = touch.clientY;
        //list.insertBefore(placeholder, item.nextSibling);
    });

    divItem.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const currentY = touch.clientY;
        const draggingItem = document.querySelector(".dragging");

        draggingItem.style.position = "absolute";
        draggingItem.style.top = `${touch.clientY - draggingItem.offsetHeight / 2}px`;
        draggingItem.style.left = `${touch.clientX - draggingItem.offsetWidth / 2}px`;

        const afterElement = getDragAfterElement(listItems, currentY);
        if (afterElement == null) {
            listItems.appendChild(placeholder);
        } else {
            listItems.insertBefore(placeholder, afterElement);
        }
    });

    divItem.addEventListener("touchend", () => {
        const draggingItem = document.querySelector(".dragging");
        listItems.insertBefore(draggingItem, placeholder);
        placeholder.remove();
        draggingItem.classList.remove("dragging");
        draggingItem.style.position = "";
        draggingItem.style.top = "";
        draggingItem.style.left = "";
    });
}

// Hilfsfunktion, um das Element nach der aktuellen Position zu ermitteln
function getDragAfterElement(container, y) {
    const draggableElements = [
        ...container.querySelectorAll(".item:not(.dragging)"),
    ];

    return draggableElements.reduce(
        (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

function removeItemFromListByName(name) {
    const items = listItems.querySelectorAll(".item"); // Alle Items der Liste
    items.forEach((item) => {
        const itemName = item.querySelector(".name").textContent.toLowerCase();
        if (itemName === name.toLowerCase()) {
            item.remove(); // Entferne das Item
        }
    });
}

function showElementAsInvalid(elem) {
    
    elem.classList.add('invalid');
    setTimeout(() => {
        elem.classList.add('invalid-remove');
    }, 200);

    setTimeout(() => {
        elem.classList.remove('invalid');
        elem.classList.remove('invalid-remove');
    }, 500);
}