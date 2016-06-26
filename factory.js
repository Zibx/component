/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */;// Copyright by Ivan Kubota. 15 May 2016.
//@exports Factory
module.exports = (function () {

    /*
    Factory. define, load and instantiate components
     @arg [cfg]<object>: factory configuration
     @arg [cfg.versionControl=false]<boolean>: algorithm of component versioning. If false - factory would throw error on second definition of same component
     */
    var Z = require('z-lib'),
        component = require('./component'),
        ComponentConstructorFactory = component.ConstructorFactory,
        Factory = function (cfg) {
            Z.apply(this, cfg);
            this.cmps = {};
            this.stats = {};
            var _self = this;
            this.destroyCallback = function () {
                _self.destroy(this);
            };
        };

    Factory.prototype = {
        versionControl: false,
        versionComparator: function (a, b) {
            a = (a||'0.0.0').split('.');
            b = (b||'0.0.0').split('.');
            var i, _i, aI, bI;
            for( i = 0, _i = Math.max(a.length, b.length); i < _i; i++){
                aI = parseInt(a[i], 10)|0;
                bI = parseInt(b[i], 10)|0;
                if(aI !== bI)
                    return aI < bI ? -1 : 1;
            }
            return 0;
        },
        /*
        Factory.define - define component
         @arg name<string>: component constructor name
         @arg cfg<object>: component configuration (goes to prototype)
         @arg [cfg._version]<string>: component version
         @arg [init]<function>: component constructor
         */
        define: function (name, cfg, init) {
            var cmps = this.cmps,
                _self = this,
                builder;
            if(cmps[name]) {
                if(this.versionControl){
                    throw new Error('component ' + name + ' is already defined');
                }else{
                    if(this.versionComparator(cmps[name]._version, cfg._version) > 0){
                        console.warn('component ' + name + ' is already defined, return v'+ cmps[name]._version +', tried to load v'+ cfg._version);
                        return cmps[name];
                    }else{
                        console.warn('component ' + name + ' is already defined, overwrite old v'+ cmps[name]._version +', by new one v'+ cfg._version)
                    }
                }
            }
            builder = function( cfg, iter ){
                return _self.build(name, cfg, iter);
            };
            cfg._type = name;
            cmps[name] = ComponentConstructorFactory(cfg, init);
            cmps[name].prototype._factory = cmps[name]._factory = this;
            builder._type = cmps[name].prototype._type = cmps[name]._type = name;
            return builder;
        },
        build: function (what, cfg, iter){
            cfg = cfg || {};
            
            if( typeof what === 'string' )
                cfg._type = what;
            else if(typeof what === 'function'){
                cfg._type = what._type;
            }else
                cfg = what;

            var node = cfg.node,
            //params = brick.tokenize.paramsExtractor(node, true),
                cmps = this.cmps,
                stats = this.stats,
                constructor = cmps[cfg._type];
            //console.log(cfg._type)
            if(typeof constructor !== 'function')
                throw new Error(cfg._type+'|'+what);
            var cmp = new constructor( cfg, iter );

            stats[cmp._type] = (stats[cmp._type] | 0) + 1;

            cmp.on( 'destroy', this.destroyCallback );
            return cmp;
        },
        destroy: function (cmp) {
            var type = cmp._type,
                stats = this.stats;
            stats[type]--;
        }
    };
    return Factory;
})();
