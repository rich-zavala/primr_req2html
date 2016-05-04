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
var templateMode = true; //Indicator for adding TH-WI header

//Initiate html templates
var initTemplates = function(templatesMode){
	templateGen.mode(templatesMode);
	templateMode = templatesMode; //One with "s", other w/o "s" :)
	
	param2html.init(templatesMode); //Initialize parameters templates
	
	templates.Table = templateGen.read('Table');
	templates.TH = templateGen.read('Table_TH');
	templates.TH_uom = templateGen.read('Table_TH_uom');
	templates.TD = templateGen.read('Table_TD');
	
	if(templateMode != '') //Load TH-WI if needed
		templates.TH_wi = templateGen.read('Table_TH_wi');
};

//Call html generators
var html = function(obj){
	obj.name = obj.name.replace(/ /ig, '_');
	var table = templates.Table.replace('[name]', obj.name); //Return string

	//Generate fields
	var ths = '';
	var tds = '';
	var ths_wi = '';

	for(var i in obj.fields)
	{
		//Switch between table header and table header with unit of meassure
		var thisTH = '';
		if(obj.fields[i].uom == null)
			thisTH = templates.TH.replace('[label]', obj.fields[i].label);
		else
			thisTH = templates.TH_uom.replace('[label]', obj.fields[i].label).replace('[uom]', obj.fields[i].uom);
			
		//Add WI headers
		if(templateMode != '')
			ths_wi += templates.TH_wi.replace('[name]', obj.fields[i].name);
	
		ths += thisTH;
		tds += templates.TD.replace('[field]', param2html.html(obj.fields[i], true));
	}
	
	//Add objects to table
	var t = table.replace('[header]', ths).replace('[header_wi]', ths_wi).replace('[body]', tds);
	return t;
};

module.exports = {
	init: initTemplates,
	html: html
};