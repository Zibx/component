/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */;// Copyright by Ivan Kubota. 23 May 2016.
// Copyright Quokka inc 2016
module.exports = (function(){
    'use strict';
    var evalute = function(  ){
        var last, _self = this;
        return ;
    };
    /*
    Reactivity - a piece of reactivity
    @arg ctx<model> - model to subscribe for changes
    @arg dependencies<Array> - list of variable names
    @arg fn<Function> - function to execute when something changes
     */
    var Reactivity = function (ctx, dependencies, fn) {
        this.fn = fn;
        this.ctx = ctx;
        this.vars = vars;
        this.dependecies = {};
        var _self = this,
            wrapped = this.wrapped = function(  ){
                _self.evaluate();
            };

        if (dependencies.length)
            ctx.on(dependencies, wrapped);

        wrapped();
    };
    Reactivity.prototype = {
        evaluate: function () {
            var _self = this;
            return function(){
                var out = '', i, _i, item, val = data.value, res;
                for (i = 0, _i = val.length; i < _i; i++) {
                    item = val[i];
                    if (item[0] === 1) { // do not think about it anymore. it was 'item[0]'
                        item = item[1];
                        res = item.fn.apply(_self, item.vars.map(function (name) {
                            return _self.get(name);
                        }));
                        if(out.trim()=='' && (typeof res==='boolean'))
                            out = res;
                        else
                            out += res||'';

                    } else {
                        out += item[1];
                    }

                }
                if(out !== this.last) {
                    fn.call(_self, out, data);
                    this.last = out;
                }
            }
        }
    };
    return Reactivity;
})();