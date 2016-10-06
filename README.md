# Jodo
**JavaScript Object Database Operation**  
Minimalist Lightweight in-process JSON File Database

Jodo Creates a minimal simple database out of a normal object or JSON file. Any Jodo Database is an instance of Object and caches all data in memory.

--------------------------------

### Quick Start
#### Installation
**NPM:** `$ npm install jodo`
 or **Manual:** Just copy the `Jodo.js` file to your work directory.

#### Usage
```
const Jodo = require('Jodo');
var db = Jodo('./flat_file.json');
```
or Initiate like this:
```
var db = Jodo({x:{},y:{},...});
```
It's Alive!
```
// Search and Manipulate:
var result = db.any('username','jacky',true);
var manipulated = db.users.any("age",">",20, true, function(val, entry){
    // In-process Manipulating Data
    entry['is_teen'] = true;
});

// saving changes
db.save();
```


### API
Creating a Jodo Database-Object:  
* `jodo('path/to/file.json')`
* `jodo(object)`   
both returns jodo-object, with these properties:

    * jodo-object`.path` String (path of flat json file)

    * jodo-object`.save()` saves current state of database-object to json file.
    * jodo-object`.save('Optional_Path/to/new_file.json')` Saves current state of object to new json file and returns `{path:'...', status:{}}` on successful or `false` on failed saving. *Note: 2nd Argument (if !null & string) is `root` for path resolving (Default: `process.cwd`). Example: `db.save('test.json','../')`. It Makes Files Not Directories.*  
    
    * jodo-object`.any()`  
    Search Function. parameters:
        * field [String] where (field name) to search
        * condition [String] _optional (!=,>=,... Default: ==)
        * value [String] what to search
        * Case Insensitivity [Boolean] Default: true
        * Manipulator_function(value, entry) // Get called for each found value and entry. returning *not undefined* means change value to what's returned.
    * nested-jodo-subfields`.any()` // to the dark deeps   
    Exmple: `db.any();  db.users.any();  db.users.persians.any();`

#### Events
* `saved` : Successfully.
* `found` : Means `any()` has results.  
Note: Jodo has `db.on('event',...)` & `db.once('event',...)` functions for listening [only]; for more advanced jobs use:  `db._EventEmitter_.on('event',...)`

### License
MIT  
Copyright © 2016 Morteza H. Golkar
