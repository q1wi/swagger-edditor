// js/auto-save.js

// Auto-save configuration
const AUTO_SAVE_CONFIG = {
    debounceDelay: 1000, // 1 second debounce
    enableDebounce: true,
    enableOnBlur: true,
    enableOnChange: false, // Can be enabled for immediate saving on change
    showSaveStatus: true
};

// Debounce timers for different editors
let autoSaveTimers = {
    generalInfo: null,
    endpoint: null,
    model: null,
    securityDefinition: null
};

// Save status indicator
let saveStatusElement = null;

// Initialize auto-save system
function initializeAutoSave() {
    createSaveStatusIndicator();
    setupGeneralInfoAutoSave();
    // Endpoint, model, and security definition auto-save will be set up when editors are displayed
}

// Create save status indicator
function createSaveStatusIndicator() {
    if (saveStatusElement) return;
    
    saveStatusElement = create('div', {
        id: 'saveStatus',
        className: 'save-status',
        style: 'position: fixed; top: 10px; right: 10px; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000; display: none; transition: all 0.3s ease;'
    });
    document.body.appendChild(saveStatusElement);
}

// Show save status
function showSaveStatus(message, type = 'info') {
    if (!AUTO_SAVE_CONFIG.showSaveStatus || !saveStatusElement) return;
    
    const colors = {
        info: { bg: '#e3f2fd', color: '#1976d2', border: '#2196f3' },
        success: { bg: '#e8f5e8', color: '#2e7d32', border: '#4caf50' },
        error: { bg: '#ffebee', color: '#c62828', border: '#f44336' },
        saving: { bg: '#fff3e0', color: '#f57c00', border: '#ff9800' }
    };
    
    const style = colors[type] || colors.info;
    saveStatusElement.style.backgroundColor = style.bg;
    saveStatusElement.style.color = style.color;
    saveStatusElement.style.border = `1px solid ${style.border}`;
    saveStatusElement.textContent = message;
    saveStatusElement.style.display = 'block';
    
    // Auto-hide after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            saveStatusElement.style.display = 'none';
        }, 3000);
    }
}

// Debounced save function
function debouncedSave(editorType, saveFunction) {
    if (!AUTO_SAVE_CONFIG.enableDebounce) {
        saveFunction();
        return;
    }
    
    // Clear existing timer
    if (autoSaveTimers[editorType]) {
        clearTimeout(autoSaveTimers[editorType]);
    }
    
    // Show saving status
    showSaveStatus('Auto-saving...', 'saving');
      // Set new timer
    autoSaveTimers[editorType] = setTimeout(() => {
        try {
            saveFunction();
            showSaveStatus('Saved successfully', 'success');
        } catch (error) {
            console.error(`Auto-save failed for ${editorType}:`, error);
            showSaveStatus('Save failed', 'error');
        }
        autoSaveTimers[editorType] = null;
    }, AUTO_SAVE_CONFIG.debounceDelay);
}

// Setup auto-save for General Info tab
function setupGeneralInfoAutoSave() {
    const fields = ['apiTitle', 'apiVersion', 'apiDescription', 'apiBasePath', 'apiHost'];
    
    fields.forEach(fieldId => {
        const field = el(fieldId);
        if (field) {
            setupFieldAutoSave(field, 'generalInfo', saveGeneralInfoSilent);
        }
    });
}

// Setup auto-save for a specific field
function setupFieldAutoSave(field, editorType, saveFunction) {
    if (!field) return;
    
    // Skip enum input fields and buttons to avoid interfering with chip functionality
    if (field.classList.contains('enum-input') || 
        field.tagName.toLowerCase() === 'button' ||
        field.id.includes('EnumInput') ||
        field.onclick) {
        return;
    }
    
    // Store original value to detect actual changes
    field._originalValue = field.value || field.textContent || '';
    if (field.type === 'checkbox') field._originalValue = field.checked;
    
    // Remove existing listeners to avoid duplicates
    field.removeEventListener('input', field._autoSaveInputHandler);
    field.removeEventListener('blur', field._autoSaveBlurHandler);
    field.removeEventListener('change', field._autoSaveChangeHandler);
    
    // Input handler for debounced saving
    field._autoSaveInputHandler = () => {
        if (AUTO_SAVE_CONFIG.enableDebounce) {
            debouncedSave(editorType, saveFunction);
        }
    };
    
    // Blur handler for immediate saving
    field._autoSaveBlurHandler = () => {
        if (AUTO_SAVE_CONFIG.enableOnBlur) {
            let currentValue = field.value || field.textContent || '';
            if (field.type === 'checkbox') currentValue = field.checked;

            if (currentValue !== field._originalValue) {
                if (autoSaveTimers[editorType]) {
                    clearTimeout(autoSaveTimers[editorType]);
                    autoSaveTimers[editorType] = null;
                }
                try {
                    saveFunction();
                    showSaveStatus('Saved successfully', 'success');
                    field._originalValue = currentValue;
                } catch (error) {
                    console.error(`Auto-save on blur failed for ${editorType}:`, error);
                    showSaveStatus('Save failed', 'error');
                }
            }
        }
    };
    
    // Change handler for immediate saving (optional, good for selects/checkboxes)
    field._autoSaveChangeHandler = () => {
        if (AUTO_SAVE_CONFIG.enableOnChange || field.tagName.toLowerCase() === 'select' || field.type === 'checkbox') {
            let currentValue = field.value || field.textContent || '';
            if (field.type === 'checkbox') currentValue = field.checked;

            if (currentValue !== field._originalValue) {
                 if (autoSaveTimers[editorType]) { // Clear debounce if exists
                    clearTimeout(autoSaveTimers[editorType]);
                    autoSaveTimers[editorType] = null;
                }
                try {
                    saveFunction();
                    showSaveStatus('Saved successfully', 'success');
                    field._originalValue = currentValue; 
                } catch (error) {
                    console.error(`Auto-save on change failed for ${editorType}:`, error);
                    showSaveStatus('Save failed', 'error');
                }
            }
        }
    };
    
    // Add event listeners
    field.addEventListener('input', field._autoSaveInputHandler);
    field.addEventListener('blur', field._autoSaveBlurHandler);
    field.addEventListener('change', field._autoSaveChangeHandler); // For select, checkbox
}

// Setup auto-save for endpoint editor
function setupEndpointAutoSave() {
    if (!currentEndpoint) return;
    
    const endpointEditor = el('endpointEditorContent');
    if (!endpointEditor) return;
    
    const fields = endpointEditor.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        setupFieldAutoSave(field, 'endpoint', saveEndpointSilent);
    });
}

// Setup auto-save for model editor
function setupModelAutoSave() {
    if (!currentModel) return;
    
    const modelEditor = el('modelEditorContent');
    if (!modelEditor) return;
    
    const fields = modelEditor.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        setupFieldAutoSave(field, 'model', saveModelSilent);
    });
}

// Setup auto-save for security definition editor
function setupSecurityDefinitionAutoSave() {
    if (!currentSecurityDefinitionName) return;
    
    const securityEditor = el('securityDefinitionEditorContent');
    if (!securityEditor) return;
    
    const fields = securityEditor.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        setupFieldAutoSave(field, 'securityDefinition', saveSecurityDefinitionSilent);
    });
}

// Silent save functions (without alerts)
function saveGeneralInfoSilent() {
    swaggerDoc.info.title = el('apiTitle').value;
    swaggerDoc.info.version = el('apiVersion').value;
    swaggerDoc.info.description = el('apiDescription').value;
    swaggerDoc.basePath = el('apiBasePath').value;
    swaggerDoc.host = el('apiHost').value;
    // No alert for silent save
}

function saveEndpointSilent() {
    if (!currentEndpoint) return;
    
    const { path: oldPath, method: oldMethod } = currentEndpoint;
    const newPath = el('endpointPathInput').value;
    const newMethod = el('endpointMethodInput').value.toLowerCase();
    
    if (!newPath || !/^\//.test(newPath)) {
        console.warn("Auto-save skipped: Invalid path");
        return;
    }
    
    if (!newMethod || !httpMethods.includes(newMethod)) {
        console.warn("Auto-save skipped: Invalid HTTP method");
        return;
    }
    
    const endpointData = collectEndpointDataFromForm(); // collectEndpointDataFromForm is in actions.js
    
    if (oldPath !== newPath || oldMethod !== newMethod) {
        if (swaggerDoc.paths[newPath]?.[newMethod]) {
            console.warn('Auto-save skipped: Endpoint already exists at new location. Reverting UI name.');
            el('endpointPathInput').value = oldPath;
            el('endpointMethodInput').value = oldMethod;
            return;
        }
        delete swaggerDoc.paths[oldPath][oldMethod];
        if (Object.keys(swaggerDoc.paths[oldPath]).length === 0) {
            delete swaggerDoc.paths[oldPath];
        }
        if (!swaggerDoc.paths[newPath]) {
            swaggerDoc.paths[newPath] = {};
        }
    }
    
    swaggerDoc.paths[newPath][newMethod] = endpointData;
    currentEndpoint = { path: newPath, method: newMethod };
    
    updateEndpointsList(el('searchInput').value);
    // Update editor title if it changed
    const editorTitle = el('editorPathTitle');
    if (editorTitle) editorTitle.textContent = 'Editing Endpoint: ' + newMethod.toUpperCase() + ' ' + newPath;

}

function saveModelSilent() {
    if (!currentModel) return;
    
    const oldModelName = currentModel;
    const newModelName = el('modelNameInput').value;
    const modelDescription = el('modelDescription').value;
    
    if (!newModelName || !/^[a-zA-Z0-9_.-]+$/.test(newModelName)) {
        console.warn('Auto-save skipped: Invalid model name');
        return;
    }
    
    const properties = {};
    const required = [];
    
    qa('#propertiesList .property-item').forEach(item => {
        const propIdInput = q('input[id^="propName_"]', item);
        if (!propIdInput) return;
        const originalPropName = propIdInput.id.substring('propName_'.length);
        const currentPropName = propIdInput.value;
        if (!currentPropName) return;
        
        const prop = { description: el('propDescription_' + originalPropName).value };
        if (el('propRequired_' + originalPropName).checked) {
            required.push(currentPropName);
        }
        
        const propType = el('propType_' + originalPropName).value;
        if (propType === 'schema') {
            const ref = el('propModelSelect_' + originalPropName).value;
            if (ref) prop.$ref = ref; else prop.type = 'object';
        } else {
            prop.type = propType;
            if (el('prop_' + originalPropName + 'DefaultGroup').style.display !== 'none' && el('propDefault_' + originalPropName).value !== '') {
                const dv = el('propDefault_' + originalPropName).value;
                if (propType === 'integer') prop.default = parseInt(dv);
                else if (propType === 'number') prop.default = parseFloat(dv);
                else if (propType === 'boolean') prop.default = dv.toLowerCase() === 'true';
                else prop.default = dv;
            }
            if (el('prop_' + originalPropName + 'ExampleGroup').style.display !== 'none' && el('propExample_' + originalPropName).value !== '') {
                const ev = el('propExample_' + originalPropName).value;
                 // Examples are often strings, but can be typed
                if (propType === 'integer') prop.example = parseInt(ev);
                else if (propType === 'number') prop.example = parseFloat(ev);
                else if (propType === 'boolean') prop.example = ev.toLowerCase() === 'true';
                else prop.example = ev;
            }
            if (el('prop_' + originalPropName + 'FormatGroup').style.display !== 'none' && el('prop_' + originalPropName + 'Format').value) {
                prop.format = el('prop_' + originalPropName + 'Format').value;
            }
            if (el('prop_' + originalPropName + 'StringValidationsGroup').style.display !== 'none') {
                if (el('propPattern_' + originalPropName).value) prop.pattern = el('propPattern_' + originalPropName).value;
                if (el('propMinLength_' + originalPropName).value) prop.minLength = parseInt(el('propMinLength_' + originalPropName).value);
                if (el('propMaxLength_' + originalPropName).value) prop.maxLength = parseInt(el('propMaxLength_' + originalPropName).value);
            }
            if (el('prop_' + originalPropName + 'NumberValidationsGroup').style.display !== 'none') {
                if (el('propMinimum_' + originalPropName).value) prop.minimum = parseFloat(el('propMinimum_' + originalPropName).value);
                if (el('propMaximum_' + originalPropName).value) prop.maximum = parseFloat(el('propMaximum_' + originalPropName).value);
            }
            if (propType === 'array') {
                prop.items = {};
                const itemsType = el('propItemsType_' + originalPropName).value;
                if (itemsType === 'schema') {
                    const ref = el('propItemsModelSelect_' + originalPropName).value;
                    if (ref) prop.items.$ref = ref; else prop.items.type = 'object';
                } else {
                    prop.items.type = itemsType;
                    if (el('propItems_' + originalPropName + 'FormatGroup').style.display !== 'none' && el('propItems_' + originalPropName + 'Format').value) {
                        prop.items.format = el('propItems_' + originalPropName + 'Format').value;
                    }
                }
                if (el('propItems_' + originalPropName + 'EnumGroup').style.display !== 'none') {
                    const en = collectEnumValuesFromChips('propItems_' + originalPropName + 'EnumContainer');
                    if (en.length > 0) prop.items.enum = en;
                }
            } else if (propType === 'string' && el('prop_' + originalPropName + 'EnumGroup').style.display !== 'none') {
                const en = collectEnumValuesFromChips('prop_' + originalPropName + 'EnumContainer');
                if (en.length > 0) prop.enum = en;
            }

            // Handle additionalProperties for object type
            if (propType === 'object') {
                const additionalPropsModeSelect = el('propAdditionalPropsMode_' + originalPropName);
                if (additionalPropsModeSelect) {
                    const mode = additionalPropsModeSelect.value;
                    if (mode === 'true') {
                        prop.additionalProperties = true;
                    } else if (mode === 'false') {
                        prop.additionalProperties = false;
                    } else if (mode === 'schema') {
                        const apSchema = {};
                        const apType = el('propAdditionalPropsType_' + originalPropName).value;
                        if (apType === 'schema') {
                            const ref = el('propAdditionalPropsModelSelect_' + originalPropName).value;
                            if (ref) apSchema.$ref = ref; else apSchema.type = 'object';
                        } else {
                            apSchema.type = apType;
                            if (el('propAdditionalProps_' + originalPropName + '_FormatGroup').style.display !== 'none' && el('propAdditionalProps_' + originalPropName + '_Format').value) {
                                apSchema.format = el('propAdditionalProps_' + originalPropName + '_Format').value;
                            }
                            if (apType === 'string' && el('propAdditionalProps_' + originalPropName + '_EnumGroup').style.display !== 'none') {
                               const en = collectEnumValuesFromChips('propAdditionalProps_' + originalPropName + '_EnumContainer');
                               if (en.length > 0) apSchema.enum = en;
                            }
                        }
                        prop.additionalProperties = apSchema;
                    } else { // mode === 'not_set'
                        delete prop.additionalProperties;
                    }
                } else {
                    delete prop.additionalProperties; // Control not found, ensure it's not saved
                }
            } else { // Not an object, so no additionalProperties
                 delete prop.additionalProperties;
            }
        }
        properties[currentPropName] = prop;
    });
    
    const modelData = { type: 'object', description: modelDescription, properties: properties };
    if (required.length > 0) {
        modelData.required = required;
    }
    
    if (oldModelName !== newModelName) {
        if (swaggerDoc.definitions[newModelName]) {
            console.warn('Auto-save skipped: Model name already exists. Reverting UI name.');
            el('modelNameInput').value = oldModelName; // Revert name in UI
            return;
        }
        delete swaggerDoc.definitions[oldModelName];
        // TODO: Add logic to update $refs if rename occurs
        console.warn(`Model "${oldModelName}" renamed to "${newModelName}". Existing $refs pointing to the old name are NOT automatically updated.`);

    }
    
    swaggerDoc.definitions[newModelName] = modelData;
    currentModel = newModelName;
    updateModelsList(el('searchInput').value);
    // Update editor title if it changed
    const modelEditorContent = el('modelEditorContent');
    if (modelEditorContent) {
        const titleElement = modelEditorContent.querySelector('h2');
        if (titleElement) titleElement.textContent = 'Editing Model: ' + newModelName;
    }
}

function saveSecurityDefinitionSilent() {
    if (!currentSecurityDefinitionName) return;
    
    const oldDefName = currentSecurityDefinitionName;
    const newDefName = el('securityDefNameInput').value;
    const type = el('securityDefType').value;
    const description = el('securityDefDescription').value;
    
    if (!newDefName || !/^[a-zA-Z0-9_.-]+$/.test(newDefName)) {
        console.warn('Auto-save skipped: Invalid security definition name');
        return;
    }
    
    const defData = { type: type, description: description };
    
    if (type === 'apiKey') {
        defData.name = el('apiKeyName').value;
        defData.in = el('apiKeyIn').value;
    } else if (type === 'oauth2') {
        defData.flow = el('oauth2Flow').value;
        if (['implicit', 'accessCode'].includes(defData.flow) && el('oauth2AuthUrl')) {
            defData.authorizationUrl = el('oauth2AuthUrl').value;
        }
        if (['password', 'application', 'accessCode'].includes(defData.flow) && el('oauth2TokenUrl')) {
            defData.tokenUrl = el('oauth2TokenUrl').value;
        }
        defData.scopes = {};
        qa('#scopesList .scope-item').forEach(item => {
            const keyIn = q('input[id^="scopeKey_"]', item);
            const descIn = q('input[id^="scopeDesc_"]', item);
            if (keyIn?.value && descIn) {
                defData.scopes[keyIn.value] = descIn.value;
            }
        });
    }
    
    if (oldDefName !== newDefName) {
        if (swaggerDoc.securityDefinitions[newDefName]) {
            console.warn('Auto-save skipped: Security definition name already exists. Reverting UI name.');
            el('securityDefNameInput').value = oldDefName;
            return;
        }
        delete swaggerDoc.securityDefinitions[oldDefName];
        // TODO: Update references in endpoint.security
        console.warn(`Security Definition "${oldDefName}" renamed to "${newDefName}". Existing references in endpoints are NOT automatically updated.`);
    }
    
    swaggerDoc.securityDefinitions[newDefName] = defData;
    currentSecurityDefinitionName = newDefName;
    updateSecurityDefinitionsList(el('searchInput').value);
    // Update editor title
    const secDefEditorContent = el('securityDefinitionEditorContent');
    if (secDefEditorContent) {
        const titleElement = secDefEditorContent.querySelector('h2');
        if (titleElement) titleElement.textContent = 'Editing Security Definition: ' + newDefName;
    }
}

// Auto-save cleanup functions
function cleanupAutoSave(editorType) {
    if (autoSaveTimers[editorType]) {
        clearTimeout(autoSaveTimers[editorType]);
        autoSaveTimers[editorType] = null;
    }
}


function cleanupAllAutoSave() {
    Object.keys(autoSaveTimers).forEach(editorType => {
        cleanupAutoSave(editorType);
    });
}

// Public API for configuration
window.AutoSave = {
    config: AUTO_SAVE_CONFIG,
    init: initializeAutoSave,
    setupGeneralInfo: setupGeneralInfoAutoSave,
    setupEndpoint: setupEndpointAutoSave,
    setupModel: setupModelAutoSave,
    setupSecurityDefinition: setupSecurityDefinitionAutoSave,
    saveModelSilent: saveModelSilent, // Expose for direct calls if needed
    saveEndpointSilent: saveEndpointSilent,
    saveSecurityDefinitionSilent: saveSecurityDefinitionSilent,
    cleanup: cleanupAutoSave,
    cleanupAll: cleanupAllAutoSave,
    showStatus: showSaveStatus
};