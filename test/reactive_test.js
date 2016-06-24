var factory = require('../factory'),
    assert = require('chai').assert;

var PieceOfReactivity = require('../piece-of-reactivity');

describe('reactive', function (){
    var f = new factory(), obj,
        a;
    it( 'should create reactive', function(){

        // defining component 'a'
        a = f.define( 'a', {
            component: true,
            createEl: function(){
                this.el = {};
            },
            morder: 8,
            kwa: new PieceOfReactivity( ['value'], function( value ){return 'kwa' + value;} ),
            setter: {
                value: function( name, val ){
                    //console.log( '!', val )
                    this.el.value = val;
                },
                tukan: function(name, val){
                    this.el.someTukan = val;
                    return !!(val % 2); // returning false prevents changing ctx
                }
            },
            getter: {
                value: function( name ){
                    return this.el.value;
                }
            }
        } );
    });
    it( 'should be', function(){
        obj = new a({
            test: 17,
            value: 14,
            helloTest: new PieceOfReactivity( ['test'], function( test ){return 'Hello ' + test + '!';} ),
            kwaHello: new PieceOfReactivity( ['kwa', 'helloTest'], function( kwa, helloTest ){return kwa + helloTest;} )
        } );
        var obj2 = a({
            test: 11,
            value: 4,
            helloTest: new PieceOfReactivity( ['test'], function( test ){return 'Hello ' + test + '!';} )
        } );

        //console.log(obj.morder);
        assert.equal( obj.get( 'morder' ), 8 )
        assert.equal( obj2.get( 'value' ), 4 )
        assert.equal( obj.get( 'value' ), 14 )
    });
    it( 'should be reactive on init', function(){
        assert.equal(obj.get('helloTest'), 'Hello 17!');

        assert.equal(obj.get('kwaHello'), 'kwa14Hello 17!');
        assert.equal(obj.get('kwa'), 'kwa14');
    } );

    it( 'should be reactive on modify', function(){
        obj.set('value', 3);
        assert.equal(obj.get('helloTest'), 'Hello 17!');

        assert.equal(obj.get('kwaHello'), 'kwa3Hello 17!');
        assert.equal(obj.get('kwa'), 'kwa3');
    } );

    it( 'should be cancellable', function(){
        var last;
        for(var x = 0; x<10;x++){
            obj.set( 'tukan', x );
            if(x%2===1) last = x;
            assert.equal( obj.el.someTukan, x );
            assert.equal( obj.get( 'tukan' ), last )
        }
    });
    it( 'should be fast enough', function(){
        // do not run this test in heavy cpu loaded env.
        var start = +new Date(), diff;
        for(var i = 0; i < 5000; i++){
            obj.set( 'value', i );
            assert.equal( obj.get( 'kwaHello' ), 'kwa'+i+'Hello 17!' );
            assert.equal( obj.get( 'kwa' ), 'kwa'+i );
        }
        diff = +new Date()-start;
        console.log(diff);
        assert.equal(diff < 100, true)
    });
});