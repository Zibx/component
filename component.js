/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */;// Copyright by Ivan Kubota. 15 May 2016.
// Copyright Quokka inc 2016
/*
Comments:
component does not depends on esprima. Only QS does.
 */
//@exports ConstructorFactory
//@exports ConstructorFactory
module.exports = (function (){
    'use strict';
    var PieceOfReactivity = require('./piece-of-reactivity');
    var ObservableSequence = require('observable-sequence');
    var Z = require( 'z-lib' ),
        observable = require( 'z-observable' ),
        componentPrototype = {
            get: function( key ){
                return this.ctx.get(key);
            },
            set: function( key, data ){
                var ctx = this.ctx,
                    setter = this.setter[key] || this.setter['other'];
                //if(key === 'value')debugger;
                if(data instanceof PieceOfReactivity) {
                    data.bind(ctx, key);
                } else {
                    //if(setter.call(this, key, data) !== false) {
                    this.ctx.set(key, data);
                }
                /*
                    data = new PieceOfReactivity(this.ctx, [key], setter.bind( this, key ));

                if( !data || !data.value.length )
                    return;*!/
                //this.ctx.
                if(setter.call(this, key, data) !== false)
                    this.ctx.set(key, data);*/
                //brick.reactive.wrap( data, ctx, setter.bind( this, key ) );

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
                observable.prototype._init.call(this);

                this.createEl && this.createEl();

                var setters=this.setter;
                var self = this;

                this._initChildren();

                this.ctx.observe("change",function(name, newVal,oldVal) {
                    setters[name] && setters[name].call(self, name, newVal);
                });
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
            itemsSubscribe: function(  ){
                var _self = this;
                this.items.on('add', function(el){

                    if(el === void 0)debugger;
                    el.parent = _self;
                    _self.addToTree(el);
                    // best place to insert to dom.
                } );
                this.items.on('remove', function( el ){
                    el.parent = null;
                    _self.removeFromTree(el);
                });
            },
            addToTree: function(){},
            removeFromTree: function(){},
            _initChildren: function(){
                if(this.nestable){

                    var iterator = new ObservableSequence(this.items || []).iterator(), item, ctor, type, cmp,
                        items = this.items = new ObservableSequence([]);

                    this.itemsSubscribe();
                    this.preInit && this.preInit();

                    while(item = iterator.next()){
                        if(typeof item === 'function')
                            ctor = item;
                        else if(typeof item === 'object')
                            ctor = item.item;
                        else {
                            ctor = item;
                            item = {_type: ctor};
                        }

                        item.parent = this;

                        if((type = typeof ctor) === 'function'){
                            cmp = (ctor._factory || this._factory).build(ctor, item, iterator);
                        }else if(type === 'string'){
                            cmp = this._factory.build(ctor, item, iterator);
                        }
                        this.addChild(cmp);

                    }

                }

            },
            addChild: function(child){
                this.items.push(child);
            },
            parser: function(){
                //var parts = brick.tokenize.splitExpression( brick.tokenize.getExpressions( this.node.params.rest ), ':', 2 );
                //this.cfg = { id: { value: parts[0] }, val: { value: parts[1] } };
            },
            children: function(){
                return this.items;//.length
            },
            find: function(type, out){
                //debugger;
                out = out || [];
                if(!this.items)
                    return false;
                this.items.forEach(function (item) {
                    if(item._type === type)
                        out.push(item);
                    item.find(type, out);
                });
                return out;
            },
            setter: {
                cls: function (key, val) {
                    console.log(key, val);
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
                    var isString = typeof val === 'string';
                    if((isString && val.trim()) || (!isString && val)){
                        try {
                            // this try is for shit purpose only. Shit in global scope. Check for valid dot notation variable name
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
            var cmpCfg = {},
                reactive = {},
                val;

            for( i in cfg ){
                val = cfg[i];
                if(out.deepApply.indexOf(i)>-1)
                    continue;
                if(val instanceof PieceOfReactivity){
                    reactive[i] = val;
                }else{
                    cmpCfg[i] = val;
                }
            }

            var Cmp = init || function( cfg ){
                    var i, ctx, ctxData;
                    this.cfg = cfg;
                    Z.apply( this, cfg );
                    if( this.component ){
                        ctxData = Object.create(cmpCfg);
                        ctx = this.ctx = this.ctx || (this.parent && this.parent.ctx.extend(ctxData)) || new out.context(ctxData);

                        ctx.cmp = this;
                    }
                    //debugger;

                    //this.component && this.ctx.set( 'items', this.node.data );
                    for( i in cfg ){
                        ctx.set(i, cfg[i]);
                    }

                    //this.parser();

                    for( i in reactive ){
                        reactive[i].bind(ctx, i);
                    }

                    this.init();
                    this.subscribe();


                },
                overlays = out.deepApply.reduce( function( storage, deepName ){
                    if( deepName in cfg ){
                        storage[deepName] = cfg[deepName];
                        delete cfg[deepName];
                    }
                    return storage;
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
