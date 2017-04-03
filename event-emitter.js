/**
 * @file
 */
(function(window, document, undefined) {
  'use strict';


  /**
   * @param {EventEmitter} eventEmitter
   * @param {String}       type
   * @private
   */
  function _emitRemoveListeners(eventEmitter, eventName) {
    var listeners = eventEmitter._listeners[eventName],
        i = 0;

    for (i; i < listeners.length; i++) {
      eventEmitter.emit('removeListener', eventName, listeners[i]);
    }
  };


  /**
   * @param  {EventEmitter} eventEmitter
   * @return {EventEmitter}
   * @throws {TypeError}
   * @private
   */
  function _emitFunctionTypeError(eventEmitter) {
    var error = new TypeError('listener must be of type function');

    if (eventEmitter._listeners['error'] === undefined) {
      throw error;
    }

    eventEmitter.emit('error', error);
    return eventEmitter;
  };


  /**
   * @param  {EventEmitter} eventEmitter
   * @param  {String}       eventName
   * @param  {Function}     listener
   * @param  {String}       method
   * @return {EventEmitter}
   * @throws {RangeError}
   * @private
   */
  function _addListener(eventEmitter, eventName, listener, method) {
    var error;

    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(eventEmitter);
    }

    if (eventEmitter._listeners[eventName] === undefined) {
      eventEmitter._listeners[eventName] = [];
    }

    if (eventEmitter._listeners[eventName].length >= eventEmitter._maxListeners) {
      error = new RangeError('maxListeners exceeded');

      if (eventEmitter._listeners['error'] === undefined) {
        throw error;
      }

      eventEmitter.emit('error', error);
      return eventEmitter;
    }

    if (eventEmitter._listeners['newListener'] !== undefined) {
      eventEmitter.emit('newListener', eventName, listener);
    }

    eventEmitter._listeners[eventName][method](listener);
    return eventEmitter;
  };


  /**
   * @class
   * @see {@link https://nodejs.org/api/events.html}
   */


  /**
   * @constructor
   */
  var EventEmitter = window.EventEmitter = function() {

    /**
     * @type {Object.<String, Array>}
     * @private
     */
    this._listeners = {};

    /**
     * @type {Number}
     * @private
     */
    this._maxListeners = EventEmitter.defaultMaxListeners;
  };


  /**
   * @type {Number}
   * @protected
   * @see {@link https://nodejs.org/api/events.html#events_eventemitter_defaultmaxlisteners}
   */
  EventEmitter.defaultMaxListeners = 10;


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener}
   */
  EventEmitter.prototype.addListener = function(eventName, listener) {
    return this.on.apply(this, arguments);
  };


  /**
   * @param  {String} eventName
   * @param  {...*}   [arguments] Optional.
   * @return {Boolean}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_emit_eventname_args}
   */
  EventEmitter.prototype.emit = function(eventName) {
    var listeners, args, i;

    if (this._listeners[eventName] === undefined) {
      return false;
    }

    listeners = this._listeners[eventName].slice();
    args      = Array.prototype.slice.call(arguments, 1);

    for (i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }

    return true;
  };


  /**
   * @return {Array}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_eventnames}
   */
  EventEmitter.prototype.eventNames = function() {
    return Object.keys(this._listeners);
  };


  /**
   * @return {Number}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_getmaxlisteners}
   */
  EventEmitter.prototype.getMaxListeners = function() {
    return this._maxListeners;
  };


  /**
   * @param  {String} eventName
   * @return {Number}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_listenercount_eventname}
   */
  EventEmitter.prototype.listenerCount = function(eventName) {
    var listeners = this._listeners[eventName];

    if (listeners !== undefined) {
      return listeners.length;
    }

    return 0;
  };


  /**
   * @param  {String} eventName
   * @return {Array}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_listeners_eventname}
   */
  EventEmitter.prototype.listeners = function(eventName) {
    var listeners = this._listeners[eventName];

    if (listeners !== undefined) {
      return listeners.slice();
    }

    return [];
  };


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_on_eventname_listener}
   */
  EventEmitter.prototype.on = function(eventName, listener) {
    return _addListener(this, eventName, listener, 'push');
  };


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_once_eventname_listener}
   */
  EventEmitter.prototype.once = function(eventName, listener) {
    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(this);
    }

    function temp() {
      this.removeListener(eventName, temp);
      listener.apply(this, arguments);
    };
    temp.eventName = eventName;
    temp.listener  = listener;

    return this.on(eventName, temp);
  };


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_prependlistener_eventname_listener}
   */
  EventEmitter.prototype.prependListener = function(eventName, listener) {
    return _addListener(this, eventName, listener, 'unshift');
  };


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_prependoncelistener_eventname_listener}
   */
  EventEmitter.prototype.prependOnceListener = function(eventName, listener) {
    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(this);
    }

    function temp() {
      this.removeListener(eventName, temp);
      listener.apply(this, arguments);
    };
    temp.eventName = eventName;
    temp.listener  = listener;

    return this.prependListener(eventName, temp);
  };


  /**
   * @param  {String} [eventName] Optional.
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_removealllisteners_eventname}
   */
  EventEmitter.prototype.removeAllListeners = function(eventName) {
    var eventNames, i;

    if (eventName !== undefined && this._listeners[eventName] !== undefined) {
      if (this._listeners['removeListener'] !== undefined) {
        _emitRemoveListeners(this, eventName);
      }

      delete this._listeners[eventName];
    }
    else {
      eventNames = Object.keys(this._listeners);

      if (this._listeners['removeListener'] !== undefined) {
        for (i = 0; i < eventNames.length; i++) {
          _emitRemoveListeners(this, eventNames[i]);
        }
      }

      this._listeners = {};
    }

    return this;
  };


  /**
   * @param  {String}   eventName
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener}
   */
  EventEmitter.prototype.removeListener = function(eventName, listener) {
    var listeners, index;

    if (this._listeners[eventName] === undefined) {
      return this;
    }

    listeners = this._listeners[eventName];
    index     = listeners.indexOf(listener);

    if (index > -1) {
      if (this._listeners['removeListener'] !== undefined) {
        this.emit('removeListener', eventName, listener);
      }

      listeners.splice(index, 1);

      if (listeners.length === 0) {
        delete this._listeners[eventName];
      }
    }

    return this;
  };


  /**
   * @param  {Number} n
   * @return {EventEmitter}
   * @throws {TypeError}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_setmaxlisteners_n}
   */
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (Math.floor(n) !== n || n <= 0) {
      throw new TypeError('n must be a positive integer');
    }

    this._maxListeners = n;
    return this;
  };


})(window, window.document);
