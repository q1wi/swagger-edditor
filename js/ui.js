// js/ui.js

function updateUIElements() {
    el('apiTitle').value = swaggerDoc.info?.title || '';
    el('apiVersion').value = swaggerDoc.info?.version || '';
    el('apiDescription').value = swaggerDoc.info?.description || '';
    el('apiBasePath').value = swaggerDoc.basePath || '';
    el('apiHost').value = swaggerDoc.host || '';
    const searchTerm = el('searchInput')?.value || '';
    updateEndpointsList(searchTerm);
    updateModelsList(searchTerm);
    updateSecurityDefinitionsList(searchTerm);
}

function filterLists() {
    const searchInput = el('searchInput');
    const searchTerm = searchInput.value;
    const clearBtn = el('clearSearchBtn');

    updateEndpointsList(searchTerm);
    updateModelsList(searchTerm);
    updateSecurityDefinitionsList(searchTerm);

    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'inline' : 'none';
    }
}

function clearSearchInput() {
    const searchInput = el('searchInput');
    searchInput.value = '';
    filterLists();
    searchInput.focus();
}

function updateEndpointsList(searchTerm = '') {
    const container = el('endpointsList');
    container.innerHTML = '';
    for (const [path, methods] of Object.entries(swaggerDoc.paths || {})) {
        for (const [method, details] of Object.entries(methods)) {
            if (typeof details === 'object' && details !== null) {
                const endpointText = `${method.toUpperCase()} ${path}`;
                if (!fuzzyMatch(searchTerm, endpointText)) continue;
                const item = create('div', { className: 'endpoint-item' });
                item.innerHTML = `
                    <div>
                        <span class="method-badge method-${method}">${method.toUpperCase()}</span>
                        <span>${path}</span>
                    </div>`;
                item.onclick = () => selectEndpoint(path, method);
                container.appendChild(item);
            }
        }
    }
}

function updateModelsList(searchTerm = '') {
    const container = el('modelsList');
    container.innerHTML = '';
    for (const modelName of Object.keys(swaggerDoc.definitions || {})) {
        if (!fuzzyMatch(searchTerm, modelName)) continue;
        const item = create('div', { className: 'model-item' });
        item.innerHTML = `<span>${modelName}</span>`;
        item.onclick = () => selectModel(modelName);
        container.appendChild(item);
    }
}

function updateSecurityDefinitionsList(searchTerm = '') {
    const container = el('securityDefinitionsList');
    container.innerHTML = '';
    for (const defName of Object.keys(swaggerDoc.securityDefinitions || {})) {
        if (!fuzzyMatch(searchTerm, defName)) continue;
        const item = create('div', { className: 'security-definition-list-item' });
        item.innerHTML = `<span>${defName}</span>`;
        item.onclick = () => selectSecurityDefinition(defName);
        container.appendChild(item);
    }
}

function selectInfoTab() {
    const state = { type: 'info' };
    pushStateToHistory(state, "General Info", "info");
    _switchToInfoTabUI();
}

function _switchToInfoTabUI() {
    _switchTabUI('info');
    const editor = q('#infoTab .info-form');
    if(editor) editor.style.display = 'block';
}

function selectEndpointTab() {
    if (currentEndpoint) {
        const state = { type: 'endpoint', path: currentEndpoint.path, method: currentEndpoint.method };
        const hash = `endpoint/${encodeURIComponent(currentEndpoint.path)}/${currentEndpoint.method}`;
        pushStateToHistory(state, `Endpoint: ${currentEndpoint.method.toUpperCase()} ${currentEndpoint.path}`, hash);
        _selectEndpointUI(currentEndpoint.path, currentEndpoint.method);
    } else {
        _switchTabUI('endpoint');
        el('endpointEditor').innerHTML = `<div id="endpointEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Select an endpoint or add a new one</p></div>`;
    }
}

function selectModelTab() {
    if (currentModel) {
        const state = { type: 'model', name: currentModel };
        const hash = `model/${encodeURIComponent(currentModel)}`;
        pushStateToHistory(state, `Model: ${currentModel}`, hash);
        _selectModelUI(currentModel);
    } else {
        _switchTabUI('model');
        el('modelEditor').innerHTML = `<div id="modelEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Select a model or add a new one</p></div>`;
    }
}

function selectSecurityDefinitionTab() {
    if (currentSecurityDefinitionName) {
        const state = { type: 'securityDefinition', name: currentSecurityDefinitionName };
        const hash = `securityDefinition/${encodeURIComponent(currentSecurityDefinitionName)}`;
        pushStateToHistory(state, `Security Definition: ${currentSecurityDefinitionName}`, hash);
        _selectSecurityDefinitionUI(currentSecurityDefinitionName);
    } else {
        _switchTabUI('securityDefinition');
        el('securityDefinitionEditor').innerHTML = `<div id="securityDefinitionEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Select a security definition or add a new one</p></div>`;
    }
}

function _switchTabUI(tabName) {
    qa('.tab-content').forEach(t => t.classList.add('hidden'));
    qa('.tab').forEach(t => t.classList.remove('active'));
    const tabContent = el(tabName + 'Tab');
    if (tabContent) tabContent.classList.remove('hidden');
    let tabButton;
    if (tabName === 'info') tabButton = q('.tab[onclick*="selectInfoTab"]');
    else if (tabName === 'endpoint') tabButton = q('.tab[onclick*="selectEndpointTab"]');
    else if (tabName === 'model') tabButton = q('.tab[onclick*="selectModelTab"]');
    else if (tabName === 'securityDefinition') tabButton = q('.tab[onclick*="selectSecurityDefinitionTab"]');
    if (tabButton) tabButton.classList.add('active');
}

function selectEndpoint(path, method) {
    const state = { type: 'endpoint', path: path, method: method };
    const hash = `endpoint/${encodeURIComponent(path)}/${method}`;
    pushStateToHistory(state, `Endpoint: ${method.toUpperCase()} ${path}`, hash);
    _selectEndpointUI(path, method);
}

function _selectEndpointUI(path, method) {
    currentEndpoint = { path, method }; currentModel = null; currentSecurityDefinitionName = null;
    _switchTabUI('endpoint');
    qa('.endpoint-item, .model-item, .security-definition-list-item').forEach(item => item.classList.remove('active'));
    qa('.endpoint-item').forEach(item => {
        const methodBadge = q('.method-badge', item);
        const pathSpan = q('span:not(.method-badge)', item);
        if (methodBadge && pathSpan && methodBadge.textContent.trim() === method.toUpperCase() && pathSpan.textContent.trim() === path) {
            item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    displayEndpointEditor(path, method); // displayEndpointEditor in editors.js
}

function selectModel(modelName) {
    const state = { type: 'model', name: modelName };
    const hash = `model/${encodeURIComponent(modelName)}`;
    pushStateToHistory(state, `Model: ${modelName}`, hash);
    _selectModelUI(modelName);
}

function _selectModelUI(modelName) {
    currentModel = modelName; currentEndpoint = null; currentSecurityDefinitionName = null;
    _switchTabUI('model');
    qa('.endpoint-item, .model-item, .security-definition-list-item').forEach(item => item.classList.remove('active'));
    qa('.model-item').forEach(item => { const span = q('span', item); if (span && span.textContent.trim() === modelName) { item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }});
    displayModelEditor(modelName); // displayModelEditor in editors.js
}

function selectSecurityDefinition(defName) {
    const state = { type: 'securityDefinition', name: defName };
    const hash = `securityDefinition/${encodeURIComponent(defName)}`;
    pushStateToHistory(state, `Security Definition: ${defName}`, hash);
    _selectSecurityDefinitionUI(defName);
}

function _selectSecurityDefinitionUI(defName) {
    currentSecurityDefinitionName = defName; currentEndpoint = null; currentModel = null;
    _switchTabUI('securityDefinition');
    qa('.endpoint-item, .model-item, .security-definition-list-item').forEach(item => item.classList.remove('active'));
    qa('.security-definition-list-item').forEach(item => { const span = q('span', item); if (span && span.textContent.trim() === defName) { item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }});
    displaySecurityDefinitionEditor(defName); // displaySecurityDefinitionEditor in editors.js
}

function toggleDetailsDisplay(headerElement) {
    const item = headerElement.closest('.parameter-item, .response-item, .property-item, .header-item, .security-scheme-item');
    if (!item) return;
    const details = q('.details', item);
    if (!details) return;
    item.classList.toggle('expanded');
    details.style.display = item.classList.contains('expanded') ? 'block' : 'none';
    const icon = q('.toggle-icon', headerElement);
    if (icon) {
        icon.textContent = item.classList.contains('expanded') ? '▼' : '▶';
    }
}

function getFormatOptions(type, selectedValue = '') {
    let optionsHtml = `<option value="" ${selectedValue === '' ? 'selected' : ''}>-- none --</option>`;
    optionsHtml += (commonFormats[type] || [])
            .map(f => `<option value="${f}" ${selectedValue === f ? 'selected' : ''}>${f}</option>`)
            .join('');
    return optionsHtml;
}

function getModelOptions(selectedValue = '') { // selectedValue is just the model name
    let optionsHtml = `<option value="">-- Select Model --</option>`;
    optionsHtml += Object.keys(swaggerDoc.definitions || {}).map(defName =>
        `<option value="#/definitions/${defName}" ${selectedValue === defName ? 'selected' : ''}>${defName}</option>`
    ).join('');
    return optionsHtml;
}

function getTypeOptions(selectedValue = 'string', includeSchema = false) {
    let options = commonTypes.map(t => `<option value="${t}" ${selectedValue === t ? 'selected' : ''}>${t}</option>`).join('');
    if (includeSchema) {
        const isRefSelected = typeof selectedValue === 'string' && selectedValue.startsWith('#/definitions/');
        options += `<option value="schema" ${isRefSelected || selectedValue === 'schema' ? 'selected' : ''}>Model/Schema ($ref)</option>`;
    }
    return options;
}

function handleModelRefChange(selectElement) {
    const selectId = selectElement.id;
    let buttonId;
    if (selectId.startsWith('paramSchema')) { buttonId = `goToModelBtnParam${selectId.substring('paramSchema'.length)}`; }
    else if (selectId.match(/^param\d+ItemsModelSelect$/)) { const paramIndex = selectId.match(/^param(\d+)ItemsModelSelect$/)[1]; buttonId = `goToModelBtnParam${paramIndex}Items`; }
    else if (selectId.startsWith('responseSchema')) { buttonId = `goToModelBtnResponse${selectId.substring('responseSchema'.length)}`; }
    else if (selectId.startsWith('propModelSelect_')) { buttonId = `goToModelBtnProp_${selectId.substring('propModelSelect_'.length)}`; }
    else if (selectId.startsWith('propItemsModelSelect_')) { buttonId = `goToModelBtnPropItems_${selectId.substring('propItemsModelSelect_'.length)}`; }
    const goToBtn = buttonId ? el(buttonId) : null;
    if (goToBtn) { goToBtn.style.display = selectElement.value ? 'inline-block' : 'none'; }
}

function goToModel(selectId) {
    const modelRef = el(selectId).value;
    if (modelRef && modelRef.startsWith('#/definitions/')) {
        const modelName = modelRef.substring('#/definitions/'.length);
        if (modelName && swaggerDoc.definitions[modelName]) {
            const searchInput = el('searchInput');
            if (searchInput) { searchInput.value = ''; filterLists(); }
            selectModel(modelName);
            setTimeout(() => { const mainContentPanel = el('mainContentPanel'); if (mainContentPanel) mainContentPanel.scrollTop = 0; }, 50);
        }
    }
}
