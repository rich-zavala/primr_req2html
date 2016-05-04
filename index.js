var folder = 'htmls';
var requirements = [
	// './requirements/REGN88 PRIMR Requirements.xlsx',
	// './requirements/REGN668 PRIMR Requirements.xlsx',
	// './requirements/REGN668 PRIMR Requirements - Cycles - Copy.xlsx',
	// './requirements/VEGF PRIMR Requirements CLEAN.xlsx',
	// './requirements/VEGF IVT BATCH Process GenerarJSON.xlsx'
	// './requirements/REGN88 PRIMR Requirements BP.xlsx'
	// './requirements/WI&BatchProcess.xlsx',
	// './requirements/REGN727 PRIMR Requirements.xlsx',
	// './requirements/general.xlsx',
	
	'./requirements/727.xlsx',
	'./requirements/88.xlsx',
	'./requirements/668.xlsx',
	'./requirements/vegf.xlsx'
];

requirements.forEach(function(req){
	var exec = require("./libraries/execute");
	exec.storeFolder(folder);
	exec.hierarchyName(req.split('/').pop());
	exec.filePath(req);
	exec.run();
});