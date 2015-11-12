twgl.EventDispatcher = function () {}

twgl.EventDispatcher.prototype = {

	constructor: twgl.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = twgl.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = twgl.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = twgl.EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = twgl.EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	},

	dispatchEvent: function ( event ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {

				listenerArray[ i ].call( this, event );

			}

		}

	}

};

twgl.Trackball = function ( object, domElement ) {
	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
};

twgl.Trackball.prototype = Object.create( twgl.EventDispatcher.prototype );
