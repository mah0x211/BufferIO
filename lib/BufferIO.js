/*
	BufferIO.js
	author: Masatoshi Teruya
	email: mah0x211@gmail.com
	copyright (C) 2011, masatoshi teruya. all rights reserved.
*/
var package = {
	ctype: require('ctype')
};

// MARK: TYPE CHECKER
function isNumber( arg ){
	return ( typeof arg === 'number' );
}
function isString( arg ){
	return ( typeof arg === 'string' );
}

module.exports = function( opt, buffer )
{
	var self = this,
		pos = 0,
		size = 0,
		parser = new package.ctype.Parser( opt ),
		bitType = /^u?int(8|16|32)_t$/;
	
	this.buf = undefined;
	if( Buffer.isBuffer( buffer ) ){
		size = buffer.length;
	}
	
	this.buf = new Buffer( size );
	if( size ){
		buffer.copy( this.buf );
	}
	
	// position
	this.__defineGetter__('pos', function(){
		return pos;
	});
	this.__defineSetter__('pos', function( cur ){
		pos = cur;
	});
	// length
	this.__defineGetter__('size', function(){
		return size;
	});
	this.__defineSetter__('size', function( size_new )
	{
		var buf_new = new Buffer( size_new );
		this.buf.copy( buf_new );
		delete this.buf;
		this.buf = buf_new;
		size = size_new;
	});
	
	
	this.read = {
		_self: this,
		at: function( typedef, start, len, enc )
		{
			if( !isNumber( start ) || !isString( typedef ) ){
				throw new Error( 'invalid parameter error' );
			}
			else if( start < size )
			{
				var res = undefined;
				
				if( typedef === 'string' )
				{
					enc = ( isString( enc ) ) ? enc : 'utf8';
					if( isNumber( len ) )
					{
						if( len >= 0 ){
							res = this._self.buf.toString( enc, start, start + len );
						}
					}
					else {
						res = this._self.buf.toString( enc, start );
					}
					return res;
				}
				else if( bitType.test( typedef ) ){
					res = parser.readData( [{ val: { type: typedef, offset: 0 } }], this._self.buf, start );
					return res.val;
				}
				else {
					throw new Error( 'invalid parameter error' );
				}
			}
			return undefined;
		},
		string: function( len, enc )
		{
			var val = this.at( 'string', pos, len, enc );
			if( val !== undefined )
			{
				if( isNumber( len ) && len > 0 ){
					pos += len;
				}
				else {
					pos += Buffer.byteLength( val );
				}
			}
			return val;
		},
		int8_t: function()
		{
			var val = this.at( 'int8_t', pos );
			if( val !== undefined ){
				pos++;
			}
			return val;
		},
		int16_t: function(){
			var val = this.at( 'int16_t', pos );
			if( val !== undefined ){
				pos += 2;
			}
			return val;
		},
		int32_t: function(){
			var val = this.at( 'int32_t', pos );
			if( val !== undefined ){
				pos += 4;
			}
			return val;
		},
		uint8_t: function(){
			var val = this.at( 'uint8_t', pos );
			if( val !== undefined ){
				pos++;
			}
			return val;
		},
		uint16_t: function(){
			var val = this.at( 'uint16_t', pos );
			if( val !== undefined ){
				pos += 2;
			}
			return val;
		},
		uint32_t: function(){
			var val = this.at( 'uint32_t', pos );
			if( val !== undefined ){
				pos += 4;
			}
			return val;
		}
	};
	this.write = {
		_self: this,
		at: function( val, typedef, start, enc )
		{
			var wbyte = 0,
				// after size
				asize = 0;
			
			if( !isNumber( start ) || !isString( typedef ) ){
				throw new Error( 'invalid parameter error' );
			}
			
			if( typedef === 'buffer' && Buffer.isBuffer( val ) )
			{
				wbyte = val.length;
				asize = start + wbyte;
				// realloc
				if( asize > size ){
					this._self.size = asize;
				}
				val.copy( this._self.buf, start );
			}
			else if( typedef === 'string' && isString( val ) )
			{
				enc = ( isString( enc ) ) ? enc : 'utf8';
				wbyte = Buffer.byteLength( val, enc );
				asize = start + wbyte;
				// realloc
				if( asize > size ){
					this._self.size = asize;
				}
				wbyte = this._self.buf.write( val, start, enc );
			}
			else if( ( wbyte = bitType.exec( typedef ) ) && isNumber( val ) )
			{
				// convert bit to byte
				wbyte = wbyte[1] / 8;
				asize = start + wbyte;
				// realloc
				if( asize > size ){
					this._self.size = asize;
				}
				parser.writeData( [{ field: { type: typedef, offset: 0, value:val } }], this._self.buf, start );
			}
			else {
				throw new Error( 'invalid parameter error' );
			}
			
			return wbyte;
		},
		buffer: function( val, len, enc ){
			var wbyte = this.at( val, 'buffer', pos, len, enc );
			pos += wbyte;
			return wbyte;
		},
		string: function( val, len, enc ){
			var wbyte = this.at( val, 'string', pos, len, enc );
			pos += wbyte;
			return wbyte;
		},
		int8_t: function( val ){
			var wbyte = this.at( val, 'int8_t', pos );
			pos += wbyte;
			return wbyte;
		},
		int16_t: function( val ){
			var wbyte = this.at( val, 'int16_t', pos );
			pos += wbyte;
			return wbyte;
		},
		int32_t: function( val ){
			var wbyte = this.at( val, 'int32_t', pos );
			pos += wbyte;
			return wbyte;
		},
		uint8_t: function( val ){
			var wbyte = this.at( val, 'uint8_t', pos );
			pos += wbyte;
			return wbyte;
		},
		uint16_t: function( val ){
			var wbyte = this.at( val, 'uint16_t', pos );
			pos += wbyte;
			return wbyte;
		},
		uint32_t: function( val ){
			var wbyte = this.at( val, 'uint32_t', pos );
			pos += wbyte;
			return wbyte;
		}
	};
};


