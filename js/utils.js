// js/utils.js
const el = (id) => document.getElementById(id);
const q = (selector, parent = document) => parent.querySelector(selector);
const qa = (selector, parent = document) => parent.querySelectorAll(selector);
const create = (tag, props = {}) => Object.assign(document.createElement(tag), props);

function arrayFromString(str) { return str.split(',').map(s => s.trim()).filter(s => s); }
function stringFromArray(arr) { return (arr || []).join(', '); }

function fuzzyMatch(searchTerm, text) {
    if (!searchTerm) return true;
    // Case-sensitive "fuzzy" match (characters in order)
    let searchTermIndex = 0;
    let textIndex = 0;
    while (textIndex < text.length && searchTermIndex < searchTerm.length) {
        if (text[textIndex] === searchTerm[searchTermIndex]) {
            searchTermIndex++;
        }
        textIndex++;
    }
    return searchTermIndex === searchTerm.length;
}
