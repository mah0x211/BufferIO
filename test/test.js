var package = {
	BufferIO: require( '../lib/BufferIO' )
};

function Inspect( obj, level ){
	console.log( require('util').inspect( obj, true, level ) );
}

// MARK: should write test
var bio = new package.BufferIO( { endian:'big' } );
Inspect( bio );
console.log( bio.buf );
bio.write.string( 'sample' );
console.log( bio.buf );
console.log( bio.buf.toString() );
