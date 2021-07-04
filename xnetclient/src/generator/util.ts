/* eslint-disable no-lonely-if */
/* eslint-disable no-multi-assign */
import * as _ from 'lodash';

/**
 * Recursively converts a swagger type description into a typescript type, i.e., a model for our mustache
 * template.
 *
 * Not all type are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @returns a recursive structure representing the type, which can be used as a template model.
 */
function convertType(swaggerType: any, swagger?: any): any {
    const typespec: any = {
        description: swaggerType.description,
        isEnum: false,
    };

    if (swaggerType.hasOwnProperty('schema')) {
        return convertType(swaggerType.schema);
    }
    if (_.isString(swaggerType.$ref)) {
        typespec.tsType = 'ref';
        typespec.target = swaggerType.$ref
            .substring(swaggerType.$ref.lastIndexOf('/') + 1)
            // eslint-disable-next-line no-useless-escape
            .replace(/[\[,]/g, '_')
            .replace(/\]/g, '');
    } else if (swaggerType.hasOwnProperty('enum')) {
        typespec.tsType = swaggerType.enum
            .map((str: any) => {
                return JSON.stringify(str);
            })
            .join(' | ');
        typespec.isAtomic = true;
        typespec.isEnum = true;
    } else if (swaggerType.type === 'string') {
        typespec.target = typespec.tsType = 'string';
    } else if (swaggerType.type === 'number' || swaggerType.type === 'integer') {
        typespec.tsType = 'number';
    } else if (swaggerType.type === 'boolean') {
        typespec.tsType = 'boolean';
    } else if (swaggerType.type === 'array') {
        typespec.tsType = 'array';
        typespec.elementType = convertType(swaggerType.items);
    } else {
        /* If (swaggerType.type === 'object') */
        // Remaining types are created as objects
        if (swaggerType.minItems >= 0 && swaggerType.hasOwnProperty('title') && !swaggerType.$ref) {
            typespec.tsType = 'any';
        } else {
            typespec.target = typespec.tsType = 'object';
            typespec.properties = [];
            if (swaggerType.allOf) {
                _.forEach(swaggerType.allOf, (ref: any) => {
                    if (ref.$ref) {
                        const refSegments = ref.$ref.split('/');
                        const name = refSegments[refSegments.length - 1];
                        _.forEach(swagger.definitions, (definition: any, definitionName: any) => {
                            if (definitionName === name) {
                                const property = convertType(definition, swagger);
                                Array.prototype.push.apply(typespec.properties, property.properties);
                            }
                        });
                    } else {
                        const property = convertType(ref);
                        Array.prototype.push.apply(typespec.properties, property.properties);
                    }
                });
            }

            _.forEach(swaggerType.properties, (propertyType: any, propertyName: any) => {
                const property = convertType(propertyType, swagger);
                property.name = propertyName;

                property.optional = true;
                if (swaggerType.required && swaggerType.required.indexOf(propertyName) !== -1) {
                    property.optional = false;
                }

                typespec.properties.push(property);
            });
        }
    }
    /* Else {
      // type unknown or unsupported... just map to 'any'...
      typespec.tsType = 'any';
      } */

    // Since Mustache does not provide equality checks, we need to do the case distinction via explicit booleans
    typespec.isRef = typespec.tsType === 'ref';
    typespec.isObject = typespec.tsType === 'object';
    typespec.isArray = typespec.tsType === 'array';
    typespec.isAtomic = typespec.isAtomic || _.includes(['string', 'number', 'boolean', 'any'], typespec.tsType) || typespec.isObject;

    return typespec;
}

module.exports.convertType = convertType;
