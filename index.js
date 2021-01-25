"use strict";
/**
 

*/

(function(exports) {

exports.init = init;
	
/**
 * plain stuff
 */
exports.exist = exist;
exports.get = get;
exports.post = post;
exports.put = put;
exports.delete = dj_delete;
exports.append = append;
exports.merge = merge;


exports.sha256 = _intern_hash256;

/**
 * admin exports
 */
exports.keys = keys;
exports.metadata = metadata;
exports.location = location;
exports.time = get_system_time;
exports.uuid = get_uuid; 
exports.guid = get_guid; 
exports.user = get_user; 

/**
 * getters and setters
 */
exports.setHost = setHost;
exports.getHost = getHost;
exports.setPort = setPort;
exports.getPort = getPort;
exports.setSecret = setSecret;
exports.getSecret = getSecret;
exports.setUser = setUser;
exports.getUser = getUser;
exports.setPassword = setPassword;
exports.getPassword = getPassword;
exports.getHttps = getHttps;
exports.setHttps = setHttps;
exports.setSettings = setSettings;

var _base_url = "http://localhost:7273/";
var _host = "localhost";
var _port = "7273";
var _secret = "djonair";
var _user = "can";
var _password = "can";
var _https = false;

function isBrowser() {
	return (typeof window !== 'undefined');
}

function isNode() {
	return (typeof process === 'object');
}

var http = undefined;
var https = undefined;
var crypto = undefined;
var StringDecoder = undefined;
if( isNode() ) {
    http = require('http');
    https = require('https');
    crypto = require('crypto');
    StringDecoder = require('string_decoder').StringDecoder;
}

function _intern_hash256( string ) {
    var rv = undefined;
    if( isNode() ) {
        rv = crypto.createHash('sha256').update(string).digest('hex');
    } else if( isBrowser() ) {
        rv = Sha256.hash( string, {} );
    } else {
        throw "sha256 for 'not browser' and 'not node' not implemented yet!";
    }
    return rv;
}

function authentication_code( url ) {
	if( url.startsWith( _base_url ) ) 	url = url.substring( _base_url.length );
	if( !url.startsWith("/") ) 			url = "/" + url;
    if( url.endsWith("?") ) url = url.substr( 0, url.length -1 );
    
	var authentication_string = _secret + "-" + _user + "-" + _password + "-" + url;
	var authentication_hash = _intern_hash256(authentication_string);
	
	return _user + ";" + authentication_hash;
}

function init( base_url ) {
	_base_url = base_url;
}

/**
 *               _           _                                                       _     
 *              | |         (_)                                                     | |    
 *      __ _  __| |_ __ ___  _ _ __     ___ ___  _ __ ___  _ __ ___   __ _ _ __   __| |___ 
 *     / _` |/ _` | '_ ` _ \| | '_ \   / __/ _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
 *    | (_| | (_| | | | | | | | | | | | (_| (_) | | | | | | | | | | | (_| | | | | (_| \__ \
 *     \__,_|\__,_|_| |_| |_|_|_| |_|  \___\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
 *                                                                                         
 */
function keys( regular_expression, callback ) {
	_admin_call( "keys", regular_expression, callback );
}

function metadata( key, callback ) {
	_admin_call( "metadata", key, callback );
}

function location( key, callback ) {
	_admin_call( "location", key, callback );
}

function get_system_time( callback ) {
	_admin_call( "time", undefined, callback );
}

function get_uuid( callback ) {
	_admin_call( "uuid", undefined, callback );
}

function get_guid( callback ) {
	_admin_call( "guid", undefined, callback );
}

function get_user( callback ) {
	_admin_call( "user", undefined, callback );
}

function _admin_call( call, parameters, callback ) {
	var url = "/cmd/" + call;
	if( parameters !== undefined ) {
		url += "?" + encodeURI( parameters );	
	}

	http_call( url, "GET", undefined, callback );
}


/**
 *                _                       _                   _           _      _      _       
 *               | |                     | |                 | |         | |    | |    | |      
 *      __ _  ___| |_     _ __   ___  ___| |_     _ __  _   _| |_      __| | ___| | ___| |_ ___ 
 *     / _` |/ _ \ __|   | '_ \ / _ \/ __| __|   | '_ \| | | | __|    / _` |/ _ \ |/ _ \ __/ _ \
 *    | (_| |  __/ |_ _  | |_) | (_) \__ \ |_ _  | |_) | |_| | |_ _  | (_| |  __/ |  __/ ||  __/
 *     \__, |\___|\__( ) | .__/ \___/|___/\__( ) | .__/ \__,_|\__( )  \__,_|\___|_|\___|\__\___|
 *      __/ |        |/  | |                 |/  | |             |/                             
 *     |___/             |_|                     |_|                                            
*/

function http_call( url, method, data, callback ) {
    if( isBrowser() ) {
        http_call_browser( url, method, data, callback );
    } else if( isNode() ) {
        http_call_node( url, method, data, callback ) ;
    } else {
        throw "undefined engine to call http";
    }
}

function http_call_browser(url, method, data, callback) {
    var signature = authentication_code( url );
    var ajax_options = {
							url: _base_url + url,

							// merge and append should go with 'dj-override-method'
                            type: method === "APPEND" || method === "MERGE" ? "PUT" : method,
                            contentType: 'application/json',
                            contentType: false,
                            processData: false,
                            dataType: 'text',

                            beforeSend: function(request) {
										request.setRequestHeader("authenticate", signature);
										request.setRequestHeader('dj-override-method',method);
                                      },

                            success: function(response) {
                                    callback( "ok", true );

                            },
                            error: function( response ) {
                                    callback( "error", false );
                            }
					};

    if( data !== undefined && ["PUT","POST","APPEND","MERGE"].indexof( method ) > -1 ) {
        ajax_options.data = data;
    }
    $.ajax( ajax_options );
}

function http_call_node(url, method, data, callback) {
	var signature = authentication_code( url );
    var http_options = { hostname: _host, 
                        port: _port, 
                        method: method,
                        path: url,
                        headers: {  'authenticate': signature,
                                    'Content-Type': 'application/json'},
                        timeout: 60000
                        
					};

	// merge and append should go with 'dj-override-method'
	if( method === "APPEND" || method === "MERGE" ) {
		http_options.method = "POST";
		http_options.headers['dj-override-method'] = method;
	}

    var protocol = undefined;
    if( _https ) {
        protocol = https;
    } else {
        protocol = http;
    }
    var req = protocol.request( http_options, function( response ) {
        var bodyChunks = [];
        var response_http_code = response.statusCode;

        response.on( "data", function( chunk ) {
            bodyChunks.push( chunk );
        });
        response.on( "end", function() {
            var body = Buffer.concat(bodyChunks);
            var decoder = new StringDecoder('utf8');
            var json_data = decoder.write(body);

            if( response_http_code === 200 ) {
                callback( "ok", JSON.parse( json_data ) );
            } else {
                var error_msg = undefined;
                try {
                    error_msg = JSON.parse( json_data );
                } catch( e ) {
                    error_msg = json_data;
                };
                callback( "error", error_msg );
            }
        });
    });

    req.on('socket', function (socket) {
        socket.setTimeout(http_options.timeout);  
        socket.on('timeout', function() {
            req.abort();
        });
    });

    req.on( "error", function( e ) {
        callback( "error", e );
    });

    /**
     * if there is data to send, ... fire it :)
     */
    if( data!==undefined ) {
        req.write( data );
    }

    req.end();
}
function exist( key, callback ) {

	var url = "/js/" + key + "?" + encodeURI( ". | length" );
	var signature = authentication_code( url );

	$.ajax( {
    			url: _base_url + url,
    			type: 'get',
		      	contentType: 'application/json',
				contentType: false,
    			processData: false,

    			beforeSend: function(request) {
											    request.setRequestHeader("authenticate", signature);
											  },

				dataType: 'text',

    			success: function(response) {
    				callback( true );

		        },
		        error: function( response ) {
		        	callback( false );
		        }
    		} );
}

function post( key, command, value, callback ) {

	if( value === undefined ) {

	} else if( typeof value === "string" ) {
		value = value;
	} else if( typeof value === "object" ) {
		value = JSON.stringify( value );
	} else {
		/**
		 * nothing
		 */

	}
        

	var url = "/js/" + key;
        if( command !== undefined && command.length > 0 ) {
            url += "?" + encodeURIComponent( command );
        }

        http_call( url, "POST", value, callback );

}

function put( key, command, value, callback ) {

	if( value === undefined ) {

	} else if( typeof value === "string" ) {
		value = value;
	} else if( typeof value === "object" ) {
		value = JSON.stringify( value );
	} else {
		/**
		 * nothing
		 */

	}

	var url = "/js/" + key;
	/**
	 * if there is a command, then place it here !
         */
        if( command !== undefined && command.length > 0 ) {
            url += "?" + encodeURIComponent( command );
        }

        http_call( url, "PUT", value, callback );


}

function append( key, command, value, callback ) {

    if( value === undefined ) {

    } else if( typeof value === "string" ) {
            value = value;
    } else if( typeof value === "object" ) {
            value = JSON.stringify( value );
    } else {
            /**
             * nothing
             */

    }

    var url = "/js/" + key;
    /**
     * if there is a command, then place it here !
     */
    if( command !== undefined && command.length > 0 ) {
    	url += "?" + encodeURIComponent( command );
    }

    http_call( url, "APPEND", value, callback );
}

function merge( key, command, value, callback ) {

    if( value === undefined ) {

    } else if( typeof value === "string" ) {
            value = value;
    } else if( typeof value === "object" ) {
            value = JSON.stringify( value );
    } else {
            /**
             * nothing
             */

    }

    var url = "/js/" + key;
    /**
     * if there is a command, then place it here !
     */
    if( command !== undefined && command.length > 0 ) {
    	url += "?" + encodeURIComponent( command );
    }

    http_call( url, "MERGE", value, callback );
}

function get( key, command, callback ) {

	if( command === undefined || command === null) {
		command = "";
	} else if( typeof command === "string" ) {
		command = command;
	} else if( typeof value === "object" ) {
		command = JSON.stringify( command );
	} else {
		/**
		 * nothing
		 */
	}

	var url = "/js/" + key;
	if( command!==undefined && command!=="" ) {
		url += "?" + encodeURIComponent(command);
	}

        http_call( url, "GET", undefined, callback );

}

function dj_delete( key, command, callback ) {
    if( command === undefined || command === null) {
		command = "";
	} else if( typeof command === "string" ) {
		command = command;
	} else if( typeof value === "object" ) {
		command = JSON.stringify( command );
	} else {
		/**
		 * nothing
		 */
	}
	var url = "/js/" + key;

        http_call( url, "DELETE", command, callback );

}


/**
 *                _   _                                   _   _                
 *               | | | |                   _             | | | |               
 *      __ _  ___| |_| |_ ___ _ __ ___   _| |_   ___  ___| |_| |_ ___ _ __ ___ 
 *     / _` |/ _ \ __| __/ _ \ '__/ __| |_   _| / __|/ _ \ __| __/ _ \ '__/ __|
 *    | (_| |  __/ |_| ||  __/ |  \__ \   |_|   \__ \  __/ |_| ||  __/ |  \__ \
 *     \__, |\___|\__|\__\___|_|  |___/         |___/\___|\__|\__\___|_|  |___/
 *      __/ |                                                                  
 *     |___/                                                                   
 */
function setHost(value) { _host = value; setBaseUrl();};
function setPort(value) { _port = value; setBaseUrl();};
function setSecret(value) { _secret = value; };
function setUser(value) { _user = value; };
function setPassword(value) { _password = value; };
function setHttps(value) { _https = value; }; // boolean
function getHost() { return _host; };
function getPort() { return _port; };
function getSecret() { return _secret; };
function getUser() { return _user; };
function getPassword() { return _password; };
function getHttps() { return _https; };
function setBaseUrl() { _base_url = "http://" + _host + ":" + _port + "/"; };
function setSettings( options ) {
    if( options.host !== undefined ) _host = options.host;
    if( options.port !== undefined ) _port = options.port;
    if( options.secret !== undefined ) _secret = options.secret;
    if( options.user !== undefined ) _user = options.user;
    if( options.password !== undefined ) _password = options.password;
    setBaseUrl();
}

})(typeof exports === 'undefined'? this['dj']={}: exports);


class Sha256 {

    /**
     * Generates SHA-256 hash of string.
     *
     * @param   {string} msg - (Unicode) string to be hashed.
     * @param   {Object} [options]
     * @param   {string} [options.msgFormat=string] - Message format: 'string' for JavaScript string
     *   (gets converted to UTF-8 for hashing); 'hex-bytes' for string of hex bytes ('616263' ≡ 'abc') .
     * @param   {string} [options.outFormat=hex] - Output format: 'hex' for string of contiguous
     *   hex bytes; 'hex-w' for grouping hex bytes into groups of (4 byte / 8 character) words.
     * @returns {string} Hash of msg as hex character string.
     */
    static hash(msg, options) {
        const defaults = { msgFormat: 'string', outFormat: 'hex' };
        const opt = Object.assign(defaults, options);

        // note use throughout this routine of 'n >>> 0' to coerce Number 'n' to unsigned 32-bit integer

        switch (opt.msgFormat) {
            default: // default is to convert string to UTF-8, as SHA only deals with byte-streams
            case 'string':   msg = utf8Encode(msg);       break;
            case 'hex-bytes':msg = hexBytesToString(msg); break; // mostly for running tests
        }

        // constants [§4.2.2]
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 ];

        // initial hash value [§5.3.3]
        const H = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];

        // PREPROCESSING [§6.2.1]

        msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

        // convert string msg into 512-bit blocks (array of 16 32-bit integers) [§5.2.1]
        const l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
        const N = Math.ceil(l/16);  // number of 16-integer (512-bit) blocks required to hold 'l' ints
        const M = new Array(N);     // message M is N×16 array of 32-bit integers

        for (let i=0; i<N; i++) {
            M[i] = new Array(16);
            for (let j=0; j<16; j++) { // encode 4 chars per integer (64 per block), big-endian encoding
                M[i][j] = (msg.charCodeAt(i*64+j*4+0)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16)
                        | (msg.charCodeAt(i*64+j*4+2)<< 8) | (msg.charCodeAt(i*64+j*4+3)<< 0);
            } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
        }
        // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
        // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
        // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
        const lenHi = ((msg.length-1)*8) / Math.pow(2, 32);
        const lenLo = ((msg.length-1)*8) >>> 0;
        M[N-1][14] = Math.floor(lenHi);
        M[N-1][15] = lenLo;


        // HASH COMPUTATION [§6.2.2]

        for (let i=0; i<N; i++) {
            const W = new Array(64);

            // 1 - prepare message schedule 'W'
            for (let t=0;  t<16; t++) W[t] = M[i][t];
            for (let t=16; t<64; t++) {
                W[t] = (Sha256.σ1(W[t-2]) + W[t-7] + Sha256.σ0(W[t-15]) + W[t-16]) >>> 0;
            }

            // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
            let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

            // 3 - main loop (note '>>> 0' for 'addition modulo 2^32')
            for (let t=0; t<64; t++) {
                const T1 = h + Sha256.Σ1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
                const T2 =     Sha256.Σ0(a) + Sha256.Maj(a, b, c);
                h = g;
                g = f;
                f = e;
                e = (d + T1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) >>> 0;
            }

            // 4 - compute the new intermediate hash value (note '>>> 0' for 'addition modulo 2^32')
            H[0] = (H[0]+a) >>> 0;
            H[1] = (H[1]+b) >>> 0;
            H[2] = (H[2]+c) >>> 0;
            H[3] = (H[3]+d) >>> 0;
            H[4] = (H[4]+e) >>> 0;
            H[5] = (H[5]+f) >>> 0;
            H[6] = (H[6]+g) >>> 0;
            H[7] = (H[7]+h) >>> 0;
        }

        // convert H0..H7 to hex strings (with leading zeros)
        for (let h=0; h<H.length; h++) H[h] = ('00000000'+H[h].toString(16)).slice(-8);

        // concatenate H0..H7, with separator if required
        const separator = opt.outFormat=='hex-w' ? ' ' : '';

        return H.join(separator);

        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

        function utf8Encode(str) {
            try {
                return new TextEncoder().encode(str, 'utf-8').reduce((prev, curr) => prev + String.fromCharCode(curr), '');
            } catch (e) { // no TextEncoder available?
                return unescape(encodeURIComponent(str)); // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
            }
        }

        function hexBytesToString(hexStr) { // convert string of hex numbers to a string of chars (eg '616263' -> 'abc').
            const str = hexStr.replace(' ', ''); // allow space-separated groups
            return str=='' ? '' : str.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        }
    }



    /**
     * Rotates right (circular right shift) value x by n positions [§3.2.4].
     * @private
     */
    static ROTR(n, x) {
        return (x >>> n) | (x << (32-n));
    }


    /**
     * Logical functions [§4.1.2].
     * @private
     */
    static Σ0(x) { return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); }
    static Σ1(x) { return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); }
    static σ0(x) { return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x>>>3);  }
    static σ1(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x>>>10); }
    static Ch(x, y, z)  { return (x & y) ^ (~x & z); }          // 'choice'
    static Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); } // 'majority'

}
