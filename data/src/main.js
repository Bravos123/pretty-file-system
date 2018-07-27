require(["createFolder"], function(folderMaker){


	
	var parameters = {
		itemName: "File",
		disableInteraction: false,
		onlyUniqueNames: true,
		createItemButtonOn: true,
		canResize: false
	};
	var lister = new folderMaker.init().getInit("hook", parameters);

	parameters = {
		itemName: "File",
		disableInteraction: false,
		onlyUniqueNames: true,
		createItemButtonOn: true,
		canResize: true,
		mirror: lister
	};
	var mirror = new folderMaker.init().getInit("mirror", parameters);

	lister.createFolder("FOLDER");

	lister.flush();

	lister.onClickFile = function(name, id){
		alert("clicked lister's file: "+name+" id: "+id);
	};

	lister.onDeleteFile = function(name, id){
		alert("Deleted lister's file: "+name+" id: "+id);
	};

	mirror.onClickFile = function(name, id){
		alert("clicked mirror's file: "+name+" id: "+id);
	};

	lister.onCreateNewFile = function(name, id, procced){
		/*var stick = prompt("Input sticker");
		if(stick != null){
			lister.sticker = stick;
		}*/
		console.log("name: "+name);
		console.log("id: "+id);
		procced();
	};

	document.getElementById("ch").onclick = function(){
		var stick = prompt("Input sticker");
		if(stick != null){
			lister.sticker = stick;
		}

		var id = prompt("ID:");
		if(id != null){
			lister.updateFileImage(id, stick);
		}
	};

	
	document.getElementById("gc").onclick = function(){
		console.log(lister.getStructure(true));
	};
	document.getElementById("sc").onclick = function(){
		var data = prompt("Data:");
		lister.insertData(data);
	};
	document.getElementById("fl").onclick = function(){
		lister.flush();
	};

});