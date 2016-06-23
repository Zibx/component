/**
 * Created by zibx on 21.06.16.
 */
var factory = require('../factory'),
    assert = require('chai').assert;

var PieceOfReactivity = require('../piece-of-reactivity');

describe('nesting', function (){
    var f = new factory(), obj,
        a = f.define('a',{
            component: true,
            createEl: function(){
                this.el = {};
            }
        } ),
        b = f.define('b',{
            component: true,
            createEl: function(){
                this.el = {};
            }
        } ),
        c = f.define('c', {
            component: true,
            nestable: true,
            items: [{item: a, items: [a, {item: 'b'}]}, b],
            createEl: function(){
                this.el = {};
            }
        } );

    it( 'should nests', function(){
        var dom = c({
            value: 1
        });
        assert.equal(dom.children().length, 2)
        console.log( dom.items, 2 )
    } )
});