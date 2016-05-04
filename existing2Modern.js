var fs = require('fs'),
		path = require('path')
		bookParser = require('./libraries/existing2modern/bookDefiner.js');

var storeFolder = 'htmls/modernized';
var folders = [
	'existing_html/exst_book'
];

var book_collection = [];

var run = function(){
	folders.forEach(function(existing){
		var thisCollection = {
			name: existing.split('/').pop(),
			books: []
		};
	
		//Get subfolders
		var foldersContainer = getDirectories(existing);
		foldersContainer.forEach(function(folder, index){
		
			var folderBook = existing + '/' + folder;
			bookParser.setFolder(folderBook);			
			var book = bookParser.run();
			thisCollection.books.push(book);
			
			fs.writeFile(storeFolder + '/existing_book_'+index+'.json', JSON.stringify(book, null, '\t'), 'utf-8'); //Store json for review
		});
		
		book_collection.push(thisCollection);
	});

	callback();
}

var callback = function(){
	fs.mkdir(storeFolder, function(){
		fs.writeFile(storeFolder + '/existing_book.json', JSON.stringify(book_collection, null, '\t'), 'utf-8'); //Store json for review
	});
	
	book_collection.forEach(function(collection){
		
		var collectionFolder = storeFolder + '/' + collection.name;
		fs.mkdir(collectionFolder, function(){ //Create collection folder
			
			collection.books.forEach(function(book){
				var bookFolder = collectionFolder + '/' + book.name;
				fs.mkdir(bookFolder, function(){ //Create book folder
					
					book.pages.forEach(function(page){
					
						//Initialize libraries
						var page2html = require('./libraries/page2html');
						page2html.init(true);

						var html = page2html.html(page);
						console.log(page.name);
						var html_file = bookFolder + '/' + page.fileSourceName + '_'
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

var getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};

run();