const Validator = require('jsonschema').Validator;

const version = require('../package.json').version;

const SCHEMA_VERSION = version;

const resolveReferences = validator => new Promise((resolve, reject) => {
    function importNextSchema() {
        const unresolvedSchema = validator.unresolvedRefs.shift();
        if (!unresolvedSchema) {
            resolve();
        } else {
            try {
                const type = unresolvedSchema.split('#')[0];
                const schema = require(`../schemas/${type}`)
                validator.addSchema(schema, type);
                importNextSchema();
            } catch (err) {
                reject(err)
            }
        }
    }
    importNextSchema();
});


const loadSchema = type => {
    const schema = require(`../schemas/${type}.json`)
    const validator = new Validator();
    validator.addSchema(schema, `${type}.json`);
    return resolveReferences(validator)
        .then(() => ({ validator, schema }));
};


const validateObject = (schema, object) => loadSchema(schema)
    .then(({ validator, schema }) => validator.validate(object, schema))
    .then(
        result => result.valid ? Promise.resolve() : Promise.reject(result.errors),
        e => Promise.reject([e])
    );

module.exports = {
    validator: validateObject,
    SCHEMA_VERSION,
};
