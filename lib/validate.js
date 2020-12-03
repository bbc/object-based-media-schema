const fs = require('fs');
const path = require('path');
const Validator = require('jsonschema').Validator;

const SCHEMA_DIR = path.resolve(__dirname, '..', 'schemas');

const version = require('../package.json').version;

const SCHEMA_VERSION = version;


const loadJson = filename => new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (file_err, data) => {
        if (file_err) {
            reject(file_err);
        } else {
            try {
                resolve(JSON.parse(data));
            } catch (json_err) {
                reject(json_err);
            }
        }
    });
});

const resolveReferences = validator => new Promise((resolve, reject) => {
    function importNextSchema() {
        const unresolvedSchema = validator.unresolvedRefs.shift();
        if (!unresolvedSchema) {
            resolve();
        } else {
            const type = unresolvedSchema.split('#')[0];
            loadJson(path.join(SCHEMA_DIR, `${type}`))
                .then(schema => {
                    validator.addSchema(schema, type);
                    importNextSchema();
                })
                .catch(reject);
        }
    }
    importNextSchema();
});

const loadSchema = type => loadJson(path.join(SCHEMA_DIR, `${type}.json`))
    .then(schema => {
        const validator = new Validator();
        validator.addSchema(schema, `${type}.json`);
        return resolveReferences(validator)
            .then(() => ({ validator, schema }));
    });

const validateObject = (schema, object) => loadSchema(schema)
    .then(({ validator, schema }) => validator.validate(object, schema))
    .then(
        result => result.valid ? Promise.resolve() : Promise.reject(result.errors),
        e => Promise.reject([e])
    );

module.exports = {
    validator: validateObject,
    SCHEMA_VERSION: SCHEMA_VERSION,
};
