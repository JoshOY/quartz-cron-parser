const nearley = require('nearley');
const grammar = require('./grammar.js');

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Parse something!
parser.feed("0,1,2 05/20 0 L-25 * * 1999-2001");

// parser.results is an array of possible parsings.
console.log(parser.results[0]); // [[[[ "foo" ],"\n" ]]]
