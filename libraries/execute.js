var fs = require("fs");
var parser = require("./requirements2json");

//Execute after parsing excel
var callback = function(req_json){
	console.log("Excel parsing ended for " + req_json.name);
	fs.mkdir(storeFolder, function(){
		var requirement_folder = storeFolder + '/' + req_json.name;
		
		//Create folder for requirement
		fs.mkdir(requirement_folder, function(){
			fs.writeFile(requirement_folder + '/book.json', JSON.stringify(req_json, null, '\t'), 'utf-8'); //Store json for review
			
			req_json.books.forEach(function(req){
				console.log("	Books for " + req_json.name + '/' + req.name);
			
				//Create folder for each book
				var book_folder = requirement_folder + '/' + req.name;
				fs.mkdir(book_folder, function(){
					req.pages.forEach(function(page, index){
						var templatesMode = ''; //Batch Process takes WI!
						if(req.name.indexOf('batch_process') > 0 || (req.name.indexOf('fds') > 0 && page.name.toLowerCase() != 'dp')) //FDS needs WI, but DP page dont
							templatesMode = 'wi';
					
						//Initialize libraries
						var page2html = require('./page2html');
						page2html.init(templatesMode);
					
						var html = page2html.html(page);
						var html_file = book_folder + '/' + pad(index, 2) + '_'
													+	(page.name.replace(/\//ig, '_').replace(/,/ig, '')) //No slashes, no commas
													+ '.html';
						
						fs.writeFile(html_file, html, 'utf-8', function(err){
							if (err) throw err;
						});
					});
				});
				
			});

		});
	});
};

//Folder to store html files
var storeFolder = '';
var setStoreFolder = function(str){ storeFolder = './' + str; }

//Set hierarchy name for dictionary
var hierarchyName = '';
var setHierarchyName = function(str){ hierarchyName = str; }

//File to parse
var filePath = '';
var setFilePath = function(str){ filePath = './' + str; }

//Run
var parse = function(){	
	if(storeFolder != '' && filePath != '')
		parser.parse(hierarchyName, filePath, callback);
	else
		console.log("Settings are missed");
}

//Leading zero for file name
function pad(num, size) {
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}

module.exports = {
	storeFolder: setStoreFolder,
	hierarchyName: setHierarchyName,
	filePath: setFilePath,
	run: parse
};