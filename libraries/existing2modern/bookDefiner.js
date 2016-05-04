var fs = require('fs');


//Set folder
var folder = '';
var setFolder = function(str){ folder = str; }

//Read folder
var validFolder = false;
var run = function(){
	if(folder.length > 0)
	{
		//Main object
		var book = {
			name: null,
			pages: []
		};
	
		var files = fs.readdirSync(folder);
		if(files.length > 0)
			book.name = folder.split('/').pop();
		
		files.forEach(function(file){
			if(file.split('.').pop() == 'html')
			{
				var parser = require('./html2json');
				var filePath = folder + '/' + file;
				
				book.pages.push(parser.parse(filePath));
				validFolder = true;
			}
		});
		
		if(validFolder)
			return book;
		else
		{
			console.log('No valid HTML was found');
			return {};
		}
	}
	else
	{
		console.log('No folder specified')
		return {};
	}
};

module.exports = {
	setFolder: setFolder,
	run: run
};