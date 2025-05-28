// js/state.js
let swaggerDoc = { swagger: '2.0', info: { title: 'Sample API', version: '1.0.0', description: 'This is a sample API' }, host: 'api.example.com', basePath: '/v1', schemes: ['https', 'http'], paths: {}, definitions: {}, securityDefinitions: {} };
let currentEndpoint = null;
let currentModel = null;
let currentSecurityDefinitionName = null;
let navigationHistory = [];
let currentHistoryIndex = -1;
let isRestoringStateFromPop = false;
let isBatchProcessing = false; // Added for normalization process