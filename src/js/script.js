// Initialisiere die Einkaufsliste
const items = [
    { name: "Tomaten", icon: "🥕" },
    { name: "Erbsen", icon: "🥕" },
    { name: "Milch", icon: "🍼" },
    { name: "Klopapier", icon: "🧻" },
  ];
  
  // Element-Referenzen
  const searchBar = document.querySelector(".search-bar");
  const searchResults = document.querySelector(".search-results");
  const list = document.querySelector(".list");
  
  // Funktion zum Hinzufügen eines Items zur Einkaufsliste
  function addItemToList(name, icon) {
    const div = document.createElement("div");
    div.classList.add("item");
    div.setAttribute("draggable", "true");
    div.innerHTML = `
      <div class="left">
        <p class="icon">${icon || ""}</p> 
        <span class="name">${name}</span>
      </div>
      <div class="right">
        <input type="text" class="amount" value="" readonly>
        <input type="checkbox" id="checkbox">
        <label class="checkmark" for="checkbox"></label>
      </div>
    `;
    list.insertBefore(div, list.firstChild);
    searchBar.value = ""; // Suchleiste leeren
    searchResults.innerHTML = ""; // Suchergebnisse leeren
  
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

    searchBar.value = ""; // Suchleiste leeren
    searchResults.innerHTML = "";
  }
  
  // Funktion zur Bearbeitung der Mengenangabe
  function activateAmountEditing(amountInput) {
    amountInput.addEventListener("click", () => {
      amountInput.removeAttribute("readonly");
      amountInput.focus();
    });
  
    amountInput.addEventListener("blur", () => {
      amountInput.setAttribute("readonly", true);
    });
  }
  
  // Funktion zum Aktualisieren der Suchergebnisse
  function updateSearchResults(query) {
    searchResults.innerHTML = ""; // Alte Ergebnisse löschen
  
    if (query === "") return; // Keine Suche bei leerem Input
  
    // Datenbank simulieren: Suchergebnisse aus allen möglichen Items
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    // Gefundene Ergebnisse anzeigen
    filteredItems.forEach((item) => {
      const result = document.createElement("div");
      result.classList.add("result");
      result.innerHTML = `
        <div class="left">
          <span>${item.icon}</span>
          <span class="name">${capitalizeFirstLetter(item.name)}</span>
        </div>
        <div class="right">
          <input type="checkbox" id="checkbox">
          <label class="checkmark" for="checkbox"></label>
        </div>
      `;
      result.addEventListener("click", () =>
        addItemToList(capitalizeFirstLetter(item.name), item.icon)
      );
      searchResults.appendChild(result);
    });

    if (filteredItems.includes(query.name) == false) {
      // Keine exakte Übereinstimmung: Geist-Item anzeigen
      const ghostResult = document.createElement("div");
      ghostResult.classList.add("result");
      ghostResult.innerHTML = `
        <div class="left">
          <span>ㅤ</span>
          <span class="name">${capitalizeFirstLetter(query)}</span>
        </div>
        <div class="right">
        </div>
      `;
      ghostResult.addEventListener("click", () =>
        addItemToList(capitalizeFirstLetter(query), "ㅤ")
      );
      searchResults.appendChild(ghostResult);
    }
    
  }

  // Drag-and-Drop-Funktionalität
  function activateDragAndDrop(item) {
    const placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");

  
    // Mobile: Touch-based Drag-and-Drop
    item.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      item.classList.add("dragging");
      item.dataset.startX = touch.clientX;
      item.dataset.startY = touch.clientY;
      //list.insertBefore(placeholder, item.nextSibling);
    });
  
    item.addEventListener("touchmove", (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      const currentY = touch.clientY;
      const draggingItem = document.querySelector(".dragging");
  
      draggingItem.style.position = "absolute";
      draggingItem.style.top = `${touch.clientY - draggingItem.offsetHeight / 2}px`;
      draggingItem.style.left = `${touch.clientX - draggingItem.offsetWidth / 2}px`;
  
      const afterElement = getDragAfterElement(list, currentY);
      if (afterElement == null) {
        list.appendChild(placeholder);
      } else {
        list.insertBefore(placeholder, afterElement);
      }
    });
  
    item.addEventListener("touchend", () => {
      const draggingItem = document.querySelector(".dragging");
      list.insertBefore(draggingItem, placeholder);
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
  
  // Helferfunktion zum Großschreiben der ersten Buchstaben
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  
  // Event-Listener für die Suchleiste
  searchBar.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    updateSearchResults(query);
  });

  searchBar.addEventListener("keypress", (event) => {
    const query = event.target.value.trim();
    if (event.key === "Enter" && query.length > 0) {
      addItemToList(capitalizeFirstLetter(query), "ㅤ");
    }
  });
  
  // Vorhandene Items in der Einkaufsliste anzeigen
  items.forEach((item) => addItemToList(item.name, item.icon));
  