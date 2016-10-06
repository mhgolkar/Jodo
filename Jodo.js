/*
//  .____________________________________________.
//  |            ____.          .___             |
//  |           |    | ____   __| _/____         |
//  |           |    |/  _ \ / __ |/  _ \        |
//  |       /\__|    (  <_> ) /_/ (  <_> )       |
//  |       \________|\____/\____ |\____/        |
//  |                            \/              |
//  .____________________________________________.
//  |   JavaScript Object Database Operation     | 
//  '--------------------------------------------'
//  Jodo
//  1.1.1
//  Morteza H. Golkar
//  License: MIT
*/

'use strict';
// Requirments
const fs = require('fs');
const P = require('path');
const E = require('events');

// Jodo ...........
var Jodo = function(xjx){
    // Generating New Jodo (Jason Object Database Operator)
        // From file or Object ?
    if(typeof xjx == 'string'){
        var document = fs.readFileSync(xjx, "utf8");
        var db = document ? JSON.parse(document) : false;
    } else if(typeof xjx == 'object'){
        var db = xjx ? xjx : false;
    };
    Object.defineProperty(db, "_EventEmitter_", { enumerable: false, value: new E.EventEmitter() });
    Object.defineProperty(db, "on", { enumerable: false, value: function(x,y,z) { db._EventEmitter_.on(x,y,z); } });
    Object.defineProperty(db, "once", { enumerable: false, value: function(x,y,z) { db._EventEmitter_.once(x,y,z); } });
    // jodo helper Functions
        // The Magic 'any' Function:
    const any_func = function(_where, _cond, _what, _ci, _callback){
        // Mastering Optional Arguments
        var where, cond, what, ci, callback;
        where = arguments[0];
        for (var ar = 1; ar<arguments.length ;ar++){
            if( ['==','!=','<','>','<=','>=','===','!==',].includes(arguments[ar]) ){
                cond = arguments[ar];
            } else if(typeof arguments[ar] == 'function') {
                var callback = arguments[ar];
            } else {
                if(!cond) cond = "==";
                if(ar <= 2) {
                    if(!what) what = arguments[ar];
                };
                ci = (arguments[ar] === false) ? arguments[ar] : true;
            };
        };
        if(ci === null || ci === undefined) ci = true;
        // Define Search Function
        var search = function(x){
            if (Object.prototype.toString.call( x ) === '[object Array]'){
                // x is Array
                var result = [];
                x.forEach(function(w){
                    var res = search(w);
                    if (res) result = result.concat(res);
                });
                return ((result.length !== 0)? result: null);
            } else if (typeof x == 'object') {
                // x is Object
                for(var w in x){
                    if(typeof x[w] == 'object'){
                        var result = {};
                        for (var w in x){
                            var res = search(x[w]);
                            if (res) result[w] = res;                                            
                        }
                        return ( (Object.keys(result).length !== 0) ? result : null );
                    } else {
                        function condor(x,y){
                            //Test for condition ('==','!=','<','>','<=','>=','===','!==')
                            switch(cond){
                                case "==" : return (x == y);  break;
                                case "!=" : return (x != y);  break;
                                case "<"  : return (x < y);   break;
                                case ">"  : return (x > y);   break;
                                case "<=" : return (x <= y);  break;
                                case ">=" : return (x >= y);  break;
                                case "===": return (x === y); break;
                                case "!==": return (x !== y); break;
                                default   : return (x == y);  break;
                            };
                        };
                        if(ci){
                            // Case Insensetive
                            if(typeof what == 'string' && typeof x[w] == 'string'){
                                var wt = what.toLowerCase();
                                var xw = x[w].toLowerCase();
                            } else { var xw = x[w]; var wt = what; };
                            if(
                                (w.toLowerCase() == where.toLowerCase())
                                && condor(xw, wt)
                              ){
                                // Found
                                if(callback){
                                    var crs = callback(x[w], x);
                                    if (crs != undefined){ x[w] = crs };
                                };
                                return x;
                            }
                        } else {
                            // Case Sensetive                                        
                            if( where == w && condor(x[where], what) ){
                                // Found
                                if(callback){
                                    var crs = callback(x[where], x);
                                    if (crs != undefined){ x[where] = crs };
                                };
                                return x;
                            } else return null;
                        };
                    };
                };
            } else {
                // x is Unsearchable (String Etc...)
                return null;
            };
        };
        // Taking Action on any():
        var box = this;
        if (Object.prototype.toString.call( box ) === '[object Array]'){
            // Array
            var result = [];
            box.forEach(function(x){
                var res = search(x);
                if (res) result = result.concat( res );
            });
            if(result.length > 0) db._EventEmitter_.emit('found', result);
            return result;
        } else if (typeof box == 'object') {
            // object
            var result = {};
            for (var x in box){
                var res = search(box[x]);
                if (res) result[x] = res;
            }
            if(Object.keys(result).length > 0) db._EventEmitter_.emit('found', result);
            return result;                            
        };
    };
    // Generating Jodo Database :
    if( db ){
        Object.defineProperties(db, {
            path:{
                enumerable: false,
                writable: false,
                configurable: false,
                value: (typeof xjx == "string") ? xjx : null
            },
            queue:{
                enumerable: false,
                configurable: false,
                value: []
            },
            save:{
                enumerable: false,
                configurable: false,
                writable: false,
                value: function(new_path, _root){
                    var root = (_root && typeof _root == 'string') ? _root : process.cwd();
                    var current = JSON.stringify(this);
                    if(new_path){
                        var absolute = P.join(root, new_path);
                        try{
                            fs.writeFileSync(absolute, current, "utf8");
                            return { 
                                path: absolute,
                                status: fs.statSync(absolute)
                            };
                        } catch(x){return false};
                    } else {
                        this.queue.push(current);
                        var selfob = this;
                        current = null;
                        var savySave = function(){
                            if(selfob.queue.length > 0){
                                var absolute = P.join(root, selfob.path);
                                var toSave = selfob.queue.shift();
                                fs.writeFile(absolute, toSave, "utf8", function(err){
                                    if(err){
                                        selfob.queue.unshift(toSave);
                                    } else {
                                        try{
                                            var stuty = { path: absolute, status: fs.statSync(absolute) };
                                            db._EventEmitter_.emit('saved', stuty);
                                        } catch(x){};
                                    };
                                    return savySave();
                                });
                            };   
                        };
                        savySave();
                    };
                }
            },
            any:{
                enumerable: false,
                configurable: false,
                writable: false,
                value: any_func.bind(db)
            }
        });
        // Helper Functions (Properties) For Subfields of Database
        function definer(obj){
            if( Object.prototype.toString.call( obj ) === '[object Array]' ){
                // it's array
                obj.forEach(function(ent){
                    if(typeof ent == 'object' && obj[ent] != null){
                        if( ent.length > 0 || Object.keys(ent).length !== 0){
                            definer(ent);
                            Object.defineProperty(ent, 'any', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: any_func.bind(ent)
                            });
                        };
                    };                        
                });
            } else {
                // it's Object
                for(var ent in obj){
                    if(typeof obj[ent] == 'object' && obj[ent] != null){
                        if( obj[ent].length > 0 || Object.keys(obj[ent]).length !== 0){
                            definer(obj[ent]);
                            Object.defineProperty(obj[ent], 'any', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: any_func.bind(obj[ent])
                            });
                        };
                    };
                };
            };
        }; definer(db);
        // OK
        return db;
    } else return undefined;
};

// Going Module
module.exports = Jodo;
// Ready To Use.
