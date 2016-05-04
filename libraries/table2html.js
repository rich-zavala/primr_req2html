/*
Convert json table into html string
{
	name: string,
	label: string,
	fields: [
		{
			label: string,
			name: string,
			controlType: string,
			dataType: string,
			uom: string
		}
	]
}
*/
var templateGen = require("./templateReader");
var param2html = require("./param2html");
var templates = {};

//Initiate html templates
var initTemplates = function(templatesMode, sectionName){
	templateGen.mode(templatesMode);
	templateGen.setSectionName(sectionName);
	param2html.setSectionName(sectionName);
	param2html.init(templatesMode); //Initialize parameters templates
	
	templates.Table 				= templateGen.read('Table', sectionName);
	templates.TH 						= templateGen.read('Table_TH');
	// templates.TH_uom 				= templateGen.read('Table_TH_uom');
	templates.TH_uom 				= templateGen.read('Table_TH');
	templates.TD 						= templateGen.read('Table_TD');
};

//Call html generators
var html = function(obj){
	obj.name = obj.name.replace(/ /ig, '_');
	var table = templates.Table.replace(/\[name\]/ig, obj.name); //Return string

	//Generate fields
	var ths = '';
	var tds = '';

	for(var i in obj.fields)
	{
		//Switch between table header and table header with unit of meassure
		var thisTH = '';
		if(obj.fields[i].uom == null)
			thisTH = templates.TH;
		else
			thisTH = templates.TH_uom;

		thisTH = thisTH.replace(/\[label\]/ig, obj.fields[i].label)
									 .replace(/\[uom\]/ig, obj.fields[i].uom)
									 .replace(/\[name\]/ig, obj.fields[i].name);

		ths += thisTH;
		tds += templates.TD.replace(/\[field\]/ig, param2html.html(obj.fields[i], true));
	}
	
	//Add objects to table
	var t = table.replace(/\[header\]/ig, ths).replace(/\[body\]/ig, tds);
	return t;
};

module.exports = {
	init: initTemplates,
	html: html
};