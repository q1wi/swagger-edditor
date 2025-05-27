// js/main.js

function resetAndLoadSwaggerDoc(newDoc) {
    swaggerDoc = newDoc;
    if (!swaggerDoc.swagger) swaggerDoc.swagger = '2.0';
    if (!swaggerDoc.info) swaggerDoc.info = { title: 'New API', version: '1.0.0', description: '' };
    if (!swaggerDoc.paths) swaggerDoc.paths = {};
    if (!swaggerDoc.definitions) swaggerDoc.definitions = {};
    if (!swaggerDoc.schemes) swaggerDoc.schemes = ['https', 'http'];
    if (!swaggerDoc.securityDefinitions) swaggerDoc.securityDefinitions = {};
    if (!swaggerDoc.host) swaggerDoc.host = "";
    if (!swaggerDoc.basePath) swaggerDoc.basePath = "/";

    currentEndpoint = null; currentModel = null; currentSecurityDefinitionName = null;
    const searchInput = el('searchInput'); if (searchInput) searchInput.value = '';
    updateUIElements();

    isRestoringStateFromPop = true;
    navigationHistory = []; currentHistoryIndex = -1;
    const initialState = { type: 'info' };
    replaceStateInHistory(initialState, "General Info", 'info');
    _restoreUIFromState(initialState);
    isRestoringStateFromPop = false;
    updateBackButtonState();
}

function _restoreUIFromState(state) {
    if (!state || !state.type) { state = { type: 'info' }; }
    if (state.type === 'info') _switchToInfoTabUI();
    else if (state.type === 'endpoint' && state.path && state.method) _selectEndpointUI(state.path, state.method);
    else if (state.type === 'model' && state.name) _selectModelUI(state.name);
    else if (state.type === 'securityDefinition' && state.name) _selectSecurityDefinitionUI(state.name);
    else _switchToInfoTabUI();
}

function initializeAppNavigation() {
    isRestoringStateFromPop = true;
    let initialState = null, initialHash = window.location.hash.substring(1), initialTitle = "Swagger 2.0 Editor";
    if (history.state && Object.keys(history.state).length > 0) {
        initialState = history.state; navigationHistory = [initialState]; currentHistoryIndex = 0;
        let currentHashSegment = 'info';
        if (initialState.type === 'endpoint') currentHashSegment = `endpoint/${encodeURIComponent(initialState.path)}/${initialState.method}`;
        else if (initialState.type === 'model') currentHashSegment = `model/${encodeURIComponent(initialState.name)}`;
        else if (initialState.type === 'securityDefinition') currentHashSegment = `securityDefinition/${encodeURIComponent(initialState.name)}`;
        const expectedHash = `#${currentHashSegment}`;
        if (window.location.hash !== expectedHash) history.replaceState(initialState, initialTitle, expectedHash);
    } else if (initialHash) {
        initialState = parseHashToState(initialHash);
        if (initialState) replaceStateInHistory(initialState, initialTitle, initialHash);
        else { initialState = { type: 'info' }; initialHash = 'info'; replaceStateInHistory(initialState, "General Info", initialHash); }
    } else {
        initialState = { type: 'info' }; initialHash = 'info'; replaceStateInHistory(initialState, "General Info", initialHash);
    }
    _restoreUIFromState(initialState);
    isRestoringStateFromPop = false;
    updateBackButtonState();
}

function setupResizer() {
    const resizeHandle = el('resizeHandle'), sidebar = el('sidebarPanel'); let isResizing = false;
    resizeHandle.addEventListener('mousedown', () => { isResizing = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; });
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        let newW = Math.max(200, Math.min(e.clientX, window.innerWidth * 0.7));
        sidebar.style.width = newW + 'px';
    });
    document.addEventListener('mouseup', () => { if(isResizing){ isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; }});
}

window.onclick = (event) => { if (event.target === el('previewModal')) closePreview(); };

function initializeApp() {
    updateUIElements();
    initializeAppNavigation();
    setupResizer();
    setupFileInputListener();
    const clearBtn = el('clearSearchBtn'); if (clearBtn) clearBtn.onclick = clearSearchInput;
    filterLists();
}

document.addEventListener('DOMContentLoaded', initializeApp);
