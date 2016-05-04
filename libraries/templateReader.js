/*
Read a template file depending on the mode: normal / wi

15 Apr > Cycles and Media Additions have WI inline. For table uses wi/wiInlineTable.html, and add second field wi/wiInlineInput.html for WI.
*/
var fs = require("fs");
var templatesFolder = './libraries/html_obj_templates/'; //Path to templates folder
var templatesMode = ''; //Not using WI by default
var sectionName = ''; 	//Useful in WI-Inline tables

//Change mode
var mode = function(s){
	templatesMode = s;
};

//Set Section Name. Useful in WI-Inline tables
var setSectionName = function(s){
	sectionName = s.trim().replace(/ /g,'').replace(/(\r\n|\n|\r)/gm,'').toLowerCase();
};

//Read template file
var readTemplateFile = function(template){
	var templateStr = '';
	
	if(templatesMode != '') //Check if WI
		try{
			//For Cycles and Media Additions
			if(template == 'Table' && templatesMode == 'wi' && (sectionName.indexOf('cycles') >= 0 || sectionName.indexOf('mediaadditions') >= 0))
				template = 'wiInline' + template;
			else if(template == 'Table_TH' && templatesMode == 'wi' && (sectionName.indexOf('cycles') >= 0 || sectionName.indexOf('mediaadditions') >= 0))
				templatesMode = 'normal';
				
			templateStr = fs.readFileSync(templatesFolder + templatesMode + '/' + template + '.html', 'utf8');
		}catch(e){  }
	
	if(templateStr.length == 0)
		templateStr = fs.readFileSync(templatesFolder + 'normal/' + template + '.html', 'utf8');
	
	if(templateStr.trim().length == 0)
		console.log("Error in template loading > " + template);
	else if(templatesMode == 'wi' && ['wiInlineTable', 'Table', 'Table_TH', 'Table_TD', 'Section_gray1', 'Section_gray1_table', 'Section_gray2', 'Section_gray2_table'].indexOf(template) < 0 && template.indexOf("Table") >= 0
	&& (sectionName.indexOf('cycles') >= 0 || sectionName.indexOf('mediaadditions') >= 0)) //Append WI controller
	{
		templateStr += fs.readFileSync(templatesFolder + templatesMode + '/wiInlineInput.html', 'utf8');
	}
	
	return templateStr;
};

module.exports = {
	mode: mode,
	setSectionName: setSectionName,
	read: readTemplateFile
};