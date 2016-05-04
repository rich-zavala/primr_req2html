/* Catalog of object types for JSON creation */

//Create new empty page
function newPage(name){
	return {
		name: name.trim(),
		sections: []
	};
}

//Create new empty section
function newSection(name){
	return {
		name: name.trim(),
		fields: [],
		tables: []
	};
}

//Create new empty table
function newTable(name, order){
	return {
		name: name.trim(),
		minRows: 0,
		maxRows: 0,
		dfltrows: 0,
		order: order,
		fields: []
	};
}

//Create new empty parameter
function newParameter(name, order){
	return {
		name: 				name,
		label: 				null,
		label_html: 	null,
		controlType:	null,
		dataType: 		null,
		uom: 					null,
		uom_html:			null,
		validValues:	[],
		readOnly: 		"No",
		required: 		"No",
		formatMask: 	null,
		default: 			null,
		query:				null,
		wi_query:			null,
		order: order
	};
}

//Create new BR
/*function newBR(order)
{
	var o = newParameter('br', order)
	o.controlType = 'br';
	o.dataType = 'br';
	return o;
}*/

module.exports = {
	page: 			newPage,
	section: 		newSection,
	table: 			newTable,
	parameter:	newParameter,
	// br:					newBR
};