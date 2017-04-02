describe('EventEmitter', function() {
  var ee,
      fn = sinon.spy();

  beforeEach(function() {
    ee = new EventEmitter;
    fn.reset();
  });

  it('EventEmitter.defaultMaxListeners should equal 10', function() {
    EventEmitter.defaultMaxListeners.should.equal(10);
  });

  describe('constructor', function() {
    it('should set ._listeners to an empty object', function() {
      ee._listeners.should.be.an('object');
      ee._listeners.should.deep.equal({});
    });

    it('should set ._maxListeners to EventEmitter.defaultMaxListeners', function() {
      ee._maxListeners.should.be.a('number');
      ee._maxListeners.should.equal(EventEmitter.defaultMaxListeners);
    });
  });

  describe('#addListener', function() {
    it('should delegate to #on', function() {
      sinon.spy(ee, 'on');
      ee.addListener('test', fn)
      ee.on.should.have.been.calledOnce;
    });
  });

  describe('#emit', function() {
    it('should return false if no listeners added', function() {
      ee.emit('test').should.equal(false);
    });

    it('should execute all listeners', function() {
      var spy = sinon.spy();

      ee.on('test', fn);
      ee.emit('test');
      fn.should.have.been.calledOnce;
      ee.on('test', spy);
      ee.emit('test');
      ee.emit('test');
      fn.should.have.been.calledThrice;
      spy.should.have.been.calledTwice;
    });

    it('should execute all listeners with specified arguments', function() {
      var arg1 = 'test',
          arg2 = true,
          spy = sinon.spy();

      ee.on('test', fn);
      ee.on('test', spy);
      ee.emit('test', arg1, arg2);
      fn.should.have.been.calledOnce;
      fn.should.have.been.calledWith(arg1, arg2);
      spy.should.have.been.calledOnce;
      spy.should.have.been.calledWith(arg1, arg2);
    });

    it('should return true if listeners added', function() {
      ee.on('test', fn);
      ee.emit('test').should.equal(true);
    });
  });

  describe('#eventNames', function() {
    it('should return an Array', function() {
      ee.eventNames().should.be.an('array');
    });

    it('should return an Array of event names', function() {
      ee.on('test1', fn);
      ee.on('test2', fn);
      ee.on('test3', fn);
      ee.eventNames().should.deep.equal([ 'test1', 'test2', 'test3' ]);
    });
  });

  describe('#getMaxListeners', function() {
    it('should return ._maxListeners', function() {
      ee.getMaxListeners().should.equal(ee._maxListeners);
    });
  });

  describe('#listenerCount', function() {
    it('should return a Number', function() {
      ee.listenerCount('test').should.be.a('number');
    });

    it('should return 0 if no listeners for specified event type', function() {
      ee.listenerCount('test').should.equal(0);
    });

    it('should return length if listeners for specified event type', function() {
      ee.on('test', fn);
      ee.on('test', fn);
      ee.on('test', fn);
      ee.listenerCount('test').should.equal(ee._listeners['test'].length);
    });
  });

  describe('#listeners', function() {
    it('should return an Array', function() {
      ee.listeners('test').should.be.an('array');
    });

    it('should return [] if no listeners for specified event type', function() {
      ee.listeners('test').should.deep.equal([]);
    });

    it('should return listeners for specified event type', function() {
      ee.on('test', fn);
      ee.on('test', fn);
      ee.on('test', fn);
      ee.listeners('test').should.deep.equal([ fn, fn, fn ]);
    });
  });

  describe('#on', function() {
    it('should throw TypeError if listener not a function and no error listeners', function() {
      (function() {
        ee.on('test', 'string');
      }).should.throw(TypeError);
    });

    it('should emit error if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.on('test', 'string');
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.on('test', 'string').should.deep.equal(ee);
    });

    it('should add Array for event type if one does not yet exist', function() {
      should.equal(ee._listeners['test'], undefined);
      ee.on('test', fn);
      ee._listeners['test'].should.be.an('array');
    });

    it('should throw RangeError if listeners greater than .maxListeners and no error listeners', function() {
      (function() {
        ee.setMaxListeners(1);
        ee.on('test', fn);
        ee.on('test', fn);
      }).should.throw(RangeError);
    });

    it('should emit error if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.on('error', fn);
      ee.on('error', fn);
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.on('error', fn);
      ee.on('error', fn).should.deep.equal(ee);
    });

    it('should emit newListener if listeners', function() {
      ee.on('newListener', fn);
      ee.on('test', fn);
      fn.should.have.been.calledOnce;
      fn.should.have.been.calledWith('test', fn);
    });

    it('should call Array.prototype.push', function() {
      sinon.spy(Array.prototype, 'push');
      ee.on('test', fn);
      Array.prototype.push.should.have.been.calledOnce;
      Array.prototype.push.restore();
    });

    it('should add listener to end of listeners Array', function() {
      var test = sinon.spy();

      ee.on('test', fn);
      ee._listeners['test'][ee._listeners['test'].length - 1].should.equal(fn);
      ee._listeners['test'].length.should.equal(1);
      ee._listeners['test'][ee._listeners['test'].length - 1]();
      fn.should.have.been.calledOnce;
      ee.on('test', test);
      ee._listeners['test'][ee._listeners['test'].length - 1].should.equal(test);
      ee._listeners['test'].length.should.equal(2);
      ee._listeners['test'][ee._listeners['test'].length - 1]();
      test.should.have.been.calledOnce;
      ee.emit('test');
      fn.should.have.been.calledTwice;
      test.should.have.been.calledTwice;
    });

    it('should return EventEmitter', function() {
      ee.on('test', fn).should.deep.equal(ee);
    });
  });

  describe('#once', function() {
    it('should delegate to #on', function() {
      sinon.spy(ee, 'on');
      ee.once('test', fn)
      ee.on.should.have.been.calledOnce;
    });

    it('should throw TypeError if listener not a function and no error listeners', function() {
      (function() {
        ee.once('test', 'string');
      }).should.throw(TypeError);
    });

    it('should emit error if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.once('test', 'string');
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.once('test', 'string').should.deep.equal(ee);
    });

    it('should add Array for event type if one does not yet exist', function() {
      should.equal(ee._listeners['test'], undefined);
      ee.once('test', fn);
      ee._listeners['test'].should.be.an('array');
    });

    it('should throw RangeError if listeners greater than .maxListeners and no error listeners', function() {
      (function() {
        ee.setMaxListeners(1);
        ee.once('test', fn);
        ee.once('test', fn);
      }).should.throw(RangeError);
    });

    it('should emit error if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.once('error', fn);
      ee.once('error', fn);
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.once('error', fn);
      ee.once('error', fn).should.deep.equal(ee);
    });

    it('should emit newListener if listeners', function() {
      ee.on('newListener', fn);
      ee.once('test', fn);
      fn.should.have.been.calledOnce;
      fn.should.have.been.calledWith('test');
    });

    it('should call Array.prototype.push', function() {
      sinon.spy(Array.prototype, 'push');
      ee.on('test', fn);
      Array.prototype.push.should.have.been.calledOnce;
      Array.prototype.push.restore();
    });

    it('should add listener to end of listeners Array', function() {
      var test = sinon.spy();

      ee.once('test', fn);
      ee._listeners['test'][ee._listeners['test'].length - 1].listener.should.equal(fn);
      ee._listeners['test'].length.should.equal(1);
      ee.once('test', fn);
      ee._listeners['test'][ee._listeners['test'].length - 1].listener.should.equal(fn);
      ee._listeners['test'].length.should.equal(2);
      ee.once('test', test);
      ee._listeners['test'][ee._listeners['test'].length - 1].listener.should.equal(test);
      ee._listeners['test'].length.should.equal(3);
    });

    it('listeners added via #once should be removed from listeners Array after emit', function() {
      var test = sinon.spy();

      ee.once('test', fn);
      ee._listeners['test'].length.should.equal(1);
      ee.once('test', fn);
      ee._listeners['test'].length.should.equal(2);
      ee.once('test', test);
      ee._listeners['test'].length.should.equal(3);
      ee._listeners['test'][ee._listeners['test'].length - 1].apply(ee);
      ee._listeners['test'].length.should.equal(2);
      test.should.have.been.calledOnce;
      ee.once('test', fn);
      ee._listeners['test'].length.should.equal(3);
      ee.emit('test');
      fn.should.have.been.calledThrice;
      should.equal(ee._listeners['test'], undefined);
    });

    it('should return EventEmitter', function() {
      ee.once('test', fn).should.deep.equal(ee);
    });
  });

  describe('#prependListener', function() {
    it('should throw TypeError if listener not a function and no error listeners', function() {
      (function() {
        ee.prependListener('test', 'string');
      }).should.throw(TypeError);
    });

    it('should emit error if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.prependListener('test', 'string');
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.prependListener('test', 'string').should.deep.equal(ee);
    });

    it('should add Array for event type if one does not yet exist', function() {
      should.equal(ee._listeners['test'], undefined);
      ee.prependListener('test', fn);
      ee._listeners['test'].should.be.an('array');
    });

    it('should throw RangeError if listeners greater than .maxListeners and no error listeners', function() {
      (function() {
        ee.setMaxListeners(1);
        ee.prependListener('test', fn);
        ee.prependListener('test', fn);
      }).should.throw(RangeError);
    });

    it('should emit error if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.prependListener('error', fn);
      ee.prependListener('error', fn);
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.prependListener('error', fn);
      ee.prependListener('error', fn).should.deep.equal(ee);
    });

    it('should emit newListener if listeners', function() {
      ee.on('newListener', fn);
      ee.prependListener('test', fn);
      fn.should.have.been.calledOnce;
      fn.should.have.been.calledWith('test');
    });

    it('should call Array.prototype.unshift', function() {
      sinon.spy(Array.prototype, 'unshift');
      ee.prependListener('test', fn);
      Array.prototype.unshift.should.have.been.calledOnce;
      Array.prototype.unshift.restore();
    });

    it('should add listener to beginning of listeners Array', function() {
      var test = sinon.spy();

      ee.prependListener('test', fn);
      ee._listeners['test'][0].should.equal(fn);
      ee._listeners['test'].length.should.equal(1);
      ee.prependListener('test', fn);
      ee._listeners['test'][0].should.equal(fn);
      ee._listeners['test'].length.should.equal(2);
      ee.prependListener('test', test);
      ee._listeners['test'][0].should.equal(test);
      ee._listeners['test'].length.should.equal(3);
    });

    it('should return EventEmitter', function() {
      ee.prependListener('test', fn).should.deep.equal(ee);
    });
  });

  describe('#prependOnceListener', function() {
    it('should delegate to #prependListener', function() {
      sinon.spy(ee, 'prependListener');
      ee.prependOnceListener('test', fn)
      ee.prependListener.should.have.been.calledOnce;
    });

    it('should throw TypeError if listener not a function and no error listeners', function() {
      (function() {
        ee.prependOnceListener('test', 'string');
      }).should.throw(TypeError);
    });

    it('should emit error if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.prependOnceListener('test', 'string');
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listener not a function and error listeners', function() {
      ee.on('error', fn);
      ee.prependOnceListener('test', 'string').should.deep.equal(ee);
    });

    it('should add Array for event type if one does not yet exist', function() {
      should.equal(ee._listeners['test'], undefined);
      ee.prependOnceListener('test', fn);
      ee._listeners['test'].should.be.an('array');
    });

    it('should throw RangeError if listeners greater than .maxListeners and no error listeners', function() {
      (function() {
        ee.setMaxListeners(1);
        ee.prependOnceListener('test', fn);
        ee.prependOnceListener('test', fn);
      }).should.throw(RangeError);
    });

    it('should emit error if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.prependOnceListener('error', fn);
      ee.prependOnceListener('error', fn);
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listeners greater than .maxListeners and error listeners', function() {
      ee.setMaxListeners(1);
      ee.prependOnceListener('error', fn);
      ee.prependOnceListener('error', fn).should.deep.equal(ee);
    });

    it('should emit newListener if listeners', function() {
      ee.on('newListener', fn);
      ee.prependOnceListener('test', fn);
      fn.should.have.been.calledOnce;
      fn.should.have.been.calledWith('test');
    });

    it('should call Array.prototype.unshift', function() {
      sinon.spy(Array.prototype, 'unshift');
      ee.prependOnceListener('test', fn);
      Array.prototype.unshift.should.have.been.calledOnce;
      Array.prototype.unshift.restore();
    });

    it('should add listener to beginning of listeners Array', function() {
      var test = sinon.spy();

      ee.prependOnceListener('test', fn);
      ee._listeners['test'][0].listener.should.equal(fn);
      ee._listeners['test'].length.should.equal(1);
      ee.prependOnceListener('test', fn);
      ee._listeners['test'][0].listener.should.equal(fn);
      ee._listeners['test'].length.should.equal(2);
      ee.prependOnceListener('test', test);
      ee._listeners['test'][0].listener.should.equal(test);
      ee._listeners['test'].length.should.equal(3);
    });

    it('listeners added via #prependOnceListener should be removed from listeners Array after emit', function() {
      var test = sinon.spy();

      ee.prependOnceListener('test', fn);
      ee._listeners['test'].length.should.equal(1);
      ee.prependOnceListener('test', fn);
      ee._listeners['test'].length.should.equal(2);
      ee.prependOnceListener('test', test);
      ee._listeners['test'].length.should.equal(3);
      ee._listeners['test'][0].apply(ee);
      ee._listeners['test'].length.should.equal(2);
      test.should.have.been.calledOnce;
      ee.prependOnceListener('test', fn);
      ee._listeners['test'].length.should.equal(3);
      ee.emit('test');
      fn.should.have.been.calledThrice;
      should.equal(ee._listeners['test'], undefined);
    });

    it('should return EventEmitter', function() {
      ee.prependOnceListener('test', fn).should.deep.equal(ee);
    });
  });

  describe('#removeAllListeners', function() {
    it('should remove all listeners for specified event type', function() {
      ee.on('test', fn);
      ee._listeners['test'].length.should.equal(1);
      ee.removeAllListeners('test');
      should.equal(ee._listeners['test'], undefined);
    });

    it('should emit removeListener for specified event type if removeListener listeners', function() {
      ee.on('removeListener', fn);
      ee.removeAllListeners('removeListener');
      fn.should.have.been.calledOnce;
    });

    it('should remove all event listeners if no type specified', function() {
      ee.on('test1', fn);
      ee.on('test2', fn);
      ee._listeners.should.have.all.keys([ 'test1', 'test2' ]);
      ee.removeAllListeners();
      ee._listeners.should.deep.equal({});
    });

    it('should emit removeListener for all listeners if removeListener listeners', function() {
      ee.on('removeListener', fn);
      ee.on('test1', fn);
      ee.on('test2', fn);
      ee.removeAllListeners();
      fn.should.have.been.calledThrice;
      fn.should.have.been.calledWith('removeListener', fn);
      fn.should.have.been.calledWith('test1', fn);
      fn.should.have.been.calledWith('test2', fn);
    });

    it('should return EventEmitter', function() {
      ee.removeAllListeners('test').should.deep.equal(ee);
    });
  });

  describe('#removeListener', function() {
    it('should return EventEmitter if no listeners for specified type', function() {
      ee.removeListener('test').should.deep.equal(ee);
    });

    it('should remove listener for the specified type and listener', function() {
      ee.on('test', fn);
      ee.on('test', fn);
      ee.removeListener('test', fn);
      ee._listeners['test'].length.should.equal(1);
      ee.removeListener('test', fn);
      should.equal(ee._listeners['test'], undefined);
    });

    it('should emit removeListener if removeListener listeners', function() {
      ee.on('removeListener', fn);
      ee.removeListener('removeListener', fn);
      fn.should.have.been.calledOnce;
    });

    it('should return EventEmitter if listeners removed', function() {
      ee.on('test', fn);
      ee.removeListener('test', fn).should.deep.equal(ee);
    });

    it('should return EventEmitter if listeners not removed', function() {
      ee.on('test', fn);
      ee.removeListener('test', 'string').should.deep.equal(ee);
    });
  });

  describe('#setMaxListeners', function() {
    it('should throw TypeError if num is not a positive integer', function() {
      (function() {
        ee.setMaxListeners('string');
      }).should.throw(TypeError);
      (function() {
        ee.setMaxListeners(0);
      }).should.throw(TypeError);
      (function() {
        ee.setMaxListeners(-1);
      }).should.throw(TypeError);
    });

    it('should set ._maxListeners', function() {
      ee.setMaxListeners(1);
      ee._maxListeners.should.equal(1);
    });

    it('should return EventEmitter', function() {
      ee.setMaxListeners(1).should.deep.equal(ee);
    });
  });
});
