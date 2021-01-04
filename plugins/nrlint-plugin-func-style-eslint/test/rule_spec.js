const should = require('chai').should();
const rule = require('../src/rule.js');
const FlowSet = require('../../../lib/flowmanip').FlowSet;

describe('func-style-eslint rules', function() {
    it('should allow empty flow', function() {
        const afs = FlowSet.parseFlow([]);
        const conf = {rules: {semi: 2}};
        const retval = rule.check(afs, conf, []);
        retval.result.should.be.empty;
    });
    it('should warn code in function node', function() {
        const afs = FlowSet.parseFlow([
            {id:'n1',type:'function',x:0,y:0,z:'f1',func:'return msg',wires:[]}
        ]);
        const conf = {rules: {semi: 2}};
        const retval = rule.check(afs, conf, []);
        console.log(JSON.stringify(retval.result,null,2));
        retval.result[0].should.have.property('rule','func-style-eslint');
        retval.result[0].should.have.deep.property('ids', ['n1']);
        retval.result[0].should.have.property('name', 'func-style-eslint');
        retval.result[0].should.have.property('severity', 'warn');
        retval.result[0].should.have.property('message', 'Missing semicolon.');
    });
});