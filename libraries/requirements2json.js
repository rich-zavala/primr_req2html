var Excel = require("exceljs");
var objs = require("./objClasses"); //Object creation library
var dictionary = {}; //Dictionary general catalog

//Used field names index
var usedNames = [];

var workbook2Json = function(hierarchyName, workbookFilePath, callback){
	//Ultra massive json array for this requirement
	var fileName = workbookFilePath.replace(/^.*[\\\/]/, ''); //No path. In here cuz in "simple()" causes errors...
	var req = {
		name: simple(fileName),
		books: []
	};

	var workbook = new Excel.Workbook();
	workbook.xlsx.readFile(workbookFilePath).then(function(data) {
		workbook.eachSheet(function(ws, sheetId) {
			var wbResult = parseworksheets(ws); //Execute!
			
			if(wbResult.pages.length > 0) //Some worksheets can't be parsed
				req.books.push(wbResult);
		});
		
		callback(req);
	});
}

//Parse page sheet
var parseworksheets = function(wsFields){
	//Big and great array of settings for this book
	var book = {
		name: null,
		pages: []
	};
	
	//Column reference index
	var colIndex = {
		bookName: 			null,
		pageName: 			null,
		label_html:			null,
		sectionName: 		null,
		parameterName:	null,
		ccv:						null,
		query:					null,
		wi_query:				null,
		controlType: 		null,
		dataType: 			null,
		uom_html:				null,
		uom: 						null,
		readOnly: 			null,
		required: 			null,
		formatMask: 		null,
		default: 				null,
		validValues: 		null,
		tableName: 			null,
		dfltrows:				null,
		minRows: 				null,
		maxRows: 				null
	};
	
	//Obtain row numbers with parameter titles
	var ccvNullReporter = false;
	var parametersRowFound = false; //Index to stop loop if row is found	
	var currentPage = -1;
	var currentSection = -1; //Index that indicates that there's a section currently setted. This in order to catch non-sectionated fields.
		
	wsFields.eachRow(function(row, rowNumber){
		if(!parametersRowFound) //Looking for headers row
		{
			row.eachCell(function(cell, colNumber){
				if(cell.value != null)
				{
					var cellVal = cell.value.trim().replace(/ /gm,'').replace(/(\r\n|\n|\r)/gm,'').toLowerCase();
					if(cellVal == "bookname") //Is row with labels
						parametersRowFound = true;
				
					if(parametersRowFound)//Parameters titles found in this row
					{
						var col = cell.address.replace(/[0-9]/g, ''); //Alphabetic part of address
						switch(cellVal)
						{
							case "bookname":
								colIndex.bookName = col;
								break;
							case "pagename":
								colIndex.pageName = col;
								break;
							case "labelhtml":
								colIndex.label_html = col;
								break;
							case "codecolumnvalue":
							case "codecolumnsvalues":
							case "codecolumnvalues":
								colIndex.ccv = col;
								break;
							case "wiquery":
							case "wi_query":
								colIndex.wi_query = col;
								if(colIndex.query == col) colIndex.query = null;
								break;
							case "query":
								if(colIndex.wi_query == null) colIndex.query = col;
								break;
							case "sectionname":
								colIndex.sectionName = col;
								break;
							case "parametername":
								colIndex.parameterName = col;
								break;
							case "controltype":
								colIndex.controlType = col;
								break;
							case "datatype":
								colIndex.dataType = col;
								break;
							case "uom":
								colIndex.uom = col;
								break;
							case "uomhtml":
								colIndex.uom_html = col;
								break;
							case "readonly":
								colIndex.readOnly = col;
								break;
							case "required":
								colIndex.required = col;
								break;
							case "formatmask":
								colIndex.formatMask = col;
								break;
							case "default":
								colIndex.default = col;
								break;
							case "validvalues":
								colIndex.validValues = col;
								break;
							case "tablename":
								colIndex.tableName = col;
								break;
							case "dfltrows":
								colIndex.dfltrows = col;
								break;
							case "minrows":
								colIndex.minRows = col;
								break;
							case "maxrow":
								colIndex.maxRows = col;
						}
					}
				}				
			});
			
		}
		else //Parameter columns index is set. Parse values for fields.
		{
			if(colIndex.ccv == null && !ccvNullReporter)
			{
				console.log('!!!	No CCV found at ' + wsFields.name);
				ccvNullReporter = true;
			}
		
			if(isValidValue(row.getCell(colIndex.bookName).value)) //Start book indexing
				book.name = simple(row.getCell(colIndex.bookName).value);
			
			if(isValidValue(row.getCell(colIndex.pageName).value)) //Start new page
			{
				var page = objs.page(row.getCell(colIndex.pageName).value);
				book.pages.push(page);
				currentPage = book.pages.indexOf(page);
				currentSection = -1; //Reset current section
				usedNames = []; //Reset used names
			}
			
			/* 29 Apr > Check if BR */
			if(isBR(row.getCell(colIndex.sectionName).value)) //Start new section
			{
				// console.log("ADDING!");
				// book.pages[currentPage].sections[currentSection].fields.push(objs.br(rowNumber));
				// var section = objs.section(row.getCell(colIndex.sectionName).value);
				var section = objs.section('_untitled_');
				book.pages[currentPage].sections.push(section);
				currentSection = book.pages[currentPage].sections.indexOf(section);
			}
			
			if(isValidValue(row.getCell(colIndex.sectionName).value)) //Start new section
			{
				var section = objs.section(row.getCell(colIndex.sectionName).value);
				book.pages[currentPage].sections.push(section);
				currentSection = book.pages[currentPage].sections.indexOf(section);
			}
			
			if(isValidValue(row.getCell(colIndex.parameterName).value)) //Start new parameter
			{
				if(currentSection < 0) //There's no section currently! This must be an out-of-section parameter
				{
					book.pages[currentPage].sections.push(objs.section('_untitled_'));
					currentSection = 0;
				}
			
				//Get parameter name
				if((colIndex.ccv == null || !isValidValue(row.getCell(colIndex.ccv).value)) && !isValidValue(row.getCell(colIndex.parameterName).value))
				{
					console.log("No name found!");
					return;
				}
				else
				{
					var pName = (colIndex.ccv == null) ? '' : row.getCell(colIndex.ccv).value;
					var pLabel = row.getCell(colIndex.parameterName).value;
					
					if(pName == null || pName.trim().length == 0)
						pName = simple(pLabel);
					else
						pName = pName.trim();
						
					var parameter = objs.parameter(pName, rowNumber);
					parameter.label = pLabel;
				}
				
				try{
					if(colIndex.label_html != null && row.getCell(colIndex.label_html).value.length > 0 && isValidValue(row.getCell(colIndex.label_html).value))
						parameter.label_html = row.getCell(colIndex.label_html).value.trim();
				}catch(e){}
				
				try{
					if(colIndex.uom_html != null && row.getCell(colIndex.uom_html).value.length > 0 && isValidValue(row.getCell(colIndex.uom_html).value))
						parameter.uom_html = row.getCell(colIndex.uom_html).value.trim();
				}catch(e){}				
				
				try{
					if(colIndex.query != null && row.getCell(colIndex.query).value.length > 0 && isValidValue(row.getCell(colIndex.query).value))
						parameter.query = row.getCell(colIndex.query).value.trim();
				}catch(e){}
				
				try{
					if(colIndex.wi_query != null && row.getCell(colIndex.wi_query).value.length > 0 && isValidValue(row.getCell(colIndex.wi_query).value))
						parameter.wi_query = row.getCell(colIndex.wi_query).value.trim();
				}catch(e){}
				
				if(isValidValue(row.getCell(colIndex.controlType).value))
					parameter.controlType = simple(row.getCell(colIndex.controlType).value);
					
				if(isValidValue(row.getCell(colIndex.dataType).value))
					parameter.dataType = simple(row.getCell(colIndex.dataType).value);
					
				if(isValidValue(row.getCell(colIndex.uom).value))
					parameter.uom = row.getCell(colIndex.uom).value.trim();
					
				//Parse valid values
				var tmpValidValues = row.getCell(colIndex.validValues).value;
				if(isValidValue(tmpValidValues) && (!isNaN(tmpValidValues) || tmpValidValues.indexOf(';') > 0))
				{
					if(!isNaN(tmpValidValues)) //Valid value is just a number
						parameter.validValues = [ tmpValidValues ];
					else
						parameter.validValues = tmpValidValues.split(';').map(function(s) { return s.trim() });
				}
					
				if(isValidValue(row.getCell(colIndex.readOnly).value))
					parameter.readOnly = row.getCell(colIndex.readOnly).value.trim();
					
				if(isValidValue(row.getCell(colIndex.required).value))
					parameter.required = row.getCell(colIndex.required).value.trim();
					
				if(isValidValue(row.getCell(colIndex.formatMask).value))
					parameter.formatMask = row.getCell(colIndex.formatMask).value.trim();
				
				try{
					if(isValidValue(row.getCell(colIndex.default).value))
						parameter.default = row.getCell(colIndex.default).value.trim();
				}catch(e){}
				
				if(parameter.controlType != null) //Those null use to be removed
				{
					var section = book.pages[currentPage].sections[currentSection]; //Alias
					if(isValidValue(row.getCell(colIndex.tableName).value)) //Check if the parameter must be in a table
					{
						var tableName = nameNoNumber(row.getCell(colIndex.tableName).value.trim());
						parameter.name = setParameterName(parameter.name, section.name, tableName, usedNames); //Check name
						var tmpSection = SectionTableAdd(section, tableName, parameter, rowNumber);
						
						//Expand table information
						try{
							if(isValidValue(row.getCell(colIndex.minRows).value))
								tmpSection.tables[tmpSection.tables.length - 1].minRows = row.getCell(colIndex.minRows).value;
						}catch(e){}

						try{
							if(isValidValue(row.getCell(colIndex.maxRows).value))
								tmpSection.tables[tmpSection.tables.length - 1].maxRows = row.getCell(colIndex.maxRows).value;
						}catch(e){}							

						try{
							if(isValidValue(row.getCell(colIndex.dfltrows).value))
								tmpSection.tables[tmpSection.tables.length - 1].dfltrows = row.getCell(colIndex.dfltrows).value;
						}catch(e){}
						
						book.pages[currentPage].sections[currentSection] = tmpSection;
					}
					else //Not in table
					{
						parameter.name = setParameterName(parameter.name, section.name, '', usedNames); //Check name
						book.pages[currentPage].sections[currentSection].fields.push(parameter);
					}
				}
			}
		}
	});

	return book;
}

//Function to check if variable is not null and not empty
function isValidValue(obj)
{
	try{
		return obj != null && (!isNaN(obj) || (obj.trim().length > 0 && obj.trim() != '</br>'));
	}catch(e){
		console.log(obj);
		console.log(obj + " is not a valid value:");
		console.log(obj);
	}
}

//Check if row is BR
function isBR(obj)
{
	var brCatalog = [ '</br>', '.', '<br>', '<br/>' ];
	return obj != null && isNaN(obj) && brCatalog.indexOf(obj.replace(/ /ig, '').trim()) >= 0;
}

//Add table to section, and add parameter to table
function SectionTableAdd(section, tableName, parameter, rowNumber)
{
	var index = -1;
	for(var i in section.tables)
		if(section.tables[i].name == tableName) //Table exists
		{
			index = i;
			break;
		}
	
	if(index < 0) //Is a new table
	{
		var table = objs.table(tableName, rowNumber);
		section.tables.push(table);
		index = section.tables.indexOf(table);
	}
	
	//Add parameter
	section.tables[index].fields.push(parameter);
	
	return section; //Return whole section
}

//Simplify string
var simple = function(str){
	if(typeof str != 'undefined')
	{
		return str.trim()
		.replace(/(\r\n|\n|\r)/gm,' ') //No line breaks
		.replace(/\.[^/.]+$/ig, '') //No extensions
		.replace( /[^a-zA-Z0-9]/ig , '_') //Not alphanumeric
		.replace(/ /ig,'_') //No spaces
		.replace(/_+/g, '_')
		.toLowerCase();
	}
	else
		return "--ERROR IN 'simple()'--";
};

//Add prefix if number at the beginning
var nameNoNumber = function(str){
	if(!isNaN(str.charAt(0))) //If is a number
		return 'n_' + str;
	else
		return str;
}

//Generate name for parameter
var setParameterName = function(name, section, table, usedNames){
	if(name == null) console.log(111);

	name = 		nameNoNumber(name);
	section = simple(section);
	table = 	simple(table);
	var nameSet = false;
	
	if(usedNames.indexOf(name) >= 0)
	{
		var arr = [section, table];
		for(var i in arr)
		{
			if(!nameSet && arr[i] != '')
			{
				name = setParameterNamePrefix(name, arr[i]);
				nameSet = usedNames.indexOf(name) < 0;
			}
		}
		
		if(!nameSet) //Still repeated. Must add number.
			name = setParameterNameNum(name, usedNames);
	}
	
	usedNames.push(name);
	return name;
};

//Attach prefix to parameter name
var setParameterNamePrefix = function(name, prefix){
	if(prefix != '' && prefix != name)
		name = prefix + '_' + name;

	return nameNoNumber(name);
}

//Numerate name as last option for dissernity
var setParameterNameNum = function(name, usedNames){
	var c = 1;
	usedNames.forEach(function(v){
		if(v.substring(0, v.length - 1) == name)
			c++;
	});
	return name + c.toString();
};

module.exports = {
	parse: workbook2Json,
	simple_string: simple
};