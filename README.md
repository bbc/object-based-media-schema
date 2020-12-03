# Object Based Media Schema

The Object Based Media Schema was created by BBC R&D to model interactive and personalised media experiences.

## Schema Documentation
To learn about the schema, see [docs/SCHEMA.md](docs/SCHEMA.md).

## Validating your json against the schema
To validate an experience against the schema:
```
npx object-based-media-schema <schema> <file> [<file> ...]
```

## Installing the library
To install the library
```
npm install --save object-based-media-schema
```

### Using the library
To validate an object based media experience JSON against the schema from your own code:

```
const { validator } = require('object-based-media-schema');
const schema = 'experience/without_production';

validator(schema, storyJson)
    .catch(validationErrors => {
        /* handle errors */
    })
    .then( /* success! */);
```

The first parameter to validator is the path to a part of the schema, without the .json file extension.
The second parameter, storyJson, should be a javascript object representing the experience that you've parsed from JSON.

It's possible to validate individual elements of schema json against individual parts of the model by specifying an alternative path.
See the contents of the schemas directory for more details.

Note: The object-based media schema includes a production domain that is not required for story modelling or playback.
In the example above, the schema specified excludes this production domain. This is probably what you want.

## Using the repo

You might want to learn about the schema through the interactive schemaUI, or just explore in more depth.
The github repo bundles everything you need to do so.

### Prerequisites
```
git clone git@github.com:bbc/object-based-media-schema
cd object-based-media-schema
npm install
```

### SchemaUI
To launch the interactive schema UI you'll need to run the following

```
npm run schemaUI
```

You should see the following. Visit the URL in your browser to explore.
```
Started JSON Schema Viewer on port 5000. Visit http://localhost:5000/
```

### Validation
To validate a file against the schema using the repo, you'll need to run the following

```
./bin/validate <schema> <file> [<file> ...]
```
eg
```
./bin/validate story/full samples/sample.story.json
```

### Testing the samples
To test the samples against the schema you'll need to run the following:

```
npm run test
```

If everything's ok, you should expect the following output.

```
👍   samples/sample.experience_without_production.json
👍   samples/sample.experience_with_production.json
👍   samples/sample.story.json
👍   samples/sample.narrative_element.json
👍   samples/sample.representation_collection.json
👍   samples/sample.representation.json
👍   samples/sample.placeholder_representation.json
👍   samples/sample.asset_collection.json
👍   samples/sample.production.json
👍   samples/sample.scene.json
👍   samples/sample.shot.json
👍   samples/sample.rush.json
👍   samples/sample.production_package.json
👍   samples/sample.shooting_schedule.json
```

### Folder Structure
- bin - code for validating instances of the schema
- docs - documentation
- lib - contains validate.js, the object based media schema validation library
- samples - example instances of the schema
- schemas - contains the JSON schema files that are described above
- schemas-graphql - contains a GraphQL schema version of the JSON schema
- schemaUI - code for viewing the JSON schema in an interactive web UI

## How to contribute

Please read our [CONTRIBUTING.md](.github/CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) if you are interested in making contributions.

## Licence

The Object Based Media Schema is available to everyone under the terms of the GNU General Public Licence v3.0. Take a look at the [licence file](LICENSE) and [COPYING](../COPYING) for more details.

## Thanks

The Object Based Media Schema has been developed over several years and has been informed by conversations with many people. Thanks to contributors Andy Brown, Matthew Brooks, Andy Jones, Thomas Preece, Mike Armstrong, Max Leonard, Jasmine Cox, Dan Strong, Chris Northwood, and the many other colleagues from BBC R&D, BBC D+E and beyond whose ideas have contributed to this work.