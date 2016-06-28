/**
 * Created by zibx on 6/26/16.
 */
var factory = require('../factory'),
    assert = require('chai').assert;
var PieceOfReactivity = require('../piece-of-reactivity');
describe('dom', function () {
    var f = new factory(), obj;
    var document = require("dom-lite").document;
    ('a,b,big,br,button,canvas,center,div,dl,dt,em,embed,' +
    'font,form,frame,h1,h2,h3,h4,h5,h6,i,iframe,img,' +
    'input,label,li,ol,option,p,pre,span,sub,sup,' +
    'table,tbody,td,textarea,th,thead,tr,u,ul,header')
        .split(',')
        .forEach(function (name) {
            f.define(name, {
                component: true,
                nestable: true,
                createEl: function () {
                    this.el = document.createElement(name);
                },
                addToTree: function(child){
                    //console.log(child)
                    child.el && (this.el || this.parent.el).appendChild(child.el);
                    //(this.el || this.parent.el).appendChild(document.createTextNode('84'))
                },
                preInit: function () {

                    if(this.value) {
                        this.textNode = f.build('textNode', {value: this.value});
                        this.items.unshift(this.textNode);
                    }

                },
                setter: {
                    //cls: function(){console.log(arguments)},
                    value: function (key, val) {
                        this.textNode && (this.textNode.set('value', val));
                    }
                }
            });
        });
    f.define('textNode', {
        component: true,
        setter: {
            value: function (key, val) {
                this.el.nodeValue = val;
            }
        },
        createEl: function(){
            this.el = document.createTextNode('');
        }
    });

    it('should nests', function () {
        var tree = f.build('h1', {
            items: ['h2', 'b', {
                item: 'h1',
                items: [{item: 'b', value: 10}]

            }]
        });
        assert.equal( tree.el.outerHTML, '<h1><h2></h2><b></b><h1><b>10</b></h1></h1>' );

        tree.children().get(2).children().get(0).set('value',20);
        assert.equal( tree.el.outerHTML, '<h1><h2></h2><b></b><h1><b>20</b></h1></h1>' );
    });
    it('should set cls', function () {
        var el = f.build('div', {
            test: 'hj',
            cls: new PieceOfReactivity( ['test'], function( test ){return '.'+test;} )});

        el.set('test','zhazha1');
        el.set('cls', new PieceOfReactivity( ['test'], function( test ){return '.'+test;} ));

        el.set('test','zhazha');
        //console.log(el.cls.fn.toString())
        assert.equal(el.el.className, 'zhazha');
    });

});