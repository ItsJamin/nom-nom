// Handles all the database functions
// Later SQLite, for dev just js objects

// Table for Items
// name => id of the item
// category => foreign key of the category
// unit => foreign key of the unit metric (if null item is measured in number of pieces)
var tItems = [
    { name: "kartoffeln", category: 0, unit: 1 },
    { name: "paprika", category: 0, unit: 2 },
    { name: "milch", category: 1, unit: 0 },
    { name: "klopapier", category: 2, unit: 2 },
    { name: "zucker", category: 3, unit: 1 },
    { name: "mehl", category: 3, unit: 1 },
    { name: "shampoo", category: 2, unit: 0 },
    { name: "butter", category: 1, unit: 1 },
    { name: "äpfel", category: 0, unit: 2 },
    { name: "karotten", category: 0, unit: 1 },
    { name: "nudeln", category: 3, unit: 1 },
    { name: "seife", category: 2, unit: 2 },
    { name: "käse", category: 1, unit: 1 },
    { name: "tiefkühlpizza", category: 4, unit: 2 },
    { name: "pommes frites", category: 4, unit: 1 },
    { name: "tk-spinat", category: 4, unit: 1 },
    { name: "eiscreme", category: 4, unit: 0 },
];

// In the future, icon will be replaced by an img-icon
var tCategories = [
    { id: 0, name: "Gemüse & Obst", icon: "🥕" },
    { id: 1, name: "Milchprodukte", icon: "🥛" },
    { id: 2, name: "Hygieneartikel", icon: "🧻" },
    { id: 3, name: "Grundnahrungsmittel", icon: "🍞" },
    { id: 4, name: "Tiefkühlprodukte", icon: "🧊" },
];


var tUnits = [
    { id: 0, units: ["ml", "l"], factor: [1, 1000] },
    { id: 1, units: ["g", "kg"], factor: [1, 1000] },
    { id: 2, units: ["stk"], factor: [1] },
];

export function getObjectsForQuery(query, starting) {
    // Normalize the query string for case-insensitive comparison
    query = query.toLowerCase();

    // Filter the items based on substring match
    if (starting) {
        var results = tItems.filter(item => 
            item.name.toLowerCase().startsWith(query) || query.startsWith(item.name.toLowerCase()));
    } else { 
        var results = tItems.filter(item => 
            item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()));
    }
    
    results = results.map(item => {
        return createElementInfo(item);
    });

    return results;
}

export function createItem(name) {
    var item = {
        name: name,
        category: null,
        unit: 2
    }
    tItems.push(item);

    return createElementInfo(item);
}

export function getOrCreateItemByName(name) {
    var item = Array.from(tItems).find(entry => {
        return name === entry?.name;
    });

    return (item !== undefined ? createElementInfo(item) : createItem(name));
}

export function deleteItem(name) {
    tItems = tItems.filter(item => item.name !== name);
}

function createElementInfo(item) {
    const categoryItem = tCategories.find(category => category.id === item.category)?.icon || "ㅤ";
    const unitInfo = tUnits.find(unit => unit.id === item.unit)[0];

    return {
        name: item.name,
        categoryItem: categoryItem,
        unitUnit: unitInfo
    };
}