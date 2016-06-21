/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */;// Copyright by Ivan Kubota. 23 May 2016.
// Copyright Quokka inc 2016
/*
  CTX agreement
    ctx must have method on, set, get.
    ctx.on must be able to subscribe to variable change
    ctx.set must set context variable
    ctx.get must get context variable
 */
module.exports = (function(){
    'use strict';
    /*
    Reactivity - a piece of reactivity
      @arg ctx<model> - model to subscribe for changes
      @arg dependencies<Array> - list of variable names
      @arg fn<Function> - function to execute when something changes

     */
    var Reactivity = function (vars, fn) {
        this.fn = fn;
        this.vars = vars;
    };
    Reactivity.prototype = {
        bind: function( ctx, key, debounce ){
            var vars = this.vars,
                fn = this.fn,
                lastValue, lastInited = false,
                dependecies = {}, i, _i, varName,
                argPos = {},
                lastArgs = [],
                wrapped = function(){
                    var value = fn.apply(ctx, lastArgs);
                    if(!lastInited || lastValue !== value){
                        lastInited = true;
                        lastValue = value;
                        ctx.set( key, value );
                    }
                };
            //ctx.on(this.vars, wrapped);
            if (_i = vars.length){
                for(i = 0; i < _i; i++ ){
                    varName = vars[i];
                    argPos[varName] = i;
                    lastArgs[i] = dependecies[varName] = ctx.get(varName);
                }
                ctx.on( vars, function(val, type, oldVal, key){
                    lastArgs[argPos[key]] = dependecies[key] = val;
                    wrapped();
                } );
                //console.log(key, vars, lastArgs)
            }
            wrapped();
        }
    };
    return Reactivity;
})();