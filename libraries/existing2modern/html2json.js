var fs = require('fs');
var cheerio = require('cheerio');
var objs = require("../objClasses"); //Object creation library
var inputCollection = "input, select, textarea";

//Read HTML file
var parseHTML = function(htmlFile){
	var data = fs.readFileSync(htmlFile);
	
	//Parse HTML to cheerio
	$ = cheerio.load(data);
	
	//Get page name
	var pageNameContainer = $('h1');
	var pageName = $('h1').text();
	
	//Initialize this page
	var page = objs.page(pageName);
	page.fileSourceName = htmlFile.split('/').pop();
	
	//Check if there is initial section or is untitled
	if(pageNameContainer.next().get(0).tagName != 'h2')
	{
		//Add empty h2 for correct secuential loop
		var emptySection = "<h2></h2>";
		pageNameContainer.after(emptySection);
		$.html();
	}
	
	//Initialize sections
	$('h2').each(function(){
	
		var h2 = $(this);
		var sectionName = h2.text().trim();
		if(sectionName == '') sectionName = '_untitled_';
		var section = objs.section(sectionName);
		
		/*
			== Parse tables contained in this section ==
			There are two kinds of tables:
			- Horizontal > Results in regular attribute array
			- Vertical > Have header row of attribute names and UOM
		*/
		
		h2.nextUntil('h2').each(function(){
			var table = $(this);
			if(table.get(0).tagName == "table")
			{
				var isHorizontal = table.find('tr').first().find(inputCollection).length > 0;
				
				if(isHorizontal)
				{
					table.find('tr').each(function(){
						var tr = $(this);
						
						/*
						There are two kinds of rows with input: 
						- Normal: TD[0] Label, TD[1] Field
						- Mixed: TD[0] Label text and field
						*/
						var isNormal = tr.find('td, th').first().find(inputCollection).length == 0; //No input in first cell
						if(isNormal)
						{
							//First cell is label
							var label = tr.find('td').first().text().trim();
							var param = objs.parameter(label);
							var field = tr.find('td').last().find(inputCollection);
							var info = fieldInfo(field);
							for(var i in info)
								param[i] = info[i];
							
							section.fields.push(param);
						}
						else //Field in every cell
						{
							tr.find('td, th').each(function(){
								var t = $(this);
								var label = t.text().trim();
								var param = objs.parameter(label);
								var field = t.find(inputCollection);
								var info = fieldInfo(field);
								for(var i in info)
									param[i] = info[i];
								
								section.fields.push(param);
							});
						}
					});
				}
				else //Is vertical table
				{
					var tableName = table.attr('aegisprimrtable');
					if(typeof tableName != 'undefined')
					{
						var secTable = objs.table(tableName);
					
						//Get labels and UOM
						var labels = [];
						table.find('tr').first().find('td, th').each(function(){
							var t = $(this);
							var label = '';
							var text = t.text().trim();
							var textParts = text.split('(');
							label = { label: textParts[0], uom: null };
							if(textParts.length > 1)
								label.uom = textParts[1].replace(')', '').trim();
							
							labels.push(label);
						});
						
						//Get fields
						table.find('tr').last().find('td, th').each(function(index, cell){
							var cell = $(cell);
							var param = objs.parameter(labels[index].label);
							if(labels[index].uom != null)
								param.uom = labels[index].uom;
							
							var field = cell.find(inputCollection);
							var info = fieldInfo(field);
							for(var i in info)
								param[i] = info[i];
								
							secTable.fields.push(param);
						});
						
						section.tables.push(secTable);
					}
					else
						console.log("Weird table found!");
				}
			}
		});
		page.sections.push(section);
	});
	
	return page;
};

//Get field info
var fieldInfo = function(obj){
	var type = obj.get(0).tagName;
	var info = {
		name:					obj.attr('name').trim(),
		controlType: 	'Text',
		dataType:			'String',
		validValues: 	[],
		readOnly: 		"No",
		default: 			null
	};
	
	//Set type
	console.log(type);
	switch(type)
	{
		case "input":
			if(type == 'input')
			{
				if(info.name.indexOf('_dt') >= 0)
					info.dataType = "Date";
				else if(obj.attr('type') == 'checkbox')
					info.controlType = "Checkbox";
			}
			
			if(typeof obj.val() != 'undefined' && obj.val() != null)
				info.default = obj.val().trim();
			
			break;
		
		case "select":
			controlType = 'List';
			obj.find('option').each(function(){ //Get values
				var t = $(this);
				info.validValues.push(t.text().trim());
			});
			
			break;
	}
	
	//Get UOM
	var uomField = obj.next('.field_uom');
	if(uomField.length > 0 && uomField.text().trim().length > 0)
		info.uom = uomField.text().trim();
	
	//Get read only attr
	if(obj.attr('readonly'))
		info.readOnly = "Yes";
	
	return info;
};

module.exports = {
	parse: parseHTML
};
