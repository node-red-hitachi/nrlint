const should = require('chai').should();
const rule = require('../cli/rule.js');
const FlowSet = require('../../../lib/flowmanip').FlowSet;

describe('core rules', function() {
    describe('flowsize', function () {
        it('should allow empty flow', function() {
            const afs = FlowSet.parseFlow([]);
            const conf = {subrules: [{name: "flowsize", maxSize: 10 }]};
            const retval = rule.check(afs, conf, []); 
            retval.result.should.be.empty;
        });
        it('should warn large flow', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'comment',x:0,y:0,z:'1',wires:[]},
                {id:'n2',type:'comment',x:1,y:1,z:'1',wires:[]}
            ]);
            const conf = {subrules: [{name: "flowsize", maxSize: 1}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['1'], name: 'flowsize', severity: 'warn', message: 'too large flow size'
            });
        });
        it('should not warn multiple of small flow', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'comment',x:0,y:0,z:'1',wires:[]},
                {id:'n2',type:'comment',x:1,y:1,z:'2',wires:[]}
            ]);
            const conf = {subrules: [{name: "flowsize", maxSize: 1}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.empty;
        });
    });
    describe('no-func-name', function() {
        it('should allow empty flow', function() {
            const afs = FlowSet.parseFlow([]);
            const conf = {subrules: [{name: "no-func-name"}]};
            const retval = rule.check(afs, conf, []); 
            retval.result.should.be.empty;
        });
        it('should warn empty function name', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'function', name:'',x:0,y:0,z:'0',wires:[]}
            ]);
            const conf = {subrules: [{name: "no-func-name"}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['n1'], name: 'no-func-name', severity: 'warn',
                message: 'function node has no name'
            });
        });
        it('should not warn function node which have a name', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'function', name:'name',x:0,y:0,z:'0',wires:[]}
            ]);
            const conf = {subrules: [{name: "no-func-name"}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.be.empty;
        });
    });
    describe('http-in-resp', function() {
        it('should allow empty flow', function() {
            const afs = FlowSet.parseFlow([]);
            const conf = {subrules: [{name: 'http-in-resp'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.be.empty;
        });
        it('should warn dangling http-in', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'http in',x:0,y:0,z:'f1',wires:[]}
            ]);
            const conf = {subrules: [{name: 'http-in-resp'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['n1'], name: 'dangling-http-in', severity: 'warn',
                message: 'dangling http-in node'
            });
        });
        it('should warn dangling http-resp', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'http response',x:0,y:0,z:'f1',wires:[]}
            ]);
            const conf = {subrules: [{name: 'http-in-resp'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['n1'], name: 'dangling-http-resp', severity: 'warn',
                message: 'dangling http-response node'
            });
        });
        it('should not warn when the nodes are connected', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'http in',x:0,y:0,z:'f1',wires:[['n2']]},
                {id:'n2',type:'http response',x:0,y:0,z:'f1',wires:[]}
            ]);
            const conf = {subrules: [{name: 'http-in-resp'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.empty;
        });
        it('should warn when the nodes are connected', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'http in',x:0,y:0,z:'f1',wires:[]},
                {id:'n2',type:'http response',x:0,y:0,z:'f1',wires:[]}
            ]);
            const conf = {subrules: [{name: 'http-in-resp'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['n1'], name: 'dangling-http-in', severity: 'warn',
                message: 'dangling http-in node'
            });
            retval.result.should.deep.include({
                rule: 'core', ids: ['n2'], name: 'dangling-http-resp', severity: 'warn',
                message: 'dangling http-response node'
            });
        });
        it('should warn when the nodes are connected but badly positioned', function() {
            const afs = FlowSet.parseFlow([
                { id: 'n1', type: 'http in', x: 0, y: 0, z: 'f1', wires: [['n2']] },
                { id: 'n2', type: 'function', x: 0, y: 0, z: 'f1', wires: [] },
                { id: 'n3', type: 'function', x: 0, y: 0, z: 'f1', wires: [['n2', 'n4']] },
                { id: 'n4', type: 'http response', x: 0, y: 0, z: 'f1', wires: [] }
            ]);
            const conf = { subrules: [{ name: 'http-in-resp' }] };
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule: 'core', ids: ['n1'], name: 'dangling-http-in', severity: 'warn',
                message: 'dangling http-in node'
            });
            retval.result.should.deep.include({
                rule: 'core', ids: ['n4'], name: 'dangling-http-resp', severity: 'warn',
                message: 'dangling http-response node'
            });
        });
        it('should not warn when the nodes are connected via link node', function() {
            const afs = FlowSet.parseFlow([
                { id: 'n1', type: 'http in', x: 0, y: 0, z: 'f1', wires: [['n2']] },
                { id: 'n2', type: 'link out', x: 0, y: 0, z: 'f1', wires: [], links: ['n3']},
                { id: 'n3', type: 'link in', x: 0, y: 0, z: 'f1', wires: [['n4']], links: ['n2'] },
                { id: 'n4', type: 'http response', x: 0, y: 0, z: 'f1', wires: [] }
            ]);
            const conf = { subrules: [{ name: 'http-in-resp' }] };
            const retval = rule.check(afs, conf, []);
            retval.result.should.be.empty;
        });
    });
    describe('loop', function() {
        it('should allow empty flow', function() {
            const afs = FlowSet.parseFlow([]);
            const conf = {subrules: [{name: 'loop'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.be.empty;
        });
        it('should warn potential infinite loop', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'function',x:0,y:0,z:'f1',wires:[['n2']]},
                {id:'n2',type:'function',x:0,y:0,z:'f1',wires:[['n1']]}
            ]);
            const conf = {subrules: [{name: 'loop'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule:'core',ids: ['n1','n2'], name: 'loop', severity: 'warn',
                message: 'possible infinite loop detected'
            });
        });
        it('shoud warn loop using link nodes', function() {
            const afs = FlowSet.parseFlow([
                {id:'n1',type:'function',x:0,y:0,z:'f1',wires:[['n2']]},
                {id:'n2',type:'link out',x:0,y:0,z:'f1',wires:[], links:['n3']},
                {id:'n3',type:'link in',x:0,y:0,z:'f1',wires:[['n1']], links:['n2']}
            ]);
            const conf = {subrules: [{name: 'loop'}]};
            const retval = rule.check(afs, conf, []);
            retval.result.should.deep.include({
                rule:'core',ids: ['n1','n2','n3'], name: 'loop', severity: 'warn',
                message: 'possible infinite loop detected'
            });
        });
    });
});