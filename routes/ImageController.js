/**
 * New node file
 */
exports.downloadImage = function(app){
	app.get('/uploads/:file', function(req, res) {
		file = req.params.file;
		var dirname = __dirname + "/public/home";
		var img = fs.readFileSync(dirname + "/uploads/" + file);
		res.writeHead(200, {
			'Content-Type' : 'image/jpg'
		});
		res.end(img, 'binary');
	});
}

exports.uploadImage = function(app){
	app.post('/upload', function(req, res) {
		console.log(req.files.image.originalFilename);
		console.log(req.files.image.path);
		fs.readFile(req.files.image.path, function(err, data) {
			var dirname = __dirname + "/public/home";
			var newPath = dirname + "/uploads/" + req.files.image.originalFilename
					+ ".jpg";
			fs.writeFile(newPath, data, function(err) {
				if (err) {
					res.json({
						'response' : "Error"
					});
				} else {
					res.json({
						'response' : "Saved"
					});
				}
			});
		});
	});
}