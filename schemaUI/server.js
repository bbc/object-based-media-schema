#!/usr/bin/env node

const express = require('express');
const serveIndex = require('serve-index');
const handlebars = require('express-handlebars');
const path = require('path');
const dir = require('node-dir');

const app = express();

console.log("Starting JSON Schema Viewer")

const SCHEMA_FOLDER_FULL = path.join(__dirname, `../schemas`);
const SAMPLES_FOLDER_FULL = path.join(__dirname, `../samples`);
const SERVER_PORT = 5000;

app.set('port', SERVER_PORT);
app.set('views', path.join(__dirname, `./views`))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
        'active': function(activeSchemaName, schemaName, activeSchemaType, schemaType) {
            if (activeSchemaName == schemaName && activeSchemaType === schemaType) {
                return "active";
            } else {
                return "";
            }
        }
    }
}));
app.set('view engine', 'handlebars');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const getDefinitions = (schema) => {
    // This function is required because at time of writing json-editor wouldn't
    // load any schema refs that were not under an object property.
    // i.e. "allOf": [{ "$ref": "/core.json#/definitions/full_base" }, ... would not load
    // This function loads all subschema and puts the definitions in the master schema
    // and replaces all external refs to be local
    let schemaString = JSON.stringify(schema)
    const pattern = /\"\$ref\"\:\"([^\"]*)\"/g;  // Alternatively, "new RegExp('t(e)(s)t', 'g');"
    let match
    let newDefinitions = {}
    let foundNewSchema = false
    while (match = pattern.exec(schemaString)) {
        // Do something with the match (["test", "e", "s"]) here...
        const ref = match[1]
        if(
            ref.substring(0, 1) === '#' ||
            ref.split('#')[0] === "/expression.json"
        ) {
            if(ref === "#") {
                throw new Error("Encountered a file referencing itself with ref: '#'. Json-Editor cannot handle this ")
            }
        } else if(ref.indexOf("#/definitions") !== -1) {
            const refFileName = ref.split('#')[0];
            const refSchemaLocation = path.join(SCHEMA_FOLDER_FULL, refFileName)
            const refSchema = require(refSchemaLocation);

            // TODO: Add in some way of making sure we don't have same named definitions
            // in different files
            // Only add definitions in which haven't been seen before
            // otherwise we get into loop of dereferencing the same definitions
            newDefinitions = {
                ...newDefinitions,
                ...refSchema.definitions,
            }
            foundNewSchema = true
        } else {
            const refFileName = ref.split('#')[0];
            const refSchemaLocation = path.join(SCHEMA_FOLDER_FULL, refFileName)
            let refSchema = require(refSchemaLocation);

            // Merge refSchema and existing schema
            const replaceRegex = new RegExp(`{[^\{]*${escapeRegExp(match[0])}[^\}]*}`, 'g');
            const refSchemaString = JSON.stringify(refSchema)

            schemaString = schemaString.replace(replaceRegex, refSchemaString)
            foundNewSchema = true
        }
    }
    schemaString = schemaString.replace(/\"\$ref\"\:\"[^#]*#\/definitions/g, "\"\$ref\"\:\"#/definitions")
    let returnSchema = JSON.parse(schemaString)
    if(!returnSchema.definitions) {
        returnSchema.definitions = {}
    }
    // Only add definitions in which haven't been seen before
    // otherwise we get into loop of dereferencing the same definitions
    returnSchema.definitions = {
        ...newDefinitions,
        ...returnSchema.definitions,
    }
    return [returnSchema, foundNewSchema];
}

const renderSchemaPage = (schemaOptions, req, res) => {
    let schema;
    let example
    try {
        schema = require(schemaOptions.schemaLocation);
    } catch(err) {
        schema = {}
    }
    try {
        example = require(schemaOptions.schemaExample);
    } catch(err) {
        example = undefined
    }
    let repeat = false
    do {
        [schema, repeat] = getDefinitions(schema)
    } while (repeat)
    res.render('index', {
        layout: false,
        schemaName: schemaOptions.schemaName,
        schemaType: schemaOptions.schemaType,
        schemaExample: JSON.stringify(example),
        schema: JSON.stringify(schema),
    })
}

// This endpoint is in no way safe and should only be run locally
app.get('/', (req, res) => {
    res.render('index', {
        layout: false,
        schemaName: "",
        schemaType: "",
        schema: {},
    })
})

// This endpoint is in no way safe and should only be run locally
app.get('/schema/experience/', (req, res) => {
    let schemaLocation = path.join(SCHEMA_FOLDER_FULL, `experience/without_production.json`)
    let schemaExample = ""
    let schemaOptions = {
        schemaLocation,
        schemaExample,
        schemaName: "experience",
        schemaType: "without_production",
    }
    renderSchemaPage(schemaOptions, req, res);
})

// This endpoint is in no way safe and should only be run locally
app.get('/schema/:schema_name/:schema_type/', (req, res) => {
    let schemaLocation
    let schemaExample = path.join(SAMPLES_FOLDER_FULL, `sample.${req.params.schema_name}.json`)
    if(req.params.schema_type === "full") {
        schemaLocation = path.join(SCHEMA_FOLDER_FULL, req.params.schema_name, `/full.json`)
    } else if(req.params.schema_type === "update") {
        schemaLocation = path.join(SCHEMA_FOLDER_FULL, req.params.schema_name, `/update.json`)
    }
    let schemaOptions = {
        schemaLocation,
        schemaExample,
        schemaName: req.params.schema_name,
        schemaType: req.params.schema_type,
    }
    renderSchemaPage(schemaOptions, req, res);
})

app.use(express.static(SCHEMA_FOLDER_FULL), serveIndex(SCHEMA_FOLDER_FULL, { icons: true }));

app.listen(app.get('port'));

console.log("Started JSON Schema Viewer on port 5000. Visit http://localhost:5000/")
