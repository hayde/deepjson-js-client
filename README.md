# deepjson-js-client

The NodeJS and browser client for the deepjson server.

## connection settings

You migth set them single, but you although might set them in a block. ```dj.setHost("localhost")```, ```dj.setPort(7273)```, ...

I personally prefere the block.

```
var dj = require('deepjson-js-client');

dj.setSettings( { host: "localhost", 
                  port: 7273, 
                  secret: "the_secret_to_hide", 
                  user: "users_name", 
                  password: "users_password",
                  https: false
                });

```

## Basic calls

There are mainly two call blocks: 

* Data calls: to request and modify data
* system calls: to get system or data meta information

### Basic Data Calls

#### post

Post data is only possible, if the key itself is not existing before. so post will not override data (not in standard mode).

```
var dj = require('deepjson-js-client');

dj.setSettings( { host: "localhost", port: 7273, secret: "the_secret_to_hide", user: "users_name", password: "users_password", https: false });

var value_to_store = { counter: 0, deeper: { value: "the value you look for", meta: "more data"}, list: [0,1,3,4,"hallo"] };

dj.post( 'your.key', null, value_to_store, function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```

#### get

```
var dj = require('deepjson-js-client');

dj.setSettings( { host: "localhost", port: 7273, secret: "the_secret_to_hide", user: "users_name", password: "users_password", https: false });

dj.get( 'your.key', ".deeper.value", function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```

#### put

If you now want to modify existing data, you should do it by using the put method

```
var dj = require('deepjson-js-client');

dj.setSettings( { host: "localhost", port: 7273, secret: "the_secret_to_hide", user: "users_name", password: "users_password", https: false });

dj.put( 'your.key', ".deeper.value", "the value I changed!", function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```

#### append

you could always append data to an existing structure (array or object).

```
var dj = require('deepjson-js-client');

dj.append( 'your.key', ".list", "a new entry", function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```

#### delete

and you can delete data inside a structure, or even a complete key

Delete just an object in the data

```
var dj = require('deepjson-js-client');

dj.delete( 'your.key', ".count", function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```

Delete the entire key.

```
var dj = require('deepjson-js-client');

dj.delete( 'your.key', undefined, function( result, response ) {

    if( result === "error" ) {
        console.log( "error: " + JSON.stringify( response ) );
    
    } else {
        console.log( "ok: " + JSON.stringify( response ) );
    
    }

});
```


### Basic System Calls


## Extended Calls (Script Calls)

So, now let's come to the fancy stuff of DeepJson. You can inject JavaScript calls into your data call, to have this script running on server side to reduce the traffic load.

## Helpers

### Sha256

Since it is crucial to have a hash sha256 available for some stuff, we simply exported the internal functions for further use.

```
var dj = require('deepjson-js-client');

// should be: ace42d55959ceeb9f434707465ad1f210af9d778e13030f6abc1e093673762ab
var sha = dj.sha256( "what ever you want to use it for" );
```

