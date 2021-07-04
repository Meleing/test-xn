/* eslint-disable */
const beautify = require('js-beautify').js_beautify;

import * as _ from 'lodash';

const ts = require('./util');

const normalizeName = (id: any) => {
    return id.replace(/\.|\-|\{|\}|\s/g, '_');
};

const getPathToMethodName = (m: any, path: any) => {
    if (path === '/' || path === '') {
        return m;
    }

    // Clean url path for requests ending with '/'
    const cleanPath = path.replace(/\/$/, '');

    let segments = cleanPath.split('/').slice(1);
    segments = _.transform(segments, (result: any, segment: any) => {
        if (segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = `by${segment[1].toUpperCase()}${segment.substring(2, segment.length - 1)}`;
        }
        result.push(segment);
    });
    const result = _.camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

const getViewForSwagger2 = function(opts: any, type: any) {
    const { swagger } = opts;
    const methods: any = [];
    const authorizedMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'COPY',
        'HEAD',
        'OPTIONS',
        'LINK',
        'UNLIK',
        'PURGE',
        'LOCK',
        'UNLOCK',
        'PROPFIND',
    ];
    const data: any = {
        isNode: type === 'node' || type === 'react',
        isES6: opts.isES6 || type === 'react',
        description: swagger.info.description,
        isSecure: swagger.securityDefinitions !== undefined,
        moduleName: opts.moduleName,
        className: opts.className,
        imports: opts.imports,
        domain:
            swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath
                ? `${swagger.schemes[0]}://${swagger.host}${swagger.basePath.replace(/\/+$/g, '')}`
                : '',
        methods: [],
        enums: [],
        definitions: [],
        isSecureToken: undefined,
        isSecureApiKey: undefined,
        isSecureBasic: undefined,
    };

    _.forEach(swagger.paths, (api: any, path: any) => {
        let globalParams: any = [];
        /**
         * @param {Object} op - meta data for the request
         * @param {string} m - HTTP method name - eg: 'get', 'post', 'put', 'delete'
         */
        _.forEach(api, (op: any, m: any) => {
            if (m.toLowerCase() === 'parameters') {
                globalParams = op;
            }
        });

        _.forEach(api, (op: any, m: any) => {
            const M = m.toUpperCase();
            if (M === '' || !authorizedMethods.includes(M)) {
                return;
            }
            const secureTypes = [];
            if (swagger.securityDefinitions !== undefined || op.security !== undefined) {
                const mergedSecurity = _.merge([], swagger.security, op.security).map((security: any) => {
                    return Object.keys(security);
                });
                if (swagger.securityDefinitions) {
                    for (const sk in swagger.securityDefinitions) {
                        if (mergedSecurity.join(',').indexOf(sk) !== -1) {
                            secureTypes.push(swagger.securityDefinitions[sk].type);
                        }
                    }
                }
            }
            let methodName = op.operationId ? normalizeName(op.operationId) : getPathToMethodName(m, path);
            // Make sure the method name is unique
            if (methods.indexOf(methodName) !== -1) {
                let i = 1;
                while (true) {
                    if (methods.indexOf(methodName + i) !== -1) {
                        i++;
                    } else {
                        methodName += i;
                        break;
                    }
                }
            }
            methods.push(methodName);

            const method: any = {
                path,
                className: opts.className,
                methodName,
                method: M,
                isGET: M === 'GET',
                isPOST: M === 'POST',
                summary: op.description || op.summary,
                externalDocs: op.externalDocs,
                isSecure: swagger.security !== undefined || op.security !== undefined,
                isSecureToken: secureTypes.includes('oauth2'),
                isSecureApiKey: secureTypes.includes('apiKey'),
                isSecureBasic: secureTypes.includes('basic'),
                parameters: [],
                headers: [],
                response: undefined,
            };
            if (method.isSecure && method.isSecureToken) {
                data.isSecureToken = method.isSecureToken;
            }
            if (method.isSecure && method.isSecureApiKey) {
                data.isSecureApiKey = method.isSecureApiKey;
            }
            if (method.isSecure && method.isSecureBasic) {
                data.isSecureBasic = method.isSecureBasic;
            }
            const produces = op.produces || swagger.produces;
            if (produces) {
                method.headers.push({
                    name: 'Accept',
                    value: `'${produces
                        .map((value: any) => {
                            return value;
                        })
                        .join(', ')}'`,
                });
            }

            const consumes = op.consumes || swagger.consumes;
            if (consumes) {
                method.headers.push({
                    name: 'Content-Type',
                    value: '\'' + consumes + '\'',
                });
            }

            const response = _.values(op.responses)[0];
            method.response = ts.convertType(response, data);
            let params = [];
            if (_.isArray(op.parameters)) {
                params = op.parameters;
            }
            params = params.concat(globalParams);

            method.camel = op.camelCase;
            // const camel = params.find((p: any) => p.name === 'CamelCase');
            // if (camel) {
            //   _.remove(params, camel);
            //   method.camel = true;
            // }
            _.forEach(params, (parameter: any) => {
                // Ignore parameters which contain the x-exclude-from-bindings extension
                if (parameter['x-exclude-from-bindings'] === true) {
                    return;
                }

                // Ignore headers which are injected by proxies & app servers
                // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
                if (parameter['x-proxy-header'] && !data.isNode) {
                    return;
                }
                if (_.isString(parameter.$ref)) {
                    const segments = parameter.$ref.split('/');
                    parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2]];
                }
                parameter.camelCaseName = _.camelCase(parameter.name);
                if (parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if (parameter.in === 'body') {
                    parameter.isBodyParameter = true;
                } else if (parameter.in === 'path') {
                    parameter.isPathParameter = true;
                } else if (parameter.in === 'query') {
                    if (parameter['x-name-pattern']) {
                        parameter.isPatternType = true;
                        parameter.pattern = parameter['x-name-pattern'];
                    }
                    parameter.isQueryParameter = true;
                } else if (parameter.in === 'header') {
                    parameter.isHeaderParameter = true;
                } else if (parameter.in === 'formData') {
                    parameter.isFormParameter = true;
                }
                parameter.tsType = ts.convertType(parameter);
                parameter.cardinality = parameter.required ? '' : '?';
                method.parameters.push(parameter);

                if (parameter.tsType.isEnum) {
                    data.enums.push({
                        name: methodName + parameter.camelCaseName,
                        description: parameter.description,
                        tsType: parameter.tsType,
                    });
                }
            });
            data.methods.push(method);
        });
    });

    _.forEach(swagger.definitions, (definition: any, name: any) => {
        data.definitions.push({
            name: name.replace(/[\[,]/g, '_').replace(/\]/g, ''),
            description: definition.description,
            tsType: ts.convertType(definition, swagger),
        });
    });

    return data;
};

const getViewForSwagger1 = function(opts: any, type: any) {
    const { swagger } = opts;
    const data: any = {
        isNode: type === 'node' || type === 'react',
        isES6: opts.isES6 || type === 'react',
        description: swagger.description,
        moduleName: opts.moduleName,
        className: opts.className,
        domain: swagger.basePath ? swagger.basePath : '',
        methods: [],
    };
    swagger.apis.forEach((api: any) => {
        api.operations.forEach((op: any) => {
            if (op.method === 'OPTIONS') {
                return;
            }
            const method: any = {
                path: api.path,
                className: opts.className,
                methodName: op.nickname,
                method: op.method,
                isGET: op.method === 'GET',
                isPOST: op.method.toUpperCase() === 'POST',
                summary: op.summary,
                parameters: op.parameters,
                headers: [],
            };

            if (op.produces) {
                const headers: any = [];
                headers.value = [];
                headers.name = 'Accept';
                headers.value.push(
                    op.produces
                        .map((value: any) => {
                            return "'" + value + "'";
                        })
                        .join(', ')
                );
                method.headers.push(headers);
            }

            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach((parameter: any) => {
                parameter.camelCaseName = _.camelCase(parameter.name);
                if (parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if (parameter.paramType === 'body') {
                    parameter.isBodyParameter = true;
                } else if (parameter.paramType === 'path') {
                    parameter.isPathParameter = true;
                } else if (parameter.paramType === 'query') {
                    if (parameter['x-name-pattern']) {
                        parameter.isPatternType = true;
                        parameter.pattern = parameter['x-name-pattern'];
                    }
                    parameter.isQueryParameter = true;
                } else if (parameter.paramType === 'header') {
                    parameter.isHeaderParameter = true;
                } else if (parameter.paramType === 'form') {
                    parameter.isFormParameter = true;
                }
            });
            data.methods.push(method);
        });
    });
    return data;
};

module.exports.getViewForSwagger = getViewForSwagger2;
