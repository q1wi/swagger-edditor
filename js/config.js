// js/config.js
const commonTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
const commonFormats = {
    string: ['byte', 'binary', 'date', 'date-time', 'password', 'email', 'uuid', 'uri', 'hostname', 'ipv4', 'ipv6'],
    number: ['float', 'double'],
    integer: ['int32', 'int64']
};
const httpMethods = ['get','post','put','delete','patch','options','head'];
const securityDefinitionTypes = ['apiKey', 'oauth2', 'basic'];
const oauth2Flows = ['implicit', 'password', 'application', 'accessCode'];
const apiKeyInOptions = ['header', 'query'];
