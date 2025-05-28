// js/history.js
function pushStateToHistory(state, title, hash) {
    if (isRestoringStateFromPop || isBatchProcessing) return; // Modified to check isBatchProcessing
    if (currentHistoryIndex < navigationHistory.length - 1) {
        navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    }
    navigationHistory.push(state);
    currentHistoryIndex++;
    try {
        history.pushState(state, title, `#${hash}`);
    } catch (e) {
        console.warn("Error pushing state:", e);
    }
    updateBackButtonState();
}

function replaceStateInHistory(state, title, hash) {
    // No change needed for isBatchProcessing here, as replace is fine.
    if (navigationHistory.length === 0 || currentHistoryIndex === -1) {
        navigationHistory = [state];
        currentHistoryIndex = 0;
    } else {
        navigationHistory[currentHistoryIndex] = state;
    }
    try {
        history.replaceState(state, title, `#${hash}`);
    } catch (e) {
        console.warn("Error replacing state:", e);
    }
    updateBackButtonState();
}

function goBackInApp() {
    if (currentHistoryIndex > 0) {
        history.back(); // This will trigger onpopstate
    }
}

function updateBackButtonState() {
    const backButton = el('appBackButton');
    if (backButton) {
        backButton.disabled = currentHistoryIndex <= 0;
    }
}

function parseHashToState(hash) {
    if (!hash) return null;
    const parts = hash.split('/');
    if (parts[0] === 'endpoint' && parts.length === 3) { return { type: 'endpoint', path: decodeURIComponent(parts[1]), method: parts[2] }; }
    else if (parts[0] === 'model' && parts.length === 2) { return { type: 'model', name: decodeURIComponent(parts[1]) }; }
    else if (parts[0] === 'securityDefinition' && parts.length === 2) { return { type: 'securityDefinition', name: decodeURIComponent(parts[1]) }; }
    else if (parts[0] === 'info') { return { type: 'info' }; }
    return null;
}

window.onpopstate = function(event) {
    isRestoringStateFromPop = true;
    const stateToRestore = event.state || parseHashToState(window.location.hash.substring(1)) || { type: 'info' };
    let foundIndex = -1;
    for (let i = 0; i < navigationHistory.length; i++) {
        if (JSON.stringify(navigationHistory[i]) === JSON.stringify(stateToRestore)) {
            foundIndex = i;
            break;
        }
    }
    if (foundIndex !== -1) {
        currentHistoryIndex = foundIndex;
    } else {
        // If state is not in our history (e.g. browser back beyond session start, or manual hash change)
        // Add it to the history and make it current.
        navigationHistory.splice(currentHistoryIndex + 1, 0, stateToRestore);
        currentHistoryIndex++;
    }
    _restoreUIFromState(stateToRestore); // _restoreUIFromState is in main.js
    isRestoringStateFromPop = false;
    updateBackButtonState();
};