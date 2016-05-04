/*
Convert json section into html string
{
	name: string,
	sections:[{
		name: string,
		mode: string > untitled, odd, even
		tables: [{
			name: string,
			label: string,
			fields: [{
				label: string,
				name: string,
				controlType: string,
				dataType: string,
				uom: string
			}]
		}],
		fields: [{
			label: string,
			name: string,
			controlType: string,
			dataType: string,
			uom: string
		}]
	}]
}
*/
var fs = require("fs");
var section2html = require("./section2html");
var templatesFolder = './libraries/html_obj_templates/normal/'; //Path to templates folder
var template = '';
var templatesMode = '';

//Initiate html templates. Get "templatesNormal" to check what kind of templates it will use.
var initTemplates = function(templateMode){
	//Initialize parameters templates
	// section2html.init(templatesMode);
	templatesMode = templateMode;
	template = readTemplateFile('Body');
}

//Read template file
var readTemplateFile = function(type){
	return fs.readFileSync(templatesFolder + type + '.html', 'utf8');
}

//Call html generators
var html = function(obj){
	var usedNames = []; //Used field names index

	//Catalog of HTML strings to be added to body
	var form = [];
	
	var mode = true; //Mode selector
	for(var i in obj.sections)
	{
		//Set mode (even - odd)
		if(obj.sections[i].name == '_untitled_')
			obj.sections[i].mode = 'untitled';
		else
		{
			obj.sections[i].mode = (mode) ? 'even' : 'odd';
			mode = !mode;
			
			if(obj.sections[i].tables.length > 0)
			{
				//Repair table names
				for(var it in obj.sections[i].tables)
					obj.sections[i].tables[it].name = nameVerify(obj.sections[i].tables[it].name, usedNames);

				obj.sections[i].mode += '_table';
			}
		}
		
		section2html.setName(obj.sections[i].name);
		section2html.init(templatesMode);
		form.push(section2html.html(obj.sections[i]));
	}
		
	var form = form.join('\n');
	
	return template
				.replace(/\[title\]/ig, obj.name)
				.replace(/\[form\]/ig, form)
				.replace(/\[date\]/ig, new Date());
};

//Attach number to table for repeated names
var nameVerify = function(name, usedNames){
	var i = usedNames.indexOf(name);
	if(i >= 0)
	{
		var c = 1;
		usedNames.forEach(function(v){
			if(v.substring(0, v.length - 1) == name)
				c++;
		});
		name = name + c.toString();
	}
	
	usedNames.push(name);
	return name;
}

module.exports = {
	init: initTemplates,
	html: html
};