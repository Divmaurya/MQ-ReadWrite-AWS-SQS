// json data
var jsonData1 = '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';
var jsonData = '{"persons":"{"name":"John","city":"New York"}"}';

console.log(jsonData.persons.name);

// parse json
// var jsonParsed = JSON.stringify(jsonData);
 
// console.log(jsonParsed);

// access elements
console.log(jsonParsed.persons[0].name);