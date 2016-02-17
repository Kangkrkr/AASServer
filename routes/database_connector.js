/**
 * New node file
 */


exports.connect = function(mysql){
	return mysql.createConnection({
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : 'kang0723',
		database : 'teraDB'
	});
}