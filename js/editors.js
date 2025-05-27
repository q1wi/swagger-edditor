// js/editors.js

// --- Endpoint Editor ---
function displayEndpointEditor(path, method) {
    const endpoint = swaggerDoc.paths[path]?.[method];
    const container = el('endpointEditor');
    if (!endpoint) {
        container.innerHTML = '<div id="endpointEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Endpoint not found: ' + path + ' ' + method + '.</p></div>';
        return;
    }
    container.innerHTML =
        '<div id="endpointEditorContent">' +
        '    <div class="editor-header">' +
        '        <h2 id="editorPathTitle">Editing Endpoint: ' + method.toUpperCase() + ' ' + path + '</h2>' +
        '        <div class="editor-actions">' +
        '            <button class="btn btn-info btn-sm clone-btn-editor" onclick="cloneCurrentEndpoint()" title="Clone Endpoint">❐ Clone</button>' +
        '            <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentEndpoint()" title="Delete Endpoint">🗑️ Delete</button>' +
        '            <button class="btn btn-success btn-sm" onclick="saveEndpoint()" title="Save Endpoint">💾 Save</button>' +
        '        </div>' +
        '    </div>' +
        '    <div class="form-group"><label>Path</label><input type="text" class="form-control" id="endpointPathInput" value="' + path + '"></div>' +
        '    <div class="form-group">' +
        '        <label>Method</label>' +
        '        <select class="form-select" id="endpointMethodInput">' +
                    httpMethods.map(m => '<option value="' + m + '" ' + (method === m ? 'selected' : '') + '>' + m.toUpperCase() + '</option>').join('') +
        '        </select>' +
        '    </div>' +
        '    <hr>' +
        '    <div class="form-group"><label>Summary</label><input type="text" class="form-control" id="endpointSummary" value="' + (endpoint.summary || '') + '"></div>' +
        '    <div class="form-group"><label>Description</label><textarea class="form-control" id="endpointDescription">' + (endpoint.description || '') + '</textarea></div>' +
        '    <div class="form-group"><label>Operation ID</label><input type="text" class="form-control" id="endpointOperationId" value="' + (endpoint.operationId || '') + '"></div>' +
        '    <div class="form-group"><label>Tags (comma-separated)</label><input type="text" class="form-control" id="endpointTags" value="' + stringFromArray(endpoint.tags) + '"></div>' +
        '    <div class="form-group"><label>Consumes (comma-separated MimeTypes)</label><input type="text" class="form-control" id="endpointConsumes" value="' + stringFromArray(endpoint.consumes) + '"></div>' +
        '    <div class="form-group"><label>Produces (comma-separated MimeTypes)</label><input type="text" class="form-control" id="endpointProduces" value="' + stringFromArray(endpoint.produces) + '"></div>' +
        '    <h3>Parameters</h3>' +
        '    <div class="parameters-container"><div id="parametersList"></div><button class="btn btn-primary btn-sm" onclick="addParameterToEndpoint()">+ Add Parameter</button></div>' +
        '    <h3>Responses</h3>' +
        '    <div class="responses-container"><div id="responsesList"></div><button class="btn btn-primary btn-sm" onclick="addResponseToEndpoint()">+ Add Response</button></div>' +
        '    <h3>Security</h3>' +
        '    <div class="security-definition-container"><div id="securityList"></div><button class="btn btn-primary btn-sm" onclick="addSecurityRequirementToEndpoint()">+ Add Security Requirement</button></div>' +
        '</div>';
    displayParametersForEndpoint(endpoint.parameters || []);
    displayResponsesForEndpoint(endpoint.responses || {});
    displaySecurityForEndpoint(endpoint.security || []);
    setTimeout(() => {
        qa('#endpointEditorContent [id^="paramSchema"], #endpointEditorContent [id^="paramItemsModelSelect"], #endpointEditorContent [id^="responseSchema"]').forEach(select => {
            select.addEventListener('change', function() { handleModelRefChange(this); });
            if (select.value && select.value !== '') handleModelRefChange(select);
        });
    }, 0);
}

// --- Model Editor ---
function displayModelEditor(modelName) {
    const model = swaggerDoc.definitions[modelName];
    const container = el('modelEditor');
    if (!model) {
        container.innerHTML = '<div id="modelEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Model not found: ' + modelName + '.</p></div>';
        return;
    }
    container.innerHTML =
        '<div id="modelEditorContent">' +
        '    <div class="editor-header">' +
        '        <h2>Editing Model: ' + modelName + '</h2>' +
        '        <div class="editor-actions">' +
        '             <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentModel()" title="Delete Model">🗑️ Delete</button>' +
        '             <button class="btn btn-success btn-sm" onclick="saveModel()" title="Save Model">💾 Save</button>' +
        '        </div>' +
        '    </div>' +
        '    <div class="form-group">' +
        '        <label>Model Name (ID)</label>' +
        '        <input type="text" class="form-control" id="modelNameInput" value="' + modelName + '">' +
        '    </div>' +
        '    <div class="form-group">' +
        '        <label>Type</label>' +
        '        <select class="form-select" id="modelType" disabled>' +
        '            <option value="object" ' + (model.type === 'object' ? 'selected' : '') + '>object</option>' +
        '        </select>' +
        '    </div>' +
        '    <div class="form-group">' +
        '        <label>Description</label>' +
        '        <textarea class="form-control" id="modelDescription">' + (model.description || '') + '</textarea>' +
        '    </div>' +
        '    <h3>Properties</h3>' +
        '    <div id="modelPropertiesContainer" class="parameters-container">' +
        '        <div id="propertiesList"></div>' +
        '        <button class="btn btn-primary btn-sm" onclick="addPropertyToModel()">+ Add Property</button>' +
        '    </div>' +
        '</div>';
    displayPropertiesForModel(model.properties || {}, model.required || []);
    setTimeout(() => {
        qa('#modelEditorContent [id^="propModelSelect_"], #modelEditorContent [id^="propItemsModelSelect_"]').forEach(select => {
            select.addEventListener('change', function() { handleModelRefChange(this); });
            if (select.value && select.value !== '') handleModelRefChange(select);
        });
    }, 0);
}

// --- Security Definition Editor ---
function displaySecurityDefinitionEditor(defName) {
    const secDef = swaggerDoc.securityDefinitions[defName];
    const container = el('securityDefinitionEditor');
    if (!secDef) {
        container.innerHTML = '<div id="securityDefinitionEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Security Definition not found: ' + defName + '.</p></div>';
        return;
    }
    let content =
        '<div id="securityDefinitionEditorContent">' +
        '    <div class="editor-header">' +
        '        <h2>Editing Security Definition: ' + defName + '</h2>' +
        '        <div class="editor-actions">' +
        '            <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentSecurityDefinition()" title="Delete Security Definition">🗑️ Delete</button>' +
        '            <button class="btn btn-success btn-sm" onclick="saveSecurityDefinition()" title="Save Security Definition">💾 Save</button>' +
        '        </div>' +
        '    </div>' +
        '    <div class="form-group">' +
        '        <label>Definition Name (ID)</label>' +
        '        <input type="text" class="form-control" id="securityDefNameInput" value="' + defName + '">' +
        '    </div>' +
        '    <div class="form-group">' +
        '        <label>Type</label>' +
        '        <select class="form-select" id="securityDefType" onchange="handleSecurityDefinitionTypeChange(this)">' +
                    securityDefinitionTypes.map(t => '<option value="' + t + '" ' + (secDef.type === t ? 'selected' : '') + '>' + t + '</option>').join('') +
        '        </select>' +
        '    </div>' +
        '    <div class="form-group"><label>Description</label><textarea class="form-control" id="securityDefDescription">' + (secDef.description || '') + '</textarea></div>' +
        '    <div id="securityDefTypeSpecificFields"></div>' +
        '</div>';
    container.innerHTML = content;
    renderSecurityDefinitionTypeSpecificFields(secDef); // New helper
    if (secDef.type === 'oauth2') {
        displayScopesForDefinition(secDef.scopes || {});
    }
}

function renderSecurityDefinitionTypeSpecificFields(secDef) {
    const container = el('securityDefTypeSpecificFields');
    if (!container) return;
    container.innerHTML = ''; // Clear previous fields
    let fieldsHtml = '';
    if (secDef.type === 'apiKey') {
        fieldsHtml =
            '<div class="form-group">' +
            '    <label>Parameter Name (name)</label>' +
            '    <input type="text" class="form-control" id="apiKeyName" value="' + (secDef.name || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '    <label>In</label>' +
            '    <select class="form-select" id="apiKeyIn">' +
                    apiKeyInOptions.map(i => '<option value="' + i + '" ' + (secDef.in === i ? 'selected' : '') + '>' + i + '</option>').join('') +
            '    </select>' +
            '</div>';
    } else if (secDef.type === 'oauth2') {
        fieldsHtml =
            '<div class="form-group">' +
            '    <label>Flow</label>' +
            '    <select class="form-select" id="oauth2Flow" onchange="handleOAuth2FlowChange(this)">' +
                    oauth2Flows.map(f => '<option value="' + f + '" ' + (secDef.flow === f ? 'selected' : '') + '>' + f + '</option>').join('') +
            '    </select>' +
            '</div>' +
            '<div id="oauth2SpecificFieldsContainer"></div>' +
            '<h3>Scopes</h3>' +
            '<div class="scopes-container">' +
            '    <div id="scopesList"></div>' +
            '    <button class="btn btn-primary btn-sm" onclick="addScopeToDefinition()">+ Add Scope</button>' +
            '</div>';
    }
    container.innerHTML = fieldsHtml;
    if (secDef.type === 'oauth2') {
        renderOAuth2FlowSpecificFields(secDef.flow, secDef); // New helper
    }
}

function renderOAuth2FlowSpecificFields(flow, secDef = {}) {
    const container = el('oauth2SpecificFieldsContainer');
    if (!container) return;
    container.innerHTML = '';
    let fieldsHtml = '';
    if (['implicit', 'accessCode'].includes(flow)) {
        fieldsHtml += '<div class="form-group"><label>Authorization URL</label><input type="text" class="form-control" id="oauth2AuthUrl" value="' + (secDef.authorizationUrl || '') + '"></div>';
    }
    if (['password', 'application', 'accessCode'].includes(flow)) {
        fieldsHtml += '<div class="form-group"><label>Token URL</label><input type="text" class="form-control" id="oauth2TokenUrl" value="' + (secDef.tokenUrl || '') + '"></div>';
    }
    container.innerHTML = fieldsHtml;
}


// --- Event Handlers for Dynamic UI (Type/ModelRef Changes in Editors) ---
function handleTypeChange(selectElement) {
    const elementId = selectElement.id;
    let identifier, baseIdForControls;
    let isParameterContext = false, isPropertyContext = false, isItemsContext = false;

    if (elementId.startsWith('paramType')) { isParameterContext = true; identifier = elementId.substring('paramType'.length); baseIdForControls = 'param' + identifier; }
    else if (elementId.match(/^param\\d+ItemsType$/)) { isParameterContext = true; isItemsContext = true; identifier = elementId.match(/^param(\\d+)ItemsType$/)[1]; baseIdForControls = 'param' + identifier + 'Items'; }
    else if (elementId.startsWith('propType_')) { isPropertyContext = true; identifier = elementId.substring('propType_'.length); baseIdForControls = 'prop_' + identifier; }
    else if (elementId.startsWith('propItemsType_')) { isPropertyContext = true; isItemsContext = true; identifier = elementId.substring('propItemsType_'.length); baseIdForControls = 'propItems_' + identifier; }
    else { return; }

    const selectedType = selectElement.value;
    const showHide = (id, condition) => { const elem = el(id); if (elem) elem.style.display = condition ? 'block' : 'none'; };

    if (isParameterContext) {
        const paramInVal = el('paramIn' + identifier)?.value;
        const isBodyParam = paramInVal === 'body';
        if (!isItemsContext) {
            showHide(baseIdForControls + 'SchemaGroup', selectedType === 'schema' || isBodyParam);
            showHide(baseIdForControls + 'FormatGroup', !isBodyParam && ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide(baseIdForControls + 'EnumGroup', !isBodyParam && selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'ItemsConfig', !isBodyParam && selectedType === 'array' && selectedType !== 'schema');
            showHide(baseIdForControls + 'StringValidationsGroup', !isBodyParam && selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'NumberValidationsGroup', !isBodyParam && ['number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide(baseIdForControls + 'DefaultGroup', !isBodyParam);
            showHide(baseIdForControls + 'ExampleGroup', !isBodyParam);
            const formatSelect = el(baseIdForControls + 'Format');
            if (formatSelect && !isBodyParam && selectedType !== 'schema') formatSelect.innerHTML = getFormatOptions(selectedType);
            if (selectedType === 'array' && !isBodyParam && selectedType !== 'schema') { 
                const itemsTypeSelect = el(baseIdForControls + 'ItemsType'); 
                if (itemsTypeSelect) handleTypeChange(itemsTypeSelect); 
            }
        } else { // isItemsContext
            showHide(baseIdForControls + 'ModelGroup', selectedType === 'schema');
            showHide(baseIdForControls + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            const itemsFormatSelect = el(baseIdForControls + 'Format');
            if (itemsFormatSelect && selectedType !== 'schema') itemsFormatSelect.innerHTML = getFormatOptions(selectedType);
        }
    } else if (isPropertyContext) {
        if (!isItemsContext) {
            showHide('prop_' + identifier + 'ModelGroup', selectedType === 'schema');
            showHide('prop_' + identifier + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide('propEnumGroup_' + identifier, selectedType === 'string' && selectedType !== 'schema');
            showHide('propItemsConfig_' + identifier, selectedType === 'array' && selectedType !== 'schema');
            showHide('prop_' + identifier + 'StringValidationsGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide('prop_' + identifier + 'NumberValidationsGroup', ['number', 'integer'].includes(selectedType) && selectedType !== 'schema'); // Added this line
            const formatSelect = el('prop_' + identifier + 'Format');
            if (formatSelect && selectedType !== 'schema') formatSelect.innerHTML = getFormatOptions(selectedType);
            if (selectedType === 'array' && selectedType !== 'schema') { 
                const itemsTypeSelect = el('propItemsType_' + identifier); 
                if (itemsTypeSelect) handleTypeChange(itemsTypeSelect); 
            }
        } else { // isItemsContext for property
            showHide(baseIdForControls + 'ModelGroup', selectedType === 'schema');
            showHide(baseIdForControls + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            const itemsFormatSelect = el(baseIdForControls + 'Format');
            if (itemsFormatSelect && selectedType !== 'schema') itemsFormatSelect.innerHTML = getFormatOptions(selectedType);
        }
    }
}

// --- Endpoint Parameters ---
function displayParametersForEndpoint(parameters) {
    const list = el('parametersList');
    list.innerHTML = '';
    parameters.forEach((param, index) => {
        const pDiv = create('div', { className: 'parameter-item', id: 'paramItem' + index });
        const paramTypeForOptions = param.schema ? 'schema' : (param.type || 'string');
        const paramInValue = param.in || 'query';
        const isBodyParam = paramInValue === 'body';
        let itemsTypeForOptions = param.items ? (param.items.schema ? 'schema' : (param.items.type || 'string')) : 'string';
        const modelRefName = param.schema?.$ref?.substring('#/definitions/'.length) || '';
        const itemsModelRefName = param.items?.$ref?.substring('#/definitions/'.length) || '';
        pDiv.innerHTML =
            '<div class="parameter-header" onclick="toggleDetailsDisplay(this)">' +
            '    <div><span class="toggle-icon">▶</span><strong>' + (param.name || 'Parameter ' + (index+1)) + ' (' + paramInValue + ')</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removeParameterFromEndpoint(' + index + ', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">' +
            '    <div class="form-group"><label>Name</label><input type="text" class="form-control" id="paramName' + index + '" value="' + (param.name || '') + '"></div>' +
            '    <div class="form-group"><label>In</label>' +
            '        <select class="form-select" id="paramIn' + index + '" onchange="handleTypeChange(el(\'paramType' + index + '\'))">' +
                        ['query', 'header', 'path', 'formData', 'body'].map(loc => '<option value="' + loc + '" ' + (paramInValue === loc ? 'selected' : '') + '>' + loc + '</option>').join('') +
            '        </select>' +
            '    </div>' +
            '    <div class="form-group"><label>Description</label><textarea class="form-control" id="paramDescription' + index + '">' + (param.description || '') + '</textarea></div>' +
            '    <div class="form-group"><label><input type="checkbox" id="paramRequired' + index + '" ' + (param.required ? 'checked' : '') + '> Required</label></div>' +
            '    <div class="form-group" id="param' + index + 'DefaultGroup"><label>Default Value</label><input type="text" class="form-control" id="paramDefault' + index + '" value="' + (param.default !== undefined ? String(param.default) : '') + '"></div>' +
            '    <div class="form-group" id="param' + index + 'ExampleGroup"><label>Example (x-example)</label><input type="text" class="form-control" id="paramExample' + index + '" value="' + (param['x-example'] !== undefined ? String(param['x-example']) : '') + '"></div>' +
            '    <div class="form-group"><label>Type</label><select class="form-select" id="paramType' + index + '" onchange="handleTypeChange(this)">' + getTypeOptions(isBodyParam ? 'schema' : paramTypeForOptions, true) + '</select></div>' +
            '    <div class="form-group" id="param' + index + 'FormatGroup"><label>Format</label><select class="form-select" id="param' + index + 'Format">' + getFormatOptions(param.type, param.format || '') + '</select></div>' +
            '    <div class="form-group" id="param' + index + 'SchemaGroup"><label>Schema (Model Ref)</label><div style="display:flex; gap:5px;"><select class="form-select" id="paramSchema' + index + '">' + getModelOptions(modelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnParam' + index + '" onclick="goToModel(\'paramSchema' + index + '\')" style="display:' + (modelRefName ? 'inline-block' : 'none') + '">➡️</button></div></div>' +
            '    <div class="form-group" id="param' + index + 'StringValidationsGroup"><label>Pattern (RegEx)</label><input type="text" class="form-control" id="paramPattern' + index + '" value="' + (param.pattern || '') + '"><label>Min Length</label><input type="number" class="form-control" id="paramMinLength' + index + '" value="' + (param.minLength !== undefined ? param.minLength : '') + '" placeholder="e.g., 0"><label>Max Length</label><input type="number" class="form-control" id="paramMaxLength' + index + '" value="' + (param.maxLength !== undefined ? param.maxLength : '') + '" placeholder="e.g., 100"></div>' +
            '    <div class="form-group" id="param' + index + 'NumberValidationsGroup"><label>Minimum</label><input type="number" class="form-control" id="paramMinimum' + index + '" value="' + (param.minimum !== undefined ? param.minimum : '') + '" step="any"><label><input type="checkbox" id="paramExclusiveMinimum' + index + '" ' + (param.exclusiveMinimum ? 'checked' : '') + '> Exclusive Minimum</label><label>Maximum</label><input type="number" class="form-control" id="paramMaximum' + index + '" value="' + (param.maximum !== undefined ? param.maximum : '') + '" step="any"><label><input type="checkbox" id="paramExclusiveMaximum' + index + '" ' + (param.exclusiveMaximum ? 'checked' : '') + '> Exclusive Maximum</label><label>Multiple Of</label><input type="number" class="form-control" id="paramMultipleOf' + index + '" value="' + (param.multipleOf !== undefined ? param.multipleOf : '') + '" step="any" min="0"></div>' +
            '    <div class="form-group" id="param' + index + 'EnumGroup"><label>Enum Values</label><div class="enum-container" id="param' + index + 'EnumContainer"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="param' + index + 'EnumInput" placeholder="Add enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'param' + index + '\')">+ Add</button></div></div>' +
            '    <div class="array-items-config" id="param' + index + 'ItemsConfig">' +
            '        <div class="sub-section-header">Array Item Configuration</div>' +
            '        <div class="form-group"><label>Item Type</label><select class="form-select" id="param' + index + 'ItemsType" onchange="handleTypeChange(this)">' + getTypeOptions(itemsTypeForOptions, true) + '</select></div>' +
            '        <div class="form-group" id="param' + index + 'ItemsFormatGroup"><label>Item Format</label><select class="form-select" id="param' + index + 'ItemsFormat">' + getFormatOptions(param.items?.type, param.items?.format || '') + '</select></div>' +
            '        <div class="form-group" id="param' + index + 'ItemsModelGroup"><label>Item Model/Schema Ref</label><div style="display:flex; gap:5px;"><select class="form-select" id="param' + index + 'ItemsModelSelect">' + getModelOptions(itemsModelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnParam' + index + 'Items' + '" onclick="goToModel(\'param' + index + 'ItemsModelSelect\')" style="display:' + (itemsModelRefName ? 'inline-block' : 'none') + '">➡️</button></div></div>' +
            '        <div class="form-group" id="param' + index + 'ItemsEnumGroup"><label>Item Enum Values</label><div class="enum-container" id="param' + index + 'ItemsEnumContainer"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="param' + index + 'ItemsEnumInput" placeholder="Add item enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'param' + index + 'Items\')">+ Add</button></div></div>' +
            '        <div class="form-group"><label>Collection Format</label><select class="form-select" id="param' + index + 'CollectionFormat">' + ['csv','ssv','tsv','pipes','multi'].map(cf => '<option value="' + cf + '" ' + (param.collectionFormat === cf ? 'selected':'') + '>' + cf + '</option>').join('') + '</select></div>' +
            '        <div class="form-group"><label><input type="checkbox" id="param' + index + 'ItemsUniqueItems" ' + (param.items?.uniqueItems ? 'checked' : '') + '> Unique Items</label></div>' +
            '    </div>' +
            '</div>';
        list.appendChild(pDiv);
        handleTypeChange(el('paramType' + index));
        if (el('paramType' + index).value === 'array' && param.items) {
            handleTypeChange(el('param' + index + 'ItemsType'));
        }
        renderEnumEditor(el('param' + index + 'EnumContainer'), param.enum, 'param' + index);
        if(param.items) {
            renderEnumEditor(el('param' + index + 'ItemsEnumContainer'), param.items.enum, 'param' + index + 'Items');
        }
        const paramEnumInput = el('param' + index + 'EnumInput'); 
        if (paramEnumInput) { 
            paramEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip(this.nextElementSibling, 'param' + index); 
                    event.preventDefault(); 
                }
            });
        }
        const paramItemsEnumInput = el('param' + index + 'ItemsEnumInput'); 
        if (paramItemsEnumInput) { 
            paramItemsEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip(this.nextElementSibling, 'param' + index + 'Items'); 
                    event.preventDefault(); 
                }
            });
        }
    });
}

// Endpoint Responses & Headers
function displayResponsesForEndpoint(responses) {
    const list = el('responsesList');
    list.innerHTML = '';
    for (const [code, response] of Object.entries(responses)) {
        const rDiv = create('div', { className: 'response-item', id: 'responseItem' + code });
        const schemaRefName = response.schema?.$ref?.substring('#/definitions/'.length) || '';
        rDiv.innerHTML =
            '<div class="response-header" onclick="toggleDetailsDisplay(this)">' +
            '    <div><span class="toggle-icon">▶</span><strong>Response ' + code + '</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removeResponseFromEndpoint(\'' + code + '\', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">' +
            '    <div class="form-group"><label>Description</label><textarea class="form-control" id="responseDescription' + code + '">' + (response.description || '') + '</textarea></div>' +
            '    <div class="form-group"><label>Schema (Model Ref)</label>' +
            '        <div style="display:flex; gap:5px;">' +
            '            <select class="form-select" id="responseSchema' + code + '">' + getModelOptions(schemaRefName) + '</select>' +
            '            <button class="btn btn-primary btn-sm" id="goToModelBtnResponse' + code + '" onclick="goToModel(\'responseSchema' + code + '\')" style="display:' + (schemaRefName ? 'inline-block' : 'none') + '">➡️</button>' +
            '        </div>' +
            '    </div>' +
            '    <h4>Headers</h4>' +
            '    <div class="headers-container" id="responseHeadersContainer' + code + '"></div>' +
            '    <button class="btn btn-secondary btn-sm" onclick="addHeaderToResponse(\'' + code + '\')">+ Add Header</button>' +
            '</div>';
        list.appendChild(rDiv);
        displayHeadersForResponse(code, response.headers || {});
        if (schemaRefName) {
            handleModelRefChange(el('responseSchema' + code));
        }
    }
}

function displayHeadersForResponse(responseCode, headers) {
    const container = el('responseHeadersContainer' + responseCode);
    container.innerHTML = '';
    for (const [headerName, header] of Object.entries(headers)) {
        const hDiv = create('div', { className: 'header-item', id: 'headerItem_' + responseCode + '_' + headerName });
        hDiv.innerHTML =
            '<div class="header-item-header" onclick="toggleDetailsDisplay(this)">' +
            '    <div><span class="toggle-icon">▶</span><strong>Header: ' + headerName + '</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removeHeaderFromResponse(\'' + responseCode + '\', \'' + headerName + '\', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">' +
            '    <div class="form-group"><label>Description</label><textarea class="form-control" id="headerDescription_' + responseCode + '_' + headerName + '">' + (header.description || '') + '</textarea></div>' +
            '    <div class="form-group"><label>Type</label>' +
            '        <select class="form-select" id="headerType_' + responseCode + '_' + headerName + '">' +
                        commonTypes.filter(t => t !== 'object' && t !== 'array').map(t => '<option value="' + t + '" ' + (header.type === t ? 'selected' : '') + '>' + t + '</option>').join('') +
            '            <option value="array" ' + (header.type === 'array' ? 'selected' : '') + '>array</option>' +
            '        </select>' +
            '    </div>' +
            '    <div id="headerItemsConfig_' + responseCode + '_' + headerName + '" style="display:' + (header.type === 'array' ? 'block' : 'none') + '">' +
            '        <div class="form-group"><label>Item Type</label>' +
            '            <select class="form-select" id="headerItemsType_' + responseCode + '_' + headerName + '">' +
                             commonTypes.filter(t => t !== 'object' && t !== 'array').map(t => '<option value="' + t + '" ' + (header.items?.type === t ? 'selected' : '') + '>' + t + '</option>').join('') +
            '            </select>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        container.appendChild(hDiv);
        const headerTypeSelect = el('headerType_' + responseCode + '_' + headerName);
        if (headerTypeSelect) {
            headerTypeSelect.onchange = () => { 
                const itemsConfigDiv = el('headerItemsConfig_' + responseCode + '_' + headerName); 
                if (itemsConfigDiv) itemsConfigDiv.style.display = headerTypeSelect.value === 'array' ? 'block' : 'none'; 
            };
        }
    }
}

// Model Properties
function displayPropertiesForModel(properties, requiredArr) {
    const list = el('propertiesList');
    list.innerHTML = '';
    for (const [propName, prop] of Object.entries(properties)) {
        const pDiv = create('div', { className: 'property-item', id: 'propertyItem_' + propName });
        const propTypeForOptions = prop.$ref ? 'schema' : (prop.type || 'string');
        let itemsTypeForOptions = prop.items ? (prop.items.$ref ? 'schema' : (prop.items.type || 'string')) : 'string';
        const modelRefName = prop.$ref?.substring('#/definitions/'.length) || '';
        const itemsModelRefName = prop.items?.$ref?.substring('#/definitions/'.length) || '';
        pDiv.innerHTML =
            '<div class="property-header" onclick="toggleDetailsDisplay(this)">' +
            '    <div><span class="toggle-icon">▶</span><strong>' + propName + '</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removePropertyFromModel(\'' + propName + '\', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">' +
            '    <div class="form-group"><label>Name</label><input type="text" class="form-control" id="propName_' + propName + '" value="' + propName + '"></div>' +
            '    <div class="form-group"><label>Description</label><textarea class="form-control" id="propDescription_' + propName + '">' + (prop.description || '') + '</textarea>' +
            '    <div class="form-group"><label><input type="checkbox" id="propRequired_' + propName + '" ' + (requiredArr.includes(propName) ? 'checked' : '') + '> Required</label></div>' +
            '    <div class="form-group"><label>Type</label><select class="form-select" id="propType_' + propName + '" onchange="handleTypeChange(this)">' + getTypeOptions(propTypeForOptions, true) + '</select></div>' +
            '    <div class="form-group" id="prop_' + propName + 'FormatGroup"><label>Format</label><select class="form-select" id="prop_' + propName + 'Format">' + getFormatOptions(prop.type, prop.format || '') + '</select></div>' +
            '    <div class="form-group" id="prop_' + propName + 'ModelGroup"><label>Schema (Model Ref)</label><div style="display:flex; gap:5px;"><select class="form-select" id="propModelSelect_' + propName + '">' + getModelOptions(modelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnProp_' + propName + '" onclick="goToModel(\'propModelSelect_' + propName + '\')" style="display:' + (modelRefName ? 'inline-block' : 'none') + '">➡️</button></div></div>' +
            '    <div class="form-group" id="prop_' + propName + 'StringValidationsGroup"><label>Pattern (RegEx)</label><input type="text" class="form-control" id="propPattern_' + propName + '" value="' + (prop.pattern || '') + '"><label>Min Length</label><input type="number" class="form-control" id="propMinLength_' + propName + '" value="' + (prop.minLength !== undefined ? prop.minLength : '') + '"><label>Max Length</label><input type="number" class="form-control" id="propMaxLength_' + propName + '" value="' + (prop.maxLength !== undefined ? prop.maxLength : '') + '"></div>' +
            '    <div class="form-group" id="prop_' + propName + 'NumberValidationsGroup"><label>Minimum</label><input type="number" class="form-control" id="propMinimum_' + propName + '" value="' + (prop.minimum !== undefined ? prop.minimum : '') + '"><label>Maximum</label><input type="number" class="form-control" id="propMaximum_' + propName + '" value="' + (prop.maximum !== undefined ? prop.maximum : '') + '"></div>' +
            '    <div class="form-group" id="propEnumGroup_' + propName + '"><label>Enum Values</label><div class="enum-container" id="propEnumContainer_' + propName + '"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="propEnumInput_' + propName + '" placeholder="Add enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'prop_' + propName + '\')">+ Add</button></div></div>' +
            '    <div class="array-items-config" id="propItemsConfig_' + propName + '">' +
            '        <div class="sub-section-header">Array Item Configuration</div>' +
            '        <div class="form-group"><label>Item Type</label><select class="form-select" id="propItemsType_' + propName + '" onchange="handleTypeChange(this)">' + getTypeOptions(itemsTypeForOptions, true) + '</select></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'FormatGroup"><label>Item Format</label><select class="form-select" id="propItems_' + propName + 'Format">' + getFormatOptions(prop.items?.type, prop.items?.format || '') + '</select></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'ModelGroup"><label>Item Model/Schema Ref</label><div style="display:flex; gap:5px;"><select class="form-select" id="propItemsModelSelect_' + propName + '">' + getModelOptions(itemsModelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnPropItems_' + propName + '" onclick="goToModel(\'propItemsModelSelect_' + propName + '\')" style="display:' + (itemsModelRefName ? 'inline-block' : 'none') + '">➡️</button></div></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'EnumGroup"><label>Item Enum Values</label><div class="enum-container" id="propItemsEnumContainer_' + propName + '"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="propItemsEnumInput_' + propName + '" placeholder="Add item enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'propItems_' + propName + '\')">+ Add</button></div></div>' +
            '    </div>' +
            '</div>';
        list.appendChild(pDiv);
        handleTypeChange(el('propType_' + propName));
        if (el('propType_' + propName).value === 'array' && prop.items) {
            handleTypeChange(el('propItemsType_' + propName));
        }
        renderEnumEditor(el('propEnumContainer_' + propName), prop.enum, 'prop_' + propName);
        if(prop.items) {
            renderEnumEditor(el('propItemsEnumContainer_' + propName), prop.items.enum, 'propItems_' + propName);
        }
        const propEnumInput = el('propEnumInput_' + propName); 
        if (propEnumInput) {
            propEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip(this.nextElementSibling, 'prop_' + propName); 
                    event.preventDefault(); 
                }
            });
        }
        const propItemsEnumInput = el('propItemsEnumInput_' + propName); 
        if (propItemsEnumInput) {
            propItemsEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip(this.nextElementSibling, 'propItems_' + propName); 
                    event.preventDefault(); 
                }
            });
        }
    }
}

// --- Endpoint Security ---
function displaySecurityForEndpoint(securityReqs) {
    const list = el('securityList');
    list.innerHTML = '';
    (securityReqs || []).forEach((req, index) => {
        const reqDiv = create('div', { className: 'security-scheme-item', id: 'securityReqItem' + index });
        let content =
            '<div class="security-scheme-header" onclick="toggleDetailsDisplay(this)">' +
            '    <div><span class="toggle-icon">▶</span><strong>Requirement ' + (index + 1) + '</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removeSecurityRequirementFromEndpoint(' + index + ', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">';
        for (const [name, scopes] of Object.entries(req)) {
            const secDef = swaggerDoc.securityDefinitions[name];
            content +=
                '<div class="form-group">' +
                '    <label>Scheme: ' + name + ' (Type: ' + (secDef?.type || 'Unknown') + ')</label>';
            if (secDef?.type === 'oauth2') {
                content += '<div class="enum-container" id="endpointScopeChipsContainer_' + index + '_' + name + '">';
                (scopes || []).forEach(scope => { content += '<span class="enum-item">' + scope + ' <span class="remove-enum" onclick="this.parentElement.remove()">×</span></span>'; });
                content += '</div>' +
                           '<div class="enum-input-group">' +
                           '    <input type="text" class="form-control enum-input" id="endpointScopeInput_' + index + '_' + name + '" placeholder="Add scope for ' + name + '">' +
                           '    <button class="btn btn-secondary btn-sm" onclick="addScopeChipToEndpoint(this, ' + index + ', \'' + name + '\')">+ Add Scope</button>' +
                           '</div>';
            } else if (secDef?.type === 'apiKey' || secDef?.type === 'basic') {
                content += ' <span>(No scopes applicable for this type)</span>';
            }
            content += '</div>';
        }
        content += '</div></div>'; // Closing details and securityReqItem
        reqDiv.innerHTML = content;
        list.appendChild(reqDiv);
        for (const [name] of Object.entries(req)) {
             if (swaggerDoc.securityDefinitions[name]?.type === 'oauth2') {
                const scopeInput = el('endpointScopeInput_' + index + '_' + name);
                if (scopeInput) {
                    scopeInput.addEventListener('keypress', function(event) { 
                        if (event.key === 'Enter') { 
                            addScopeChipToEndpoint(this.nextElementSibling, index, name); 
                            event.preventDefault(); 
                        }
                    });
                }
            }
        }
    });
}

// --- Security Definition Editor Specifics ---
function handleSecurityDefinitionTypeChange(selectElement) {
    const defNameInput = el('securityDefNameInput');
    const currentDefName = defNameInput ? defNameInput.value : null;
    const secDef = currentDefName ? (swaggerDoc.securityDefinitions[currentDefName] || { type: selectElement.value }) : { type: selectElement.value };
    secDef.type = selectElement.value;
    renderSecurityDefinitionTypeSpecificFields(secDef);
    if (secDef.type === 'oauth2') {
        displayScopesForDefinition(secDef.scopes || {});
    }
}

function handleOAuth2FlowChange(selectElement) {
    const flow = selectElement.value;
    const defNameInput = el('securityDefNameInput');
    const currentDefName = defNameInput ? defNameInput.value : null;
    const secDef = currentDefName && swaggerDoc.securityDefinitions[currentDefName] ?
                   swaggerDoc.securityDefinitions[currentDefName] : { flow: flow };
    secDef.flow = flow;
    renderOAuth2FlowSpecificFields(flow, secDef);
}

function displayScopesForDefinition(scopes) {
    const list = el('scopesList');
    if (!list) return;
    list.innerHTML = '';
    for (const [scopeKey, scopeDesc] of Object.entries(scopes)) {
        const item = create('div', { className: 'scope-item' });
        item.innerHTML =
            '<div class="form-group-inline">' +
            '    <input type="text" class="form-control scope-input" value="' + scopeKey + '" placeholder="Scope Name (e.g., read:pets)" id="scopeKey_' + scopeKey.replace(/[^a-zA-Z0-9]/g, '_') + '">' +
            '    <input type="text" class="form-control scope-input" value="' + scopeDesc + '" placeholder="Description" id="scopeDesc_' + scopeKey.replace(/[^a-zA-Z0-9]/g, '_') + '">' +
            '    <button class="btn btn-danger btn-sm" onclick="removeScopeFromUIDefinition(this, \'' + scopeKey + '\')">Remove</button>' +
            '</div>';
        list.appendChild(item);
    }
}

// --- Enum Editor (shared by parameters, properties) ---
function renderEnumEditor(containerElement, enumValues = [], contextPrefix) {
    if (!containerElement) return;
    containerElement.innerHTML = '';
    (enumValues || []).forEach(val => {
        const chip = create('span', { className: 'enum-item', textContent: val });
        const removeBtn = create('span', { className: 'remove-enum', textContent: ' ×', onclick: () => chip.remove() });
        chip.appendChild(removeBtn);
        containerElement.appendChild(chip);
    });
}

function addEnumChip(buttonElement, contextPrefix) {
    const inputField = el(contextPrefix + 'EnumInput');
    const container = el(contextPrefix + 'EnumContainer');
    if (inputField && container && inputField.value.trim() !== '') {
        const value = inputField.value.trim();
        const existingChips = qa('.enum-item', container);
        for (let chip of existingChips) { 
            if (chip.textContent.slice(0, -2).trim() === value) { 
                alert("Enum value already exists."); 
                return; 
            }
        }
        const chip = create('span', { className: 'enum-item', textContent: value });
        const removeBtn = create('span', { className: 'remove-enum', textContent: ' ×', onclick: () => chip.remove() });
        chip.appendChild(removeBtn);
        container.appendChild(chip);
        inputField.value = ''; inputField.focus();
    }
}

function collectEnumValuesFromChips(containerElementOrId) {
    const container = typeof containerElementOrId === 'string' ? el(containerElementOrId) : containerElementOrId;
    if (!container) return [];
    return Array.from(qa('.enum-item', container)).map(chip => chip.textContent.slice(0, -2).trim());
}

// --- Scope Chip for Endpoint Security ---
function addScopeChipToEndpoint(buttonElement, securityReqIndex, schemeName) {
    const inputField = el('endpointScopeInput_' + securityReqIndex + '_' + schemeName);
    const container = el('endpointScopeChipsContainer_' + securityReqIndex + '_' + schemeName);
    if (inputField && container && inputField.value.trim() !== '') {
        const value = inputField.value.trim();
        const existingChips = qa('.enum-item', container);
        for (let chip of existingChips) { 
            if (chip.textContent.slice(0, -2).trim() === value) { 
                alert("Scope already exists for this requirement."); 
                return; 
            }
        }
        const chip = create('span', { className: 'enum-item', textContent: value });
        const removeBtn = create('span', { className: 'remove-enum', textContent: ' ×', onclick: () => chip.remove() });
        chip.appendChild(removeBtn);
        container.appendChild(chip);
        inputField.value = ''; inputField.focus();
    }
}
