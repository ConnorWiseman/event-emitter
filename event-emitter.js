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
  function _emitRemoveListeners(eventEmitter, type) {
    var listeners = eventEmitter._listeners[type],
        i = 0;

    for (i; i < listeners.length; i++) {
      eventEmitter.emit('removeListener', type, listeners[i]);
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
   * @param  {String}       type
   * @param  {Function}     listener
   * @param  {String}       method
   * @return {EventEmitter}
   * @throws {RangeError}
   * @private
   */
  function _addListener(eventEmitter, type, listener, method) {
    var error;

    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(eventEmitter);
    }

    if (eventEmitter._listeners[type] === undefined) {
      eventEmitter._listeners[type] = [];
    }

    if (eventEmitter._listeners[type].length >= eventEmitter._maxListeners) {
      error = new RangeError('maxListeners exceeded');

      if (eventEmitter._listeners['error'] === undefined) {
        throw error;
      }

      eventEmitter.emit('error', error);
      return eventEmitter;
    }

    if (eventEmitter._listeners['newListener'] !== undefined) {
      eventEmitter.emit('newListener', type, listener);
    }

    eventEmitter._listeners[type][method](listener);
    return eventEmitter;
  };


  /**
   * @class
   * @see {@link https://github.com/Gozala/events/blob/master/events.js}
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
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener}
   */
  EventEmitter.prototype.addListener = function(type, listener) {
    return this.on.apply(this, arguments);
  };


  /**
   * @param  {String} type
   * @param  {...*}   [arguments] Optional.
   * @return {Boolean}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_emit_eventname_args}
   */
  EventEmitter.prototype.emit = function(type) {
    var listeners, args, i;

    if (this._listeners[type] === undefined) {
      return false;
    }

    listeners = this._listeners[type].slice();
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
   * @param  {String} type
   * @return {Number}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_listenercount_eventname}
   */
  EventEmitter.prototype.listenerCount = function(type) {
    var listeners = this._listeners[type];

    if (listeners !== undefined) {
      return listeners.length;
    }

    return 0;
  };


  /**
   * @param  {String} type
   * @return {Array}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_listeners_eventname}
   */
  EventEmitter.prototype.listeners = function(type) {
    var listeners = this._listeners[type];

    if (listeners !== undefined) {
      return listeners.slice();
    }

    return [];
  };


  /**
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_on_eventname_listener}
   */
  EventEmitter.prototype.on = function(type, listener) {
    return _addListener(this, type, listener, 'push');
  };


  /**
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_once_eventname_listener}
   */
  EventEmitter.prototype.once = function(type, listener) {
    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(this);
    }

    function temp() {
      this.removeListener(type, temp);
      listener.apply(this, arguments);
    };
    temp.type     = type;
    temp.listener = listener;

    return this.on(type, temp);
  };


  /**
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_prependlistener_eventname_listener}
   */
  EventEmitter.prototype.prependListener = function(type, listener) {
    return _addListener(this, type, listener, 'unshift');
  };


  /**
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_prependoncelistener_eventname_listener}
   */
  EventEmitter.prototype.prependOnceListener = function(type, listener) {
    if (typeof listener !== 'function') {
      return _emitFunctionTypeError(this);
    }

    function temp() {
      this.removeListener(type, temp);
      listener.apply(this, arguments);
    };
    temp.type     = type;
    temp.listener = listener;

    return this.prependListener(type, temp);
  };


  /**
   * @param  {String} [type] Optional.
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_removealllisteners_eventname}
   */
  EventEmitter.prototype.removeAllListeners = function(type) {
    var types, i;

    if (type !== undefined && this._listeners[type] !== undefined) {
      if (this._listeners['removeListener'] !== undefined) {
        _emitRemoveListeners(this, type);
      }

      delete this._listeners[type];
    }
    else {
      types = Object.keys(this._listeners);

      if (this._listeners['removeListener'] !== undefined) {
        for (i = 0; i < types.length; i++) {
          _emitRemoveListeners(this, types[i]);
        }
      }

      this._listeners = {};
    }

    return this;
  };


  /**
   * @param  {String}   type
   * @param  {Function} listener
   * @return {EventEmitter}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener}
   */
  EventEmitter.prototype.removeListener = function(type, listener) {
    var listeners, index;

    if (this._listeners[type] === undefined) {
      return this;
    }

    listeners = this._listeners[type];
    index     = listeners.indexOf(listener);

    if (index > -1) {
      if (this._listeners['removeListener'] !== undefined) {
        this.emit('removeListener', type, listener);
      }

      listeners.splice(index, 1);

      if (listeners.length === 0) {
        delete this._listeners[type];
      }
    }

    return this;
  };


  /**
   * @param  {Number} num
   * @return {EventEmitter}
   * @throws {TypeError}
   * @public
   * @see {@link https://nodejs.org/api/events.html#events_emitter_setmaxlisteners_n}
   */
  EventEmitter.prototype.setMaxListeners = function(num) {
    if (Math.floor(num) !== num || num <= 0) {
      throw new TypeError('num must be a positive integer');
    }

    this._maxListeners = num;
    return this;
  };


})(window, window.document);
