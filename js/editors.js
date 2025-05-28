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
        '        <h2 id="editorPathTitle">Editing Endpoint: ' + method.toUpperCase() + ' ' + path + '</h2>' +        '        <div class="editor-actions">' +
        '            <button class="btn btn-info btn-sm clone-btn-editor" onclick="cloneCurrentEndpoint()" title="Clone Endpoint">❐ Clone</button>' +
        '            <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentEndpoint()" title="Delete Endpoint">🗑️ Delete</button>' +
        '            <span class="auto-save-indicator" style="color: #28a745; font-size: 12px; padding: 4px 8px;">💾 Auto-save enabled</span>' +
        '        </div>'+
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
        '</div>';    displayParametersForEndpoint(endpoint.parameters || []);
    displayResponsesForEndpoint(endpoint.responses || {});
    displaySecurityForEndpoint(endpoint.security || []);
    setTimeout(() => {
        qa('#endpointEditorContent [id^="paramSchema"], #endpointEditorContent [id^="paramItemsModelSelect"], #endpointEditorContent [id^="responseSchema"]').forEach(select => {
            select.addEventListener('change', function() { handleModelRefChange(this); });
            if (select.value && select.value !== '') handleModelRefChange(select);
        });
        // Setup auto-save for endpoint editor
        if (window.AutoSave && window.AutoSave.setupEndpoint) {
            window.AutoSave.setupEndpoint();
        }
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
        '        <h2>Editing Model: ' + modelName + '</h2>' +        '        <div class="editor-actions">' +
        '             <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentModel()" title="Delete Model">🗑️ Delete</button>' +
        '             <span class="auto-save-indicator" style="color: #28a745; font-size: 12px; padding: 4px 8px;">💾 Auto-save enabled</span>' +
        '        </div>'+
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
        '</div>';    displayPropertiesForModel(model.properties || {}, model.required || []);
    setTimeout(() => {
        qa('#modelEditorContent [id^="propModelSelect_"], #modelEditorContent [id^="propItemsModelSelect_"], #modelEditorContent [id^="propAdditionalPropsModelSelect_"]').forEach(select => {
            select.addEventListener('change', function() { handleModelRefChange(this); });
            if (select.value && select.value !== '') handleModelRefChange(select);
        });
        // Setup auto-save for model editor
        if (window.AutoSave && window.AutoSave.setupModel) {
            window.AutoSave.setupModel();
        }
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
        '        <h2>Editing Security Definition: ' + defName + '</h2>' +        '        <div class="editor-actions">' +
        '            <button class="btn btn-danger btn-sm delete-btn-editor" onclick="deleteCurrentSecurityDefinition()" title="Delete Security Definition">🗑️ Delete</button>' +
        '            <span class="auto-save-indicator" style="color: #28a745; font-size: 12px; padding: 4px 8px;">💾 Auto-save enabled</span>' +
        '        </div>'+
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
        '</div>';    container.innerHTML = content;
    renderSecurityDefinitionTypeSpecificFields(secDef); // New helper
    if (secDef.type === 'oauth2') {
        displayScopesForDefinition(secDef.scopes || {});
    }
    // Setup auto-save for security definition editor
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupSecurityDefinition) {
            window.AutoSave.setupSecurityDefinition();
        }
    }, 0);
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
    let isParameterContext = false, isPropertyContext = false, isItemsContext = false, isAdditionalPropsContext = false;

    if (elementId.startsWith('paramType')) { isParameterContext = true; identifier = elementId.substring('paramType'.length); baseIdForControls = 'param' + identifier; }
    else if (elementId.match(/^param\d+ItemsType$/)) { isParameterContext = true; isItemsContext = true; identifier = elementId.match(/^param(\d+)ItemsType$/)[1]; baseIdForControls = 'param' + identifier + 'Items'; } // Poprawiony regex, aby pasował do HTML
    else if (elementId.startsWith('propType_')) { isPropertyContext = true; identifier = elementId.substring('propType_'.length); baseIdForControls = 'prop_' + identifier; }
    else if (elementId.startsWith('propItemsType_')) { isPropertyContext = true; isItemsContext = true; identifier = elementId.substring('propItemsType_'.length); baseIdForControls = 'propItems_' + identifier; }
    else if (elementId.startsWith('propAdditionalPropsType_')) { isPropertyContext = true; isAdditionalPropsContext = true; identifier = elementId.substring('propAdditionalPropsType_'.length); baseIdForControls = 'propAdditionalProps_' + identifier + '_'; }
    else { return; }

    const selectedType = selectElement.value;
    const showHide = (id, condition) => { const elem = el(id); if (elem) elem.style.display = condition ? 'block' : 'none'; };

    if (isParameterContext) {
        // ... (parameter context logic - unchanged)
        const paramInVal = el('paramIn' + identifier)?.value;
        const isBodyParam = paramInVal === 'body';
        if (!isItemsContext) { // Main parameter type
            showHide(baseIdForControls + 'SchemaGroup', selectedType === 'schema' || isBodyParam);
            showHide(baseIdForControls + 'FormatGroup', !isBodyParam && ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide(baseIdForControls + 'EnumGroup', !isBodyParam && selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'ItemsConfig', !isBodyParam && selectedType === 'array' && selectedType !== 'schema');
            showHide(baseIdForControls + 'StringValidationsGroup', !isBodyParam && selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'NumberValidationsGroup', !isBodyParam && ['number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide(baseIdForControls + 'DefaultGroup', !isBodyParam);
            showHide(baseIdForControls + 'ExampleGroup', !isBodyParam);
            
            const formatSelect = el(baseIdForControls + 'Format');
            if (formatSelect && !isBodyParam && selectedType !== 'schema') {
                let currentFormat = '';
                if (currentEndpoint && swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]?.parameters?.[identifier]) {
                    currentFormat = swaggerDoc.paths[currentEndpoint.path][currentEndpoint.method].parameters[identifier].format || '';
                }
                formatSelect.innerHTML = getFormatOptions(selectedType, currentFormat);
            }

            if (selectedType === 'array' && !isBodyParam && selectedType !== 'schema') { 
                const itemsTypeSelect = el(baseIdForControls + 'ItemsType'); 
                if (itemsTypeSelect) handleTypeChange(itemsTypeSelect); 
            }
        } else { // Parameter items type
            showHide(baseIdForControls + 'ModelGroup', selectedType === 'schema');
            showHide(baseIdForControls + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            
            const itemsFormatSelect = el(baseIdForControls + 'Format');
            if (itemsFormatSelect && selectedType !== 'schema') {
                let currentItemsFormat = '';
                if (currentEndpoint && swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]?.parameters?.[identifier]?.items) {
                    currentItemsFormat = swaggerDoc.paths[currentEndpoint.path][currentEndpoint.method].parameters[identifier].items.format || '';
                }
                itemsFormatSelect.innerHTML = getFormatOptions(selectedType, currentItemsFormat);
            }
        }
    } else if (isPropertyContext) {        
        if (!isItemsContext && !isAdditionalPropsContext) { // Main property type
            showHide('prop_' + identifier + 'ModelGroup', selectedType === 'schema');
            showHide('prop_' + identifier + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide('prop_' + identifier + 'DefaultGroup', selectedType !== 'schema');
            showHide('prop_' + identifier + 'ExampleGroup', selectedType !== 'schema');
            showHide('prop_' + identifier + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide('propItemsConfig_' + identifier, selectedType === 'array' && selectedType !== 'schema');            
            showHide('prop_' + identifier + 'StringValidationsGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide('prop_' + identifier + 'NumberValidationsGroup', ['number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            
            // Show/hide additionalProperties config for main property
            showHide('propAdditionalPropsConfig_' + identifier, selectedType === 'object' && selectedType !== 'schema');
            if (selectedType !== 'object') { // If not an object, also hide the schema config part of additionalProperties
                 showHide('propAdditionalPropsSchemaConfig_' + identifier, false);
            } else {
                 // If it is an object, ensure the additionalProperties mode select triggers its own UI update
                 const additionalPropsModeSelect = el('propAdditionalPropsMode_' + identifier);
                 if (additionalPropsModeSelect) {
                    handleAdditionalPropertiesModeChange(additionalPropsModeSelect, identifier);
                 }
            }

            const formatSelect = el('prop_' + identifier + 'Format');
            if (formatSelect && selectedType !== 'schema') {
                let currentFormat = '';
                if (currentModel && swaggerDoc.definitions[currentModel]?.properties?.[identifier]) {
                    currentFormat = swaggerDoc.definitions[currentModel].properties[identifier].format || '';
                }
                formatSelect.innerHTML = getFormatOptions(selectedType, currentFormat);
            }

            if (selectedType === 'array' && selectedType !== 'schema') { 
                const itemsTypeSelect = el('propItemsType_' + identifier); 
                if (itemsTypeSelect) handleTypeChange(itemsTypeSelect); 
            }
        } else if (isItemsContext) { // Property items type
            showHide(baseIdForControls + 'ModelGroup', selectedType === 'schema');
            showHide(baseIdForControls + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            showHide(baseIdForControls + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');

            const itemsFormatSelect = el(baseIdForControls + 'Format');
            if (itemsFormatSelect && selectedType !== 'schema') {
                let currentItemsFormat = '';
                if (currentModel && swaggerDoc.definitions[currentModel]?.properties?.[identifier]?.items) {
                    currentItemsFormat = swaggerDoc.definitions[currentModel].properties[identifier].items.format || '';
                }
                itemsFormatSelect.innerHTML = getFormatOptions(selectedType, currentItemsFormat);
            }
        } else if (isAdditionalPropsContext) { // Property additionalProperties schema type
            // baseIdForControls here is 'propAdditionalProps_' + identifier + '_'
            showHide(baseIdForControls + 'ModelGroup', selectedType === 'schema');
            showHide(baseIdForControls + 'FormatGroup', ['string', 'number', 'integer'].includes(selectedType) && selectedType !== 'schema');
            showHide(baseIdForControls + 'EnumGroup', selectedType === 'string' && selectedType !== 'schema');
            // Note: Default, Example, StringValidations, NumberValidations are not currently added for additionalProperties schema for brevity
            // If they were, their showHide calls would go here, using baseIdForControls

            const apFormatSelect = el(baseIdForControls + 'Format');
            if (apFormatSelect && selectedType !== 'schema') {
                let currentApFormat = '';
                // Retrieve current format from swaggerDoc for additionalProperties schema
                if (currentModel && swaggerDoc.definitions[currentModel]?.properties?.[identifier]?.additionalProperties && typeof swaggerDoc.definitions[currentModel].properties[identifier].additionalProperties === 'object') {
                    currentApFormat = swaggerDoc.definitions[currentModel].properties[identifier].additionalProperties.format || '';
                }
                apFormatSelect.innerHTML = getFormatOptions(selectedType, currentApFormat);
            }
            // No 'array' items config directly inside additionalProperties schema definition in this simplified version
        }
    }
}


function handleAdditionalPropertiesModeChange(selectElement, propNameIdentifier) {
    const mode = selectElement.value;
    const schemaConfigDiv = el('propAdditionalPropsSchemaConfig_' + propNameIdentifier);
    if (schemaConfigDiv) {
        schemaConfigDiv.style.display = (mode === 'schema') ? 'block' : 'none';
        if (mode === 'schema') {
            const typeSelect = el('propAdditionalPropsType_' + propNameIdentifier);
            if (typeSelect) {
                // Ensure its initial state is correctly displayed based on its current value
                handleTypeChange(typeSelect);
            }
        }
    }
    // Trigger auto-save if applicable, as this changes the model structure
    triggerAutoSaveForCurrentEditor();
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
        }        const paramEnumInput = el('param' + index + 'EnumInput'); 
        if (paramEnumInput) { 
            paramEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip('param' + index); 
                    event.preventDefault(); 
                }
            });
        }
        const paramItemsEnumInput = el('param' + index + 'ItemsEnumInput'); 
        if (paramItemsEnumInput) { 
            paramItemsEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { 
                    addEnumChip('param' + index + 'Items'); 
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

        let typeForFormatList = '';
        if (prop.$ref) typeForFormatList = '';
        else if (['string', 'number', 'integer'].includes(prop.type)) typeForFormatList = prop.type;
        else if (prop.format) {
            if ((commonFormats.string || []).includes(prop.format)) typeForFormatList = 'string';
            else if ((commonFormats.number || []).includes(prop.format)) typeForFormatList = 'number';
            else if ((commonFormats.integer || []).includes(prop.format)) typeForFormatList = 'integer';
        }

        let itemsTypeForFormatList = '';
        if (prop.items) {
            if (prop.items.$ref) itemsTypeForFormatList = '';
            else if (['string', 'number', 'integer'].includes(prop.items.type)) itemsTypeForFormatList = prop.items.type;
            else if (prop.items.format) {
                if ((commonFormats.string || []).includes(prop.items.format)) itemsTypeForFormatList = 'string';
                else if ((commonFormats.number || []).includes(prop.items.format)) itemsTypeForFormatList = 'number';
                else if ((commonFormats.integer || []).includes(prop.items.format)) itemsTypeForFormatList = 'integer';
            }
        }

        const modelRefName = prop.$ref?.substring('#/definitions/'.length) || '';
        const itemsModelRefName = prop.items?.$ref?.substring('#/definitions/'.length) || '';

        // Additional Properties configuration
        let additionalPropsMode = 'not_set';
        let additionalPropsSchema = {};
        if (prop.additionalProperties === true) additionalPropsMode = 'true';
        else if (prop.additionalProperties === false) additionalPropsMode = 'false';
        else if (typeof prop.additionalProperties === 'object' && prop.additionalProperties !== null) {
            additionalPropsMode = 'schema';
            additionalPropsSchema = prop.additionalProperties;
        }

        const additionalPropsSchemaTypeForOptions = additionalPropsSchema.$ref ? 'schema' : (additionalPropsSchema.type || 'string');
        const additionalPropsModelRefName = additionalPropsSchema.$ref?.substring('#/definitions/'.length) || '';
        let additionalPropsTypeForFormatList = '';
        if (additionalPropsSchema.$ref) additionalPropsTypeForFormatList = '';
        else if (['string', 'number', 'integer'].includes(additionalPropsSchema.type)) additionalPropsTypeForFormatList = additionalPropsSchema.type;
        else if (additionalPropsSchema.format) {
            if ((commonFormats.string || []).includes(additionalPropsSchema.format)) additionalPropsTypeForFormatList = 'string';
            else if ((commonFormats.number || []).includes(additionalPropsSchema.format)) additionalPropsTypeForFormatList = 'number';
            else if ((commonFormats.integer || []).includes(additionalPropsSchema.format)) additionalPropsTypeForFormatList = 'integer';
        }

        pDiv.innerHTML =
            '<div class=\"property-header\" onclick=\"toggleDetailsDisplay(this)\">' +
            '    <div><span class="toggle-icon">▶</span><strong>' + propName + '</strong></div>' +
            '    <button class="btn btn-danger btn-sm" onclick="removePropertyFromModel(\'' + propName + '\', event)">Remove</button>' +
            '</div>' +
            '<div class="details" style="display:none;">' +
            '    <div class="form-group"><label>Name</label><input type="text" class="form-control" id="propName_' + propName + '" value="' + propName + '"></div>' +
            '    <div class="form-group"><label>Description</label><textarea class="form-control" id="propDescription_' + propName + '">' + (prop.description || '') + '</textarea>' +
            '    <div class="form-group"><label><input type="checkbox" id="propRequired_' + propName + '" ' + (requiredArr.includes(propName) ? 'checked' : '') + '> Required</label></div>' +
            '    <div class="form-group" id="prop_' + propName + 'DefaultGroup"><label>Default Value</label><input type="text" class="form-control" id="propDefault_' + propName + '" value="' + (prop.default !== undefined ? String(prop.default) : '') + '"></div>' +
            '    <div class="form-group" id="prop_' + propName + 'ExampleGroup"><label>Example</label><input type="text" class="form-control" id="propExample_' + propName + '" value="' + (prop.example !== undefined ? String(prop.example) : '') + '"></div>' +
            '    <div class="form-group"><label>Type</label><select class="form-select" id="propType_' + propName + '" onchange="handleTypeChange(this)">' + getTypeOptions(propTypeForOptions, true) + '</select></div>'+
            '    <div class="form-group" id="prop_' + propName + 'FormatGroup"><label>Format</label><select class="form-select" id="prop_' + propName + 'Format">' + getFormatOptions(typeForFormatList, prop.format || '') + '</select></div>' +
            '    <div class="form-group" id="prop_' + propName + 'ModelGroup"><label>Schema (Model Ref)</label><div style="display:flex; gap:5px;"><select class="form-select" id="propModelSelect_' + propName + '">' + getModelOptions(modelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnProp_' + propName + '" onclick="goToModel(\\\'propModelSelect_' + propName + '\\\')" style="display:' + (modelRefName ? 'inline-block' : 'none') + '\">➡️</button></div></div>' +
            '    <div class="form-group" id="prop_' + propName + 'StringValidationsGroup"><label>Pattern (RegEx)</label><input type="text" class="form-control" id="propPattern_' + propName + '" value="' + (prop.pattern || '') + '"><label>Min Length</label><input type="number" class="form-control" id="propMinLength_' + propName + '" value="' + (prop.minLength !== undefined ? prop.minLength : '') + '"><label>Max Length</label><input type="number" class="form-control" id="propMaxLength_' + propName + '" value="' + (prop.maxLength !== undefined ? prop.maxLength : '') + '"></div>' +
            '    <div class="form-group" id="prop_' + propName + 'NumberValidationsGroup"><label>Minimum</label><input type="number" class="form-control" id="propMinimum_' + propName + '" value="' + (prop.minimum !== undefined ? prop.minimum : '') + '"><label>Maximum</label><input type="number" class="form-control" id="propMaximum_' + propName + '" value="' + (prop.maximum !== undefined ? prop.maximum : '') + '"></div>' +
            '    <div class="form-group" id="prop_' + propName + 'EnumGroup"><label>Enum Values</label><div class="enum-container" id="prop_' + propName + 'EnumContainer"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="prop_' + propName + 'EnumInput" placeholder="Add enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'prop_' + propName + '\')">+ Add</button></div></div>' +
            '    <div class="array-items-config" id="propItemsConfig_' + propName + '">' + // Shown if type is 'array'
            '        <div class="sub-section-header">Array Item Configuration</div>' +
            '        <div class="form-group"><label>Item Type</label><select class="form-select" id="propItemsType_' + propName + '" onchange="handleTypeChange(this)">' + getTypeOptions(itemsTypeForOptions, true) + '</select></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'FormatGroup"><label>Item Format</label><select class="form-select" id="propItems_' + propName + 'Format">' + getFormatOptions(itemsTypeForFormatList, prop.items?.format || '') + '</select></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'ModelGroup"><label>Item Model/Schema Ref</label><div style="display:flex; gap:5px;"><select class="form-select" id="propItemsModelSelect_' + propName + '">' + getModelOptions(itemsModelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnPropItems_' + propName + '" onclick="goToModel(\\\'propItemsModelSelect_' + propName + '\\\')" style="display:' + (itemsModelRefName ? 'inline-block' : 'none') + '\">➡️</button></div></div>' +
            '        <div class="form-group" id="propItems_' + propName + 'EnumGroup"><label>Item Enum Values</label><div class="enum-container" id="propItems_' + propName + 'EnumContainer"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="propItems_' + propName + 'EnumInput" placeholder="Add item enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'propItems_' + propName + '\')">+ Add</button></div></div>' +
            '    </div>' +
            '    <div class="additional-properties-config" id="propAdditionalPropsConfig_' + propName + '" style="display:none;">' + // Shown if type is 'object'
            '        <div class="sub-section-header">Additional Properties Configuration</div>' +
            '        <div class="form-group">' +
            '            <label>Mode</label>' +
            '            <select class="form-select" id="propAdditionalPropsMode_' + propName + '" onchange="handleAdditionalPropertiesModeChange(this, \'' + propName + '\')">' +
            '                <option value="not_set" ' + (additionalPropsMode === 'not_set' ? 'selected' : '') + '>Not Set (Default Behavior)</option>' +
            '                <option value="true" ' + (additionalPropsMode === 'true' ? 'selected' : '') + '>Allow Any (true)</option>' +
            '                <option value="false" ' + (additionalPropsMode === 'false' ? 'selected' : '') + '>Disallow (false)</option>' +
            '                <option value="schema" ' + (additionalPropsMode === 'schema' ? 'selected' : '') + '>Define Schema</option>' +
            '            </select>' +
            '        </div>' +
            '        <div id="propAdditionalPropsSchemaConfig_' + propName + '" style="display:' + (additionalPropsMode === 'schema' ? 'block' : 'none') + ';">' + // Shown if mode is 'schema'
            '            <div class="form-group"><label>Type</label><select class="form-select" id="propAdditionalPropsType_' + propName + '" onchange="handleTypeChange(this)">' + getTypeOptions(additionalPropsSchemaTypeForOptions, true) + '</select></div>' +
            '            <div class="form-group" id="propAdditionalProps_' + propName + '_FormatGroup"><label>Format</label><select class="form-select" id="propAdditionalProps_' + propName + '_Format">' + getFormatOptions(additionalPropsTypeForFormatList, additionalPropsSchema.format || '') + '</select></div>' +
            '            <div class="form-group" id="propAdditionalProps_' + propName + '_ModelGroup"><label>Schema (Model Ref)</label><div style="display:flex; gap:5px;"><select class="form-select" id="propAdditionalPropsModelSelect_' + propName + '">' + getModelOptions(additionalPropsModelRefName) + '</select><button class="btn btn-primary btn-sm" id="goToModelBtnPropAdditionalProps_' + propName + '" onclick="goToModel(\\\'propAdditionalPropsModelSelect_' + propName + '\\\')" style="display:' + (additionalPropsModelRefName ? 'inline-block' : 'none') + '\">➡️</button></div></div>' +
            '            <div class="form-group" id="propAdditionalProps_' + propName + '_EnumGroup"><label>Enum Values (if type is string)</label><div class="enum-container" id="propAdditionalProps_' + propName + '_EnumContainer"></div><div class="enum-input-group"><input type="text" class="form-control enum-input" id="propAdditionalProps_' + propName + '_EnumInput" placeholder="Add enum value"><button class="btn btn-secondary btn-sm" onclick="addEnumChip(this, \'propAdditionalProps_' + propName + '_\')">+ Add</button></div></div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        list.appendChild(pDiv);

        handleTypeChange(el('propType_' + propName)); // Initial call for main property type
        if (el('propType_' + propName).value === 'array' && prop.items) {
            handleTypeChange(el('propItemsType_' + propName)); // Initial call for array items type
        }
        // No need to explicitly call handleAdditionalPropertiesModeChange here if handleTypeChange covers it for 'object' type.
        // It is called within handleTypeChange if selectedType is 'object'.

        renderEnumEditor(el('prop_' + propName + 'EnumContainer'), prop.enum, 'prop_' + propName);
        if(prop.items) {
            renderEnumEditor(el('propItems_' + propName + 'EnumContainer'), prop.items.enum, 'propItems_' + propName);
        }
        if (additionalPropsMode === 'schema' && additionalPropsSchema.type === 'string') {
            renderEnumEditor(el('propAdditionalProps_' + propName + '_EnumContainer'), additionalPropsSchema.enum, 'propAdditionalProps_' + propName + '_');
        }
        
        const propEnumInput = el('prop_' + propName + 'EnumInput'); 
        if (propEnumInput) {
            propEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { addEnumChip(this, 'prop_' + propName); event.preventDefault(); }
            });
        }
        const propItemsEnumInput = el('propItems_' + propName + 'EnumInput'); 
        if (propItemsEnumInput) {
            propItemsEnumInput.addEventListener('keypress', function(event) { 
                if (event.key === 'Enter') { addEnumChip(this, 'propItems_' + propName); event.preventDefault(); }
            });
        }
        const additionalPropsEnumInput = el('propAdditionalProps_' + propName + '_EnumInput');
        if (additionalPropsEnumInput) {
            additionalPropsEnumInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') { addEnumChip(this, 'propAdditionalProps_' + propName + '_'); event.preventDefault(); }
            });
        }
    }
}

// --- Endpoint Security ---
function displaySecurityForEndpoint(securityReqs) {
        const list = el('securityList');
        list.innerHTML = '';
        (securityReqs || []).forEach((req, index) => {
            const schemeName = Object.keys(req)[0];
            const scopes = req[schemeName] || []; // Ensure scopes is an array
            const sDiv = create('div', { className: 'security-scheme-item', id: `securityReq${index}`});
            sDiv.innerHTML = `
                <div class="security-scheme-header" onclick="toggleDetailsDisplay(this)">
                    <div><span class="toggle-icon">▶</span><strong>${schemeName || 'New Requirement'}</strong></div>
                    <button class="btn btn-danger btn-sm" onclick="removeSecurityRequirementFromEndpoint(${index}, event)">Remove</button>
                </div>
                <div class="details" style="display:none;">
                    <div class="form-group">
                        <label>Security Scheme Name (defined in root securityDefinitions)</label>
                        <input type="text" class="form-control" id="securitySchemeName${index}" value="${schemeName || ''}">
                    </div>
                    <div class="form-group">
                        <label>Scopes (for OAuth2, Basic etc.)</label>
                        <div class="enum-container" id="securitySchemeScopesContainer${index}">
                            <!-- Scopes chips will be rendered here -->
                        </div>
                        <div class="enum-input-group">
                            <input type="text" class="form-control enum-input" id="securitySchemeScopeInput${index}" placeholder="Add scope">
                            <button class="btn btn-secondary btn-sm" onclick="addScopeChipToEndpoint(this, ${index})">+ Add</button>
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(sDiv);

            // Render existing scopes as chips
            renderEnumEditor(el(`securitySchemeScopesContainer${index}`), scopes, `securitySchemeScopeInput${index}`); // Use contextPrefix for input if needed, here it's more direct

            // Add Enter key listener for scope input
            const scopeInput = el(`securitySchemeScopeInput${index}`);
            if (scopeInput) {
                scopeInput.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const addButton = this.nextElementSibling; // The "+ Add" button
                        if (addButton) addButton.click();
                    }
                });
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
        const removeBtn = create('span', { 
            className: 'remove-enum', 
            textContent: ' ×', 
            onclick: () => {
                chip.remove();
                // Trigger auto-save when chip is removed
                triggerAutoSaveForCurrentEditor();
            }
        });
        chip.appendChild(removeBtn);
        containerElement.appendChild(chip);
    });
}

function addEnumChip(buttonElementOrContextPrefix, contextPrefixOrIndex) {
    let actualContextPrefix = typeof buttonElementOrContextPrefix === 'string' ? buttonElementOrContextPrefix : contextPrefixOrIndex;
    // Adjust for cases like addEnumChip(this, 'prop_identifier') vs addEnumChip('prop_identifierEnumInput')
    if (actualContextPrefix && !actualContextPrefix.endsWith('_') && !actualContextPrefix.endsWith('Input') && !actualContextPrefix.endsWith('Container')) {
         // Heuristic: if it's a simple prefix like 'prop_propertyname', assume it needs EnumInput/EnumContainer appended
         // For additionalProperties, it might be 'propAdditionalProps_propname_'
    }
    
    // If contextPrefixOrIndex is a string, it's the actual context prefix.
    // If buttonElementOrContextPrefix is a button, then contextPrefixOrIndex is the context prefix.
    const inputFieldId = actualContextPrefix.endsWith('_') ? actualContextPrefix + 'EnumInput' : actualContextPrefix + 'EnumInput';
    const containerId = actualContextPrefix.endsWith('_') ? actualContextPrefix + 'EnumContainer' : actualContextPrefix + 'EnumContainer';

    const inputField = el(inputFieldId);
    const container = el(containerId);

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
        const removeBtn = create('span', { 
            className: 'remove-enum', 
            textContent: ' ×', 
            onclick: () => {
                chip.remove();
                triggerAutoSaveForCurrentEditor();
            }
        });
        chip.appendChild(removeBtn);
        container.appendChild(chip);
        inputField.value = ''; 
        inputField.focus();
        
        triggerAutoSaveForCurrentEditor();
    } else if (!inputField) {
        console.warn("addEnumChip: Input field not found with ID:", inputFieldId);
    } else if (!container) {
        console.warn("addEnumChip: Container not found with ID:", containerId);
    }
}

// Helper function to trigger auto-save for the current editor
function triggerAutoSaveForCurrentEditor() {
    // Determine which editor is currently active and trigger auto-save
    if (currentEndpoint && window.AutoSave && window.AutoSave.saveEndpointSilent) {
        setTimeout(() => window.AutoSave.saveEndpointSilent(), 100);
    } else if (currentModel && window.AutoSave && window.AutoSave.saveModelSilent) {
        setTimeout(() => window.AutoSave.saveModelSilent(), 100);
    } else if (currentSecurityDefinitionName && window.AutoSave && window.AutoSave.saveSecurityDefinitionSilent) {
        setTimeout(() => window.AutoSave.saveSecurityDefinitionSilent(), 100);
    }
}

function collectEnumValuesFromChips(containerElementOrId) {
    const container = typeof containerElementOrId === 'string' ? el(containerElementOrId) : containerElementOrId;
    if (!container) return [];
    return Array.from(qa('.enum-item', container)).map(chip => chip.textContent.slice(0, -2).trim());
}

// --- Scope Chip for Endpoint Security ---
function addScopeChipToEndpoint(buttonElement, securityReqIndex) {
        const inputField = el(`securitySchemeScopeInput${securityReqIndex}`);
        const container = el(`securitySchemeScopesContainer${securityReqIndex}`);

        if (!inputField || !container) {
            console.warn(`Scope input or container not found for security requirement index: ${securityReqIndex}`);
            return;
        }

        const value = inputField.value.trim();
        if (value) {
            // Check for duplicates
            const existingChips = qa('.enum-item', container);
            for (let i = 0; i < existingChips.length; i++) {
                if (existingChips[i].firstChild && existingChips[i].firstChild.textContent === value) {
                    alert("Scope value already exists for this requirement.");
                    inputField.value = '';
                    inputField.focus();
                    return;
                }
            }            const chip = create('span', { className: 'enum-item' }); // Re-use enum-item class for styling
            chip.textContent = value;
            const removeBtn = create('span', { className: 'remove-enum', textContent: '×' }); // Re-use remove-enum
            removeBtn.onclick = () => chip.remove(); // Direct removal like other enum chips
            chip.appendChild(removeBtn);
            container.appendChild(chip);
            inputField.value = '';
            inputField.focus();
        }
    }