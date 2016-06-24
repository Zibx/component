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
            nestable: true,
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
            items: [
                {
                    item: a,
                    items: [
                        a,
                        {item: 'b'}
                    ]
                },
                b
            ],
            createEl: function(){
                this.el = {};
            },
            listeners: {
                click: function(){
                    this.set('clicked',(this.get('clicked')|0)+1)
                }
            },
            click: function(){
                this.fire('click');
            }
        } );

    it( 'should nests', function(){
        var dom = c({
            value: 1
        });
        assert.equal(dom.items.length, 2);
        assert.equal(dom.items.get(0).items.length, 2);
        assert.equal(dom.items.get(0).parent, dom);

        assert.equal(dom.items.get(0).items.get(0).parent, dom.items.get(0));
        assert.equal(dom.items.get(0).items.get(0).parent.parent, dom);
        //console.log( dom.items[0], 3 );
        for(var i = 0; i < 10; i++)
            dom.click();

        assert.equal(dom.get('clicked'), 10);

    } )
});