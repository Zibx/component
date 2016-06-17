/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */;// Copyright by Ivan Kubota. 15 May 2016.
// Copyright Quokka inc 2016

//@exports ConstructorFactory
//@exports ConstructorFactory
module.exports = (function (){
    'use strict';
    var PieceOfReactivity = require('./piece-of-reactivity');
    var Z = require( 'z-lib' ),
        observable = require( 'z-observable' ),
        componentPrototype = {
            get: function( key ){
                return this.ctx.get(key);
            },
            set: function( key, data ){
                if(data instanceof PieceOfReactivity){
                    if( !data || !data.value.length )
                        return;
                    var ctx = this.ctx,
                        setter = this.setter[key] || this.setter['other'];
                    brick.reactive.wrap( data, ctx, setter.bind( this, key ) );
                }else{
                    this.ctx.set(key, data);
                }
            },
            subscribe: function(){
                this.mapping = this.mapping || {};

                if( !this.component )
                    this.set( this.mapping['cls'] || 'cls', this.cfg.id );
                else
                    this.set( this.mapping['id'] || 'id', this.cfg.id );

                this.set( this.mapping['value'] || 'value', this.cfg.val );
                var i, cfg = this.cfg;

                for( i in cfg )
                    if( cfg.hasOwnProperty( i ) )
                        this.set( this.mapping[i] || i, cfg[i] );

            },
            getEls: function () {
                if(this.el)
                    return [this.el];
                var out = [];
                this.items.forEach(function (item) {
                    var els = item.getEls();
                    els.length && (out = out.concat(els));
                });
                return out;
            },
            init: function(){

                this.createEl && this.createEl();
                /*var sub = this.node.params.subNodes, l, item,
                    items = this.items = new brick.Array();
                this.listenItems();
                this.preInit && this.preInit( sub );
                l = new brick.Loop( sub );
                while( !l.isEnd() ){
                    item = this.addChild( l.item(), l );
                    if( item ){
                        items.push( item );
                        item.added = true;
                    }
                    l.next();
                }*/
            },
            parser: function(){
                //var parts = brick.tokenize.splitExpression( brick.tokenize.getExpressions( this.node.params.rest ), ':', 2 );
                //this.cfg = { id: { value: parts[0] }, val: { value: parts[1] } };
            },
            setter: {
                cls: function (key, val) {
                    //console.log(key, val);
                    var id, cls;
                    val = val.replace(/#[^\.]*/,function(val){
                        id = val.substr(1);
                        return '';
                    });
                    if(id !== void 0 && id !== this._lastId)
                        this.el.id = this._lastId = id;

                    if(this._lastCls !== (cls = val.replace(/\./g,' ').trim()))
                        this.el.className = this._lastCls = cls;
                },
                other: function (name, val, data) {
                    var el = this.el, _self = this;
                    if(name.indexOf('.')===0){

                        name.split(',').forEach(function (name) {
                            var code = brick.tokenize.collapse(data);
                            //debugger;
                            _self.ctx.observe(name.substr(1), new Function('e', code).bind(_self.ctx));
                        });
                    }else{
                        //console.log(name,':',val);
                        this.ctx.set(name, val);
                    }
                },
                id: function (name, val) {
                    if(val.trim()){
                        try {
                            val = eval('(function(){var o = ({});o.' + val + '\n=true;for(var i in o)if(o.hasOwnProperty(i))return i;})()');
                            window[val] = this.ctx;
                        }catch(e){}
                    }
                }
            }
        },
        out;

    Z.applyIfNot(componentPrototype, observable.prototype);
    return out = {
        context: require('q-model'),
        deepApply: ['setter'],
        componentPrototype: componentPrototype,
        ConstructorFactory: function( cfg, init ){
            var Cmp = init || function( cfg ){
                    this.cfg = cfg;
                    Z.apply( this, cfg );
                    if( this.component ){
                        this.ctx = this.ctx || (this.parent && this.parent.ctx.extend()) || new out.context();
                        this.ctx.cmp = this;
                    }
                    //debugger;
                    observable.prototype._init.call(this);
                    //this.component && this.ctx.set( 'items', this.node.data );
                    for( var i in cfg ){
                        this.ctx.set(i, cfg[i]);
                    }
                    this.parser();

                    this.init();
                    this.subscribe();
                },
                overlays = out.deepApply.reduce( function( storage, deepName ){
                    if( deepName in cfg ){
                        storage[deepName] = cfg[deepName];
                        delete cfg[deepName];
                    }
                }, {} ),
                proto = Cmp.prototype = Z.apply( Object.create( out.componentPrototype ), cfg ),
                i;

            for( i in overlays ){
                proto[i] = Z.apply( Object.create( proto[i] ), overlays[i] );
            }

            return Cmp;
        }
    };
})();
