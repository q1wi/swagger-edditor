// js/actions.js

function saveGeneralInfo() {
    swaggerDoc.info.title = el('apiTitle').value;
    swaggerDoc.info.version = el('apiVersion').value;
    swaggerDoc.info.description = el('apiDescription').value;
    swaggerDoc.basePath = el('apiBasePath').value;
    swaggerDoc.host = el('apiHost').value;
    alert('General info saved!');
}

function addEndpoint() {
    const path = prompt('Enter endpoint path (e.g., /users):');
    if (!path || !/^\//.test(path)) { alert("Invalid path. Must start with '/' and be non-empty."); return; } // Corrected regex
    const method = prompt('Enter HTTP method (get, post, put, delete, patch, options, head):')?.toLowerCase();
    if (!method || !httpMethods.includes(method)) { alert('Invalid or empty HTTP method.'); return; }
    if (!swaggerDoc.paths[path]) swaggerDoc.paths[path] = {};
    if (swaggerDoc.paths[path][method]) { alert('Endpoint ' + method.toUpperCase() + ' ' + path + ' already exists.'); return; }
    swaggerDoc.paths[path][method] = { summary: 'New ' + method + ' for ' + path, description: "", parameters: [], responses: { '200': { description: 'Successful operation' } }, tags: [], consumes: [], produces: [], security: [] };
    updateEndpointsList(el('searchInput').value);
    selectEndpoint(path, method);
}

function addModel() {
    const name = prompt('Enter new model name:');
    if (!name || !/^[a-zA-Z0-9_.-]+$/.test(name)) { alert('Invalid model name. Use alphanumeric characters, underscore, dot, or hyphen.'); return; }
    if (swaggerDoc.definitions[name]) { alert('Model "' + name + '" already exists.'); return; } // Corrected alert
    swaggerDoc.definitions[name] = { type: 'object', properties: {}, required: [], description: "" };
    updateModelsList(el('searchInput').value);
    selectModel(name);
}

function deleteCurrentEndpoint() {
    if (!currentEndpoint) { alert("No endpoint selected to delete."); return; }
    const { path, method } = currentEndpoint;
    if (confirm('Are you sure you want to delete the endpoint ' + method.toUpperCase() + ' ' + path + '?')) { // Corrected confirm
        delete swaggerDoc.paths[path][method];
        if (Object.keys(swaggerDoc.paths[path]).length === 0) delete swaggerDoc.paths[path];
        currentEndpoint = null;
        updateEndpointsList(el('searchInput').value);
        el('endpointEditor').innerHTML = `<div id="endpointEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Endpoint deleted. Select another or add a new one.</p></div>`;
        selectInfoTab();
    }
}

function deleteCurrentModel() {
    if (!currentModel) { alert("No model selected to delete."); return; }
    const name = currentModel;
    if (confirm('Are you sure you want to delete the model "' + name + '"? This cannot be undone.')) { // Corrected confirm
        delete swaggerDoc.definitions[name];
        currentModel = null;
        updateModelsList(el('searchInput').value);
        el('modelEditor').innerHTML = `<div id="modelEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Model deleted. Select another or add a new one.</p></div>`;
        selectInfoTab();
    }
}

function cloneCurrentEndpoint() {
    if (!currentEndpoint) { alert("No endpoint selected to clone."); return; }
    const { path: originalPath, method: originalMethod } = currentEndpoint;
    const endpointToClone = swaggerDoc.paths[originalPath]?.[originalMethod];
    if (!endpointToClone) { alert("Error: Endpoint to clone not found."); return; }
    const clonedData = JSON.parse(JSON.stringify(endpointToClone));
    if (clonedData.operationId) clonedData.operationId += "_clone";
    clonedData.summary = (clonedData.summary || "") + " (Clone)";
    let newPathCandidate = originalPath + "_clone", attempts = 0, MAX_CLONE_ATTEMPTS = 100;
    while (swaggerDoc.paths[newPathCandidate]?.[originalMethod] && attempts < MAX_CLONE_ATTEMPTS) { attempts++; newPathCandidate = originalPath + "_clone" + attempts; }
    if (attempts >= MAX_CLONE_ATTEMPTS) { alert("Could not find a unique path for the cloned endpoint."); return; }
    const newPath = newPathCandidate, newMethod = originalMethod;
    if (!swaggerDoc.paths[newPath]) swaggerDoc.paths[newPath] = {};
    swaggerDoc.paths[newPath][newMethod] = clonedData;
    updateEndpointsList(el('searchInput').value);
    selectEndpoint(newPath, newMethod);
    alert('Endpoint cloned to ' + newMethod.toUpperCase() + ' ' + newPath + '.'); // Corrected alert
}

function addParameterToEndpoint() {
    if (!currentEndpoint) return; const endpoint = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]; if (!endpoint) return;
    if (!endpoint.parameters) endpoint.parameters = [];
    endpoint.parameters.push({ name: 'newParam' + endpoint.parameters.length, in: 'query', type: 'string', description: '' });
    displayParametersForEndpoint(endpoint.parameters);
    // Setup auto-save for newly added parameter fields
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupEndpoint) {
            window.AutoSave.setupEndpoint();
        }
    }, 100);
}

function removeParameterFromEndpoint(index, event) {
    event.stopPropagation(); if (!currentEndpoint) return; const endpoint = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method];
    if (!endpoint || !endpoint.parameters?.[index]) return;
    if (confirm('Remove parameter ' + (endpoint.parameters[index].name || 'at index ' + index) + '?')) { // Corrected confirm
        endpoint.parameters.splice(index, 1); displayParametersForEndpoint(endpoint.parameters);
    }
}

function addResponseToEndpoint() {
    if (!currentEndpoint) return; const endpoint = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]; if (!endpoint) return;
    if (!endpoint.responses) endpoint.responses = {};
    const newCode = prompt("Enter HTTP status code for the new response (e.g., 201, 404):", "200");
    if (!newCode || isNaN(parseInt(newCode))) { alert("Invalid status code."); return; }
    if (endpoint.responses[newCode]) { alert('Response with code ' + newCode + ' already exists.'); return; } // Corrected alert
    endpoint.responses[newCode] = { description: 'New response' };
    displayResponsesForEndpoint(endpoint.responses);
    // Setup auto-save for newly added response fields
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupEndpoint) {
            window.AutoSave.setupEndpoint();
        }
    }, 100);
}

function removeResponseFromEndpoint(code, event) {
    event.stopPropagation(); if (!currentEndpoint) return; const endpoint = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method];
    if (!endpoint || !endpoint.responses?.[code]) return;
    if (confirm('Remove response with code ' + code + '?')) { delete endpoint.responses[code]; displayResponsesForEndpoint(endpoint.responses); } // Corrected confirm
}

function addHeaderToResponse(responseCode) {
    if (!currentEndpoint) return; const response = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]?.responses?.[responseCode]; if (!response) return;
    if (!response.headers) response.headers = {};
    const headerName = prompt("Enter new header name:", "X-Custom-Header");
    if (!headerName || response.headers[headerName]) { alert(headerName ? 'Header "' + headerName + '" already exists.' : "Invalid header name."); return; } // Corrected alert
    response.headers[headerName] = { type: 'string', description: 'New header description' };
    displayHeadersForResponse(responseCode, response.headers);
    // Setup auto-save for newly added header fields
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupEndpoint) {
            window.AutoSave.setupEndpoint();
        }
    }, 100);
}

function removeHeaderFromResponse(responseCode, headerName, event) {
    event.stopPropagation(); if (!currentEndpoint) return; const response = swaggerDoc.paths[currentEndpoint.path]?.[currentEndpoint.method]?.responses?.[responseCode];
    if (!response || !response.headers?.[headerName]) return;
    if (confirm('Remove header "' + headerName + '" from response ' + responseCode + '?')) { delete response.headers[headerName]; displayHeadersForResponse(responseCode, response.headers); } // Corrected confirm
}

function addPropertyToModel() {
    if (!currentModel) return; const model = swaggerDoc.definitions[currentModel]; if (!model) return;
    if (!model.properties) model.properties = {};
    const newPropName = prompt("Enter new property name:", 'newProperty' + Object.keys(model.properties).length); // Corrected prompt
    if (!newPropName || model.properties[newPropName]) { alert(newPropName ? 'Property "' + newPropName + '" already exists.' : "Invalid property name."); return; } // Corrected alert
    model.properties[newPropName] = { type: 'string', description: '' };
    displayPropertiesForModel(model.properties, model.required || []);
    // Setup auto-save for newly added property fields
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupModel) {
            window.AutoSave.setupModel();
        }
    }, 100);
}

function removePropertyFromModel(propName, event) {
    event.stopPropagation(); if (!currentModel) return; const model = swaggerDoc.definitions[currentModel];
    if (!model || !model.properties?.[propName]) return;
    if (confirm('Remove property "' + propName + '"?')) { // Corrected confirm
        delete model.properties[propName];
        if (model.required) { const reqIndex = model.required.indexOf(propName); if (reqIndex > -1) model.required.splice(reqIndex, 1); }
        displayPropertiesForModel(model.properties, model.required || []);
    }
}

function addSecurityRequirementToEndpoint() {
        const endpoint = swaggerDoc.paths[currentEndpoint.path][currentEndpoint.method];
        if (!endpoint.security) endpoint.security = [];
        // Prompt for scheme name or offer a dropdown of existing securityDefinitions
        const availableSchemes = Object.keys(swaggerDoc.securityDefinitions || {});
        let newSchemeName = prompt('Enter security scheme name (must exist in Security Definitions):', availableSchemes.length > 0 ? availableSchemes[0] : 'newSchemeName');
        
        if (!newSchemeName) {
            alert("Scheme name cannot be empty.");
            return;
        }
        newSchemeName = newSchemeName.trim();
        if (!swaggerDoc.securityDefinitions[newSchemeName]) {
            alert(`Scheme "${newSchemeName}" not found in Security Definitions. Please define it first.`);
            return;
        }

        // Check if this scheme already exists for this endpoint
        if (endpoint.security.some(req => req.hasOwnProperty(newSchemeName))) {
            alert(`Security requirement for scheme "${newSchemeName}" already exists on this endpoint.`);
            return;
        }

        endpoint.security.push({ [newSchemeName]: [] });
        displaySecurityForEndpoint(endpoint.security);
        // Setup auto-save for newly added security requirement fields
        setTimeout(() => {
            if (window.AutoSave && window.AutoSave.setupEndpoint) {
                window.AutoSave.setupEndpoint();
            }
        }, 100);
    }

function removeSecurityRequirementFromEndpoint(index, event) {
        event.stopPropagation();
        const endpoint = swaggerDoc.paths[currentEndpoint.path][currentEndpoint.method];
        if (endpoint.security && endpoint.security[index]) {
            if (confirm('Remove this security requirement?')) {
                endpoint.security.splice(index, 1);
                displaySecurityForEndpoint(endpoint.security);
            }
        }
    }

function addSecurityDefinition() {
    const name = prompt('Enter new security definition name (e.g., apiKey, myOAuth2):');
    if (!name || !/^[a-zA-Z0-9_.-]+$/.test(name)) { alert('Invalid name.'); return; }
    if (swaggerDoc.securityDefinitions[name]) { alert('Security definition "' + name + '" already exists.'); return; } // Corrected alert
    swaggerDoc.securityDefinitions[name] = { type: 'apiKey', name: 'X-API-KEY', in: 'header', description: '' };
    updateSecurityDefinitionsList(el('searchInput').value);
    selectSecurityDefinition(name);
}

function deleteCurrentSecurityDefinition() {
    if (!currentSecurityDefinitionName) { alert("No security definition selected."); return; }
    const name = currentSecurityDefinitionName;
    if (confirm('Delete security definition "' + name + '"?')) { // Corrected confirm
        delete swaggerDoc.securityDefinitions[name]; currentSecurityDefinitionName = null;
        updateSecurityDefinitionsList(el('searchInput').value);
        el('securityDefinitionEditor').innerHTML = `<div id="securityDefinitionEditorContent"><p style="text-align: center; color: #999; padding: 40px;">Security definition deleted.</p></div>`;
        selectInfoTab();
    }
}

function addScopeToDefinition() {
    if (!currentSecurityDefinitionName) return; const secDef = swaggerDoc.securityDefinitions[currentSecurityDefinitionName];
    if (!secDef || secDef.type !== 'oauth2') { alert("Scopes only apply to OAuth2 definitions."); return; }
    if (!secDef.scopes) secDef.scopes = {};
    const scopeKey = prompt("Enter scope name (e.g., read:pets):");
    if (!scopeKey) { alert("Scope name cannot be empty."); return; }
    if (secDef.scopes[scopeKey]) { alert('Scope "' + scopeKey + '" already exists.'); return; } // Corrected alert
    const scopeDesc = prompt('Enter description for scope "' + scopeKey + '":', "Description for " + scopeKey); // Corrected prompt
    secDef.scopes[scopeKey] = scopeDesc || "";
    displayScopesForDefinition(secDef.scopes);
    // Setup auto-save for newly added scope fields
    setTimeout(() => {
        if (window.AutoSave && window.AutoSave.setupSecurityDefinition) {
            window.AutoSave.setupSecurityDefinition();
        }
    }, 100);
}

function removeScopeFromUIDefinition(buttonElement, scopeKey) {
    if (confirm('Remove scope "' + scopeKey + '"? Changes apply on save.')) { buttonElement.closest('.scope-item').remove(); } // Corrected confirm
}

function collectEndpointDataFromForm() {
    const data = { parameters: [], responses: {}, security: [] };
    data.summary = el('endpointSummary').value; data.description = el('endpointDescription').value; data.operationId = el('endpointOperationId').value;
    data.tags = arrayFromString(el('endpointTags').value); data.consumes = arrayFromString(el('endpointConsumes').value); data.produces = arrayFromString(el('endpointProduces').value);
    qa('#parametersList .parameter-item').forEach((item, index) => {
        const param = { name: el('paramName' + index).value, in: el('paramIn' + index).value, description: el('paramDescription' + index).value, required: el('paramRequired' + index).checked };
        const paramType = el('paramType' + index).value;
        if (param.in === 'body') {
            param.schema = {}; const schemaRef = el('paramSchema' + index).value; if (schemaRef) param.schema.$ref = schemaRef; else param.schema.type = 'object';
        } else {
            param.type = paramType;
            if (el('param' + index + 'DefaultGroup').style.display !== 'none' && el('paramDefault' + index).value) { const dv = el('paramDefault' + index).value; if (param.type === 'integer' || param.type === 'number') param.default = Number(dv); else if (param.type === 'boolean') param.default = dv.toLowerCase() === 'true'; else param.default = dv;}
            if (el('param' + index + 'ExampleGroup').style.display !== 'none' && el('paramExample' + index).value) param['x-example'] = el('paramExample' + index).value;
            if (el('param' + index + 'FormatGroup').style.display !== 'none' && el('param' + index + 'Format').value) param.format = el('param' + index + 'Format').value;
            if (el('param' + index + 'StringValidationsGroup').style.display !== 'none') { if(el('paramPattern' + index).value) param.pattern = el('paramPattern' + index).value; if(el('paramMinLength' + index).value) param.minLength = parseInt(el('paramMinLength' + index).value); if(el('paramMaxLength' + index).value) param.maxLength = parseInt(el('paramMaxLength' + index).value); }
            if (el('param' + index + 'NumberValidationsGroup').style.display !== 'none') { if(el('paramMinimum' + index).value) param.minimum = parseFloat(el('paramMinimum' + index).value); if(el('paramMaximum' + index).value) param.maximum = parseFloat(el('paramMaximum' + index).value); if(el('paramExclusiveMinimum' + index).checked) param.exclusiveMinimum = true; if(el('paramExclusiveMaximum' + index).checked) param.exclusiveMaximum = true; if(el('paramMultipleOf' + index).value) param.multipleOf = parseFloat(el('paramMultipleOf' + index).value); }
            if (paramType === 'array') {
                param.items = {}; const itemsType = el('param' + index + 'ItemsType').value;
                if (itemsType === 'schema') { const ref = el('param' + index + 'ItemsModelSelect').value; if (ref) param.items.$ref = ref; else param.items.type = 'object'; }
                else { param.items.type = itemsType; if (el('param' + index + 'ItemsFormatGroup').style.display !== 'none' && el('param' + index + 'ItemsFormat').value) param.items.format = el('param' + index + 'ItemsFormat').value;}
                if (el('param' + index + 'ItemsEnumGroup').style.display !== 'none') { const en = collectEnumValuesFromChips('param' + index + 'ItemsEnumContainer'); if (en.length > 0) param.items.enum = en; }
                if (el('param' + index + 'ItemsUniqueItems').checked) param.items.uniqueItems = true;
                param.collectionFormat = el('param' + index + 'CollectionFormat').value || 'csv';
            } else if (paramType === 'string' && el('param' + index + 'EnumGroup').style.display !== 'none') { const en = collectEnumValuesFromChips('param' + index + 'EnumContainer'); if (en.length > 0) param.enum = en; }
        }
        data.parameters.push(param);
    });    qa('#responsesList .response-item').forEach(item => {
        const code = item.id.substring('responseItem'.length);
        const respDescEl = el('responseDescription' + code);
        const resp = { description: respDescEl ? respDescEl.value : '', headers: {} };
        const schemaRefEl = el('responseSchema' + code);
        const schemaRef = schemaRefEl ? schemaRefEl.value : '';
        if (schemaRef) resp.schema = { $ref: schemaRef };
        qa('#responseHeadersContainer' + code + ' .header-item').forEach(hItem => {
            // Correctly extract header name from hItem.id
            const hName = hItem.id.substring(('headerItem_' + code + '_').length);
            const hDescEl = el('headerDescription_' + code + '_' + hName);
            const hTypeEl = el('headerType_' + code + '_' + hName);
            const hDef = { 
                description: hDescEl ? hDescEl.value : '', 
                type: hTypeEl ? hTypeEl.value : 'string' 
            };
            if (hDef.type === 'array') {
                const hItemsTypeEl = el('headerItemsType_' + code + '_' + hName);
                hDef.items = { type: hItemsTypeEl ? hItemsTypeEl.value : 'string' };
                 // Potentially add format for array items if it's part of your UI for header items
                const hItemsFormatEl = el('headerItemsFormat_' + code + '_' + hName); // Assuming such an ID exists
                if (hItemsFormatEl && hItemsFormatEl.value) {
                    hDef.items.format = hItemsFormatEl.value;
                }
            } else {
                // Potentially add format for simple type headers if it's part of your UI
                const hFormatEl = el('headerFormat_' + code + '_' + hName); // Assuming such an ID exists
                if (hFormatEl && hFormatEl.value) {
                    hDef.format = hFormatEl.value;
                }
            }
            if(hName) { // Ensure hName is not empty
                 resp.headers[hName] = hDef;
            }
        }); 
        if(Object.keys(resp.headers).length === 0) delete resp.headers;
        data.responses[code] = resp;
    });
    qa('#securityList .security-scheme-item').forEach((itemElement, index) => {
        const req = {};
        const schemeNameInput = el('securitySchemeName' + index);
        
        if (schemeNameInput && schemeNameInput.value) {
            const schemeName = schemeNameInput.value.trim();
            if (schemeName) {
                const secDef = swaggerDoc.securityDefinitions[schemeName];
                if (secDef) {
                    const scopes = (secDef.type === 'oauth2') 
                                    ? collectEnumValuesFromChips('securitySchemeScopesContainer' + index) 
                                    : [];
                    req[schemeName] = scopes;
                    data.security.push(req);
                } else {
                    console.warn(`Security definition "${schemeName}" not found for endpoint security requirement at index ${index}. This requirement will be skipped.`);
                }
            }
        }
    });
    return data;
}

function saveEndpoint() {
    if (!currentEndpoint) { alert("No endpoint selected."); return; }
    const { path: oldPath, method: oldMethod } = currentEndpoint;
    const newPath = el('endpointPathInput').value, newMethod = el('endpointMethodInput').value.toLowerCase();
    if (!newPath || !/^\//.test(newPath)) { alert("Invalid path."); return; } // Corrected regex
    if (!newMethod || !httpMethods.includes(newMethod)) { alert("Invalid HTTP method."); return; }
    const endpointData = collectEndpointDataFromForm();
    if (oldPath !== newPath || oldMethod !== newMethod) {
        if (swaggerDoc.paths[newPath]?.[newMethod]) { alert('Error: Endpoint ' + newMethod.toUpperCase() + ' ' + newPath + ' already exists.'); el('endpointPathInput').value = oldPath; el('endpointMethodInput').value = oldMethod; return; } // Corrected alert
        delete swaggerDoc.paths[oldPath][oldMethod]; if (Object.keys(swaggerDoc.paths[oldPath]).length === 0) delete swaggerDoc.paths[oldPath];
        if (!swaggerDoc.paths[newPath]) swaggerDoc.paths[newPath] = {};
    }
    swaggerDoc.paths[newPath][newMethod] = endpointData; currentEndpoint = { path: newPath, method: newMethod };
    updateEndpointsList(el('searchInput').value); selectEndpoint(newPath, newMethod); alert('Endpoint saved!');
}

function saveModel() {
    if (!currentModel) { alert("No model selected."); return; }
    const oldModelName = currentModel, newModelName = el('modelNameInput').value;
    const modelDescription = el('modelDescription').value;
    if (!newModelName || !/^[a-zA-Z0-9_.-]+$/.test(newModelName)) { alert('Invalid model name.'); el('modelNameInput').value = oldModelName; return; }
    const properties = {}, required = [];    qa('#propertiesList .property-item').forEach(item => {
        const propIdInput = q('input[id^="propName_"]', item); // Find the input field for the property name
        if (!propIdInput) return;
        const originalPropName = propIdInput.id.substring('propName_'.length); // This is the original name used for other element IDs
        const currentPropName = propIdInput.value;  // This is the current (potentially edited) name

        if (!currentPropName) return;

        const prop = { description: el('propDescription_' + originalPropName).value }; 
        if (el('propRequired_' + originalPropName).checked) required.push(currentPropName);
        
        const propType = el('propType_' + originalPropName).value;
        if (propType === 'schema') { 
            const ref = el('propModelSelect_' + originalPropName).value; 
            if (ref) prop.$ref = ref; else prop.type = 'object'; 
        } else {
            prop.type = propType;
            if (el('prop_' + originalPropName + 'DefaultGroup').style.display !== 'none' && el('propDefault_' + originalPropName).value !== '') {
                const defaultValue = el('propDefault_' + originalPropName).value;
                if (propType === 'number' || propType === 'integer') {
                    prop.default = propType === 'integer' ? parseInt(defaultValue) : parseFloat(defaultValue);
                } else if (propType === 'boolean') {
                    prop.default = defaultValue.toLowerCase() === 'true';
                } else {
                    prop.default = defaultValue;
                }
            }
            if (el('prop_' + originalPropName + 'ExampleGroup').style.display !== 'none' && el('propExample_' + originalPropName).value !== '') {
                const exampleValue = el('propExample_' + originalPropName).value;
                if (propType === 'number' || propType === 'integer') {
                    prop.example = propType === 'integer' ? parseInt(exampleValue) : parseFloat(exampleValue);
                } else if (propType === 'boolean') {
                    prop.example = exampleValue.toLowerCase() === 'true';
                } else {
                    prop.example = exampleValue;
                }
            }
            if (el('prop_' + originalPropName + 'FormatGroup').style.display !== 'none' && el('prop_' + originalPropName + 'Format').value) prop.format = el('prop_' + originalPropName + 'Format').value;
            if (el('prop_' + originalPropName + 'StringValidationsGroup').style.display !== 'none') { if(el('propPattern_' + originalPropName).value) prop.pattern = el('propPattern_' + originalPropName).value; if(el('propMinLength_' + originalPropName).value) prop.minLength = parseInt(el('propMinLength_' + originalPropName).value); if(el('propMaxLength_' + originalPropName).value) prop.maxLength = parseInt(el('propMaxLength_' + originalPropName).value); }
            if (el('prop_' + originalPropName + 'NumberValidationsGroup').style.display !== 'none') { if(el('propMinimum_' + originalPropName).value) prop.minimum = parseFloat(el('propMinimum_' + originalPropName).value); if(el('propMaximum_' + originalPropName).value) prop.maximum = parseFloat(el('propMaximum_' + originalPropName).value); }
            if (propType === 'array') {
                prop.items = {}; const itemsType = el('propItemsType_' + originalPropName).value;
                if (itemsType === 'schema') { const ref = el('propItemsModelSelect_' + originalPropName).value; if (ref) prop.items.$ref = ref; else prop.items.type = 'object'; }
                else { prop.items.type = itemsType; if (el('propItems_' + originalPropName + 'FormatGroup').style.display !== 'none' && el('propItems_' + originalPropName + 'Format').value) prop.items.format = el('propItems_' + originalPropName + 'Format').value; }
                if (el('propItems_' + originalPropName + 'EnumGroup').style.display !== 'none') { const en = collectEnumValuesFromChips('propItemsEnumContainer_' + originalPropName); if (en.length > 0) prop.items.enum = en; }
            } else if (propType === 'string' && el('prop_' + originalPropName + 'EnumGroup').style.display !== 'none') { const en = collectEnumValuesFromChips('prop_' + originalPropName + 'EnumContainer'); if (en.length > 0) prop.enum = en; }
        }
        properties[currentPropName] = prop;
    });
    const modelData = { type: 'object', description: modelDescription, properties: properties }; if (required.length > 0) modelData.required = required;
    if (oldModelName !== newModelName) {
        if (swaggerDoc.definitions[newModelName]) { alert('Error: Model "' + newModelName + '" already exists.'); el('modelNameInput').value = oldModelName; return; } // Corrected alert
        delete swaggerDoc.definitions[oldModelName]; console.warn('Model "' + oldModelName + '" renamed to "' + newModelName + '". $refs not updated.'); // Corrected console.warn
    }
    swaggerDoc.definitions[newModelName] = modelData; currentModel = newModelName;
    updateModelsList(el('searchInput').value); selectModel(newModelName); alert('Model saved!');
}

function saveSecurityDefinition() {
    if (!currentSecurityDefinitionName) { alert("No security definition selected."); return; }
    const oldDefName = currentSecurityDefinitionName, newDefName = el('securityDefNameInput').value;
    const type = el('securityDefType').value, description = el('securityDefDescription').value;
    if (!newDefName || !/^[a-zA-Z0-9_.-]+$/.test(newDefName)) { alert('Invalid name.'); el('securityDefNameInput').value = oldDefName; return; }
    const defData = { type: type, description: description };
    if (type === 'apiKey') { defData.name = el('apiKeyName').value; defData.in = el('apiKeyIn').value; }
    else if (type === 'oauth2') {
        defData.flow = el('oauth2Flow').value;
        if (['implicit', 'accessCode'].includes(defData.flow) && el('oauth2AuthUrl')) defData.authorizationUrl = el('oauth2AuthUrl').value;
        if (['password', 'application', 'accessCode'].includes(defData.flow) && el('oauth2TokenUrl')) defData.tokenUrl = el('oauth2TokenUrl').value;
        defData.scopes = {}; qa('#scopesList .scope-item').forEach(item => { const keyIn = q('input[id^="scopeKey_"]', item), descIn = q('input[id^="scopeDesc_"]', item); if (keyIn?.value && descIn) defData.scopes[keyIn.value] = descIn.value; });
    }
    if (oldDefName !== newDefName) {
        if (swaggerDoc.securityDefinitions[newDefName]) { alert('Error: Security definition "' + newDefName + '" already exists.'); el('securityDefNameInput').value = oldDefName; return; } // Corrected alert
        delete swaggerDoc.securityDefinitions[oldDefName]; console.warn('Security def "' + oldDefName + '" renamed to "' + newDefName + '". Refs not updated.'); // Corrected console.warn
    }
    swaggerDoc.securityDefinitions[newDefName] = defData; currentSecurityDefinitionName = newDefName;
    updateSecurityDefinitionsList(el('searchInput').value); selectSecurityDefinition(newDefName); alert('Security definition saved!');
}


async function normalizeAndResaveAll() {
    // 1. Store current view/state
    const originalState = history.state ? JSON.parse(JSON.stringify(history.state)) : { type: 'info' };
    const searchInputValue = el('searchInput').value;

    alert('Normalizing and re-saving all items. This may take a moment and the UI will update rapidly. Please wait...');

    // Disable auto-save and history pushes during this process
    const autoSaveDebounce = window.AutoSave.config.enableDebounce;
    const autoSaveBlur = window.AutoSave.config.enableOnBlur;
    window.AutoSave.config.enableDebounce = false;
    window.AutoSave.config.enableOnBlur = false;
    isBatchProcessing = true;

    try {
        // 2. Process General Info
        saveGeneralInfoSilent();

        // 3. Process Endpoints
        const allEndpoints = [];
        for (const path in swaggerDoc.paths) {
            for (const method in swaggerDoc.paths[path]) {
                allEndpoints.push({ path, method });
            }
        }
        for (const ep of allEndpoints) {
            _selectEndpointUI(ep.path, ep.method); // Sets currentEndpoint, renders editor
            // await new Promise(resolve => setTimeout(resolve, 5)); // Small delay for DOM, if needed
            saveEndpointSilent(); // Uses collectEndpointDataFromForm on the rendered editor
        }

        // 4. Process Models
        const allModels = Object.keys(swaggerDoc.definitions || {});
        for (const modelName of allModels) {
            _selectModelUI(modelName); // Sets currentModel, renders editor
            // await new Promise(resolve => setTimeout(resolve, 5));
            saveModelSilent();
        }

        // 5. Process Security Definitions
        const allSecDefs = Object.keys(swaggerDoc.securityDefinitions || {});
        for (const defName of allSecDefs) {
            _selectSecurityDefinitionUI(defName); // Sets currentSecurityDefinitionName, renders editor
            // await new Promise(resolve => setTimeout(resolve, 5));
            saveSecurityDefinitionSilent();
        }

    } catch (error) {
        console.error("Error during normalization:", error);
        alert("An error occurred during normalization. Check console for details.");
    } finally {
        // Restore settings
        window.AutoSave.config.enableDebounce = autoSaveDebounce;
        window.AutoSave.config.enableOnBlur = autoSaveBlur;
        isBatchProcessing = false;

        // Restore original view without adding to history from the loop
        // _restoreUIFromState will call the appropriate _selectXYZUI function
        // which in turn handles UI update and auto-save setup for the restored view.
        isRestoringStateFromPop = true; 
        _restoreUIFromState(originalState);
        
        // Explicitly replace history state to the original one
        let originalHash = 'info';
        let originalTitle = "General Info";
        if (originalState.type === 'endpoint') {
            originalHash = `endpoint/${encodeURIComponent(originalState.path)}/${originalState.method}`;
            originalTitle = `Endpoint: ${originalState.method.toUpperCase()} ${originalState.path}`;
        } else if (originalState.type === 'model') {
            originalHash = `model/${encodeURIComponent(originalState.name)}`;
            originalTitle = `Model: ${originalState.name}`;
        } else if (originalState.type === 'securityDefinition') {
            originalHash = `securityDefinition/${encodeURIComponent(originalState.name)}`;
            originalTitle = `Security Definition: ${originalState.name}`;
        }
        replaceStateInHistory(originalState, originalTitle, originalHash);
        isRestoringStateFromPop = false;
        
        updateBackButtonState();

        el('searchInput').value = searchInputValue;
        filterLists();

        alert('Normalization complete! Swagger data has been re-processed.');
    }
}