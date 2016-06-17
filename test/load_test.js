/**
 * Created by zibx on 07.08.15.
 */
var factory = require('../factory'),
    assert = require('chai').assert;
describe('factory', function () {
    var f;
    it('should create new factory', function(){
        f = new factory();
    });
    it('define new component', function () {
        f.define('a', {
            component: true,
            createEl: function () {
                this.el = {};
            },
            setter: {
                value: function (name, val) {
                    this.el.value = val;
                },
                other: function (name, val, data) {
                    console.log(arguments);
                    this.el[name] = val;
                }
            }
        });
    });
    it('should create new component', function(){
        var obj = f.build('a', {test: 17});

        obj.set('mur','ioi');
        assert.equal(obj.ctx.get('test'), 17);
        assert.equal(obj.ctx.get('mur'), 'ioi');
        assert.equal(obj.get('test'), 17);
        assert.equal(obj.get('mur'), 'ioi');
    })
});
