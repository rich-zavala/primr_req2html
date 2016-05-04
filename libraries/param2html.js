/*
Convert json parameter into html object
{
	label
	name
	controlType
	dataType
	uom
}
*/
var templateGen = require("./templateReader");
var templates = {}; //Template string collection

//Set This Section Name
var sectionName = '';
var setSectionName = function(s){
	sectionName = s;
};

//Initiate html templates, so there are available since de beginning
var initTemplates = function(templateMode, sectionName){
	templateGen.mode(templateMode);
	if(sectionName) templateGen.setSectionName(sectionName);
	
	templates = {
		text_string: 								templateGen.read('Text'),
		text_string_:								templateGen.read('Text'), //Weird parameter
		text_string_table:					templateGen.read('TextTable'),
		text_string_uom: 						templateGen.read('TextUom'),
		text_string_uom_table:			templateGen.read('TextTableUom'),
		text_integer: 							templateGen.read('Text'),
		text_integer_uom:						templateGen.read('TextUom'),
		text_integer_table:					templateGen.read('TextTable'),
		text_integer_uom_table:			templateGen.read('TextTableUom'),
		text_decimal: 							templateGen.read('Text'),
		text_decimal_table:					templateGen.read('TextTable'),
		text_decimal_uom: 					templateGen.read('TextUom'),
		text_decimal_uom_table:			templateGen.read('TextTableUom'),
		text_time_uom: 							templateGen.read('Time'),
		text_date: 									templateGen.read('Date'),
		text_date_table: 						templateGen.read('DateTable'),
		text_date_time: 						templateGen.read('Date'),
		text_date_time_table: 			templateGen.read('DateTable'),
		list_string: 								templateGen.read('List'),
		list_string_table:					templateGen.read('ListTable'),
		list_integer:								templateGen.read('List'),
		list_integer_table:					templateGen.read('ListTable'),
		list_integer_uom_table:			templateGen.read('ListTable'),
		list_decimal:								templateGen.read('List'),
		list_decimal_uom_table:			templateGen.read('ListTable'),
		checkbox_string: 						templateGen.read('Checkbox'),
		checkbox_string_uom:				templateGen.read('Checkbox'),
		checkbox_string_table: 			templateGen.read('CheckboxTable'),
		checkbox_string_uom_table:	templateGen.read('CheckboxTable'),
		br_br:											'<div class="break_line"></div>'
	};
};

//Call html generators
var html = function(obj, table){
	//Identify type of template to use
	try
	{
		var ident = obj.controlType.toLowerCase() + '_' + obj.dataType.toLowerCase();
		if(obj.uom != null) ident += '_uom';
		if(table) ident += '_table';
		
		//Valid values for List
		var options = '';
		if(obj.validValues.length > 0)
			options = "<option>" + obj.validValues.join("</option>\n<option>") + "</option>";
			
		//Set HTML special tag
		var label = (obj.label_html != null && obj.label_html.length > 0) ? obj.label_html : obj.label;
		var uom = (obj.uom_html != null && obj.uom_html.length > 0) ? obj.uom_html : obj.uom;
			
		var htmlObj = templates[ident]
									.replace(/\[name\]/ig, obj.name)
									.replace(/\[label\]/ig, label)
									.replace(/\[uom\]/ig, uom)
									.replace(/\[options\]/ig, options);
		return htmlObj;
	}
	catch(e)
	{
		console.log("=========== ERROR BEGIN ===========");
		console.log(e);
		console.log(obj);
		console.log(new Error().stack);
		console.log("IDENT: " + ident);
		console.log(templates[ident]);
		console.log("=========== ERROR END =============");
		return "";
	}
};

module.exports = {
	init: initTemplates,
	setSectionName: setSectionName,
	html: html
};