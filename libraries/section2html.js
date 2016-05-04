/*
Convert json section into html string
{
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
}
*/
var templateGen = require("./templateReader");
var param2html = require("./param2html");
var table2html = require("./table2html");
var templates = {};
var templatesMode = '';

//Initiate html templates. Get "template_mode" to check what kind of templates it will use.
var initTemplates = function(templateMode){
	templatesMode = templateMode;
	templateGen.mode(templatesMode);

	//Initialize parameters templates
	param2html.init(templatesMode, null);
	table2html.init(templatesMode, sectionName);
	
	templates = {
		untitled: 	templateGen.read('Section_untitled'),
		odd: 				templateGen.read('Section_gray2'),			 	//Light
		even: 			templateGen.read('Section_gray1'),			 	//Dark
		odd_table: 	templateGen.read('Section_gray2_table'), 	//Light w/table
		even_table: templateGen.read('Section_gray1_table')		//Dark w/table
	};
};

//Set This Section Name
var sectionName = '';
var setName = function(s){
	sectionName = s;
};

//Call html generators
var html = function(obj){
	//Catalog of HTML strings to be added to body
	var body = [];
	
	/*
	29 Abr 2016 > Parameters and tables must be displayed in order
	*/
	var objects = [];
	for(var i in obj.fields)
		objects.push(obj.fields[i]);
	for(var i in obj.tables)
		objects.push(obj.tables[i]);
	
	objects.sort(function(a,b) {return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0);} );
	
	if(objects.length > 0)
	{
		for(var i in objects)
			if(typeof objects[i].fields == 'undefined') //Fields
				body.push(param2html.html(objects[i]));
			else //Tables
				body.push(table2html.html(objects[i]));
		
		/*for(var i in obj.fields) //Fields
			body.push(param2html.html(obj.fields[i]));
		
		for(var i in obj.tables)
			body.push(table2html.html(obj.tables[i]));*/
	
		body = body.join('\n');
		return templates[obj.mode].replace(/\[name\]/ig, obj.name).replace(/\[section\]/ig, body); //Return string;
	}
	else
		return '<h1 class="sectionHeader">' + sectionName + '</h1>';
};

module.exports = {
	init: initTemplates,
	setName: setName,
	html: html
};