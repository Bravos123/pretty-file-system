define(["folderRenderer",
	"interaction"], function(folderRenderer,
		interaction){
	"use strict";
	
	function initModule(rootContent, messageHandler, outsideFunctions, 
		interact){
		var createInteraction = new interaction.init(rootContent, outsideFunctions, messageHandler, interact);
		var renderer = new folderRenderer.init(rootContent, interact);





		/**
		* @constructor
		*/
		function folder(){
			this.id;
			this.type = "folder";
			this.name = "";
			this.open = false;
			this.parent;
			this.content = [];
			this.elemContainer = document.createElement("div");
			this.image;
			this.element;
		}

		/**
		* @constructor
		*/
		function fileStruct(){
			this.id;
			this.type = "file";
			this.name = "";
			this.parent;
			this.contains = undefined;
			this.metaData = [];
			this.onclick = undefined;
			this.element;
			this.image = undefined;
		}


		this.createFolder = function(folderName){
			return createFolder(folderName, false);
		}

		this.createFile = function(fileName, runOnCreate){
			prepareCreatingFile(fileName, runOnCreate);
		}


		this.userCreateItem = function(type, givenName, forseCompletion, triggerSuccessFunc){
			internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
		}

		function internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc){
			if(type == "folder"){
				messageHandler.prompt("Create folder", "Enter a name for the folder:", "Folder name", function(name){
					if(name != null && name.replace(/ /g, '') != ''){
						var nameExists = false;
						if(interact.params.onlyUniqueNames){
							for(var i=0; i<interact.namesOfFolders.length; i++){
								if(interact.namesOfFolders[i] == name){
									nameExists = true;
									break;
								}
							}
						}
						if(!nameExists){
							createFolder(name, true);
							interact.namesOfFolders.push(name);
						}else{
							var errMess = "An item with that name already exists";
							if(name.replace(/ /g, '') == ''){
								errMess = "Invalid name";
							}
							messageHandler.alert("Error", errMess, function(){
								if(forseCompletion){
									internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
								}
							});
						}
						
					}else{
						if(forseCompletion){
							internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
						}
					}
				});
			}else{
				messageHandler.prompt("Create "+interact.params.itemName, "Enter a name:", "File name", function(name){
					if(name != null && name.replace(/ /g, '') != ''){
						var nameExists = false;
						if(interact.params.onlyUniqueNames){
							if(nameExistsGlobal(name)){
								nameExists = true;
							}
						}
						if(!nameExists){
							createItem(name, true);
						}else{
							var errMess = "An item with that name already exists";
							if(name.replace(/ /g, '') == ''){
								errMess = "Invalid name";
							}
							messageHandler.alert("Error", errMess, function(){
								if(forseCompletion){
									internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
								}
							});
						}
						
					}else{
						if(forseCompletion){
							internalUserCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
						}
					}

					/*if(name != null){
						createItem(name, true);
					}*/
				});
			}
		}


		function createFolder(folderName, createdByUser){
			if(interact.selectedItem == undefined){
				interact.selectedItem = rootContent;
			}
			var newFolder = new folder();
			newFolder.id = interact.idCounter;
			newFolder.name = folderName;
			newFolder.parentContainer = interact.selectedItem;
			newFolder.element = renderer.createFolder(newFolder);
			

			if(interact.selectedItem.content == undefined){//We have selected a file, take it's parent folder
				if(checkFolderNameAlreayExists(interact.selectedItem.parent.content, folderName) && createdByUser){
					messageHandler.alert("Alert", "There already exists a folder with that name in target folder.");
					return;
				}
				interact.selectedItem.parent.content.push(newFolder);
				newFolder.parent = interact.selectedItem.parent;
				interact.selectedItem.parent.elemContainer.appendChild(newFolder.element);
			}else{//We have selected a folder, use it
				if(checkFolderNameAlreayExists(interact.selectedItem.content, folderName) && createdByUser){
					messageHandler.alert("Alert", "There already exists a folder with that name in target folder.");
					return;
				}
				interact.selectedItem.content.push(newFolder);
				newFolder.parent = interact.selectedItem;
				interact.selectedItem.elemContainer.appendChild(newFolder.element);
			}
			
			//quickSortContent(interact.selectedItem, 0, interact.selectedItem.length, Math.floor(interact.selectedItem.length/2));
			interact.idCounter++;
			

			createInteraction.addListenerFolder(newFolder);

			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				if(newFolder.parent.root != undefined){//Select root as target folder
					interact.sharedResourceFolderJs[i].selectItemFromReference(undefined);
				}else{//Select mirrored parent folder as target
					interact.sharedResourceFolderJs[i].selectItemFromReference(
						interact.sharedResourceFolderJs[i].getHashes()[newFolder.parent.id]
						);
				}
				
					
				interact.sharedResourceFolderJs[i].createFolder(folderName);
			}


			if(createdByUser){
				outsideFunctions.onCreatedFileSuccess();
			}
			
			interact.hashedEntries[newFolder.id] = newFolder;
			interact.namesOfFolders.push(newFolder.name);


			return newFolder;
		}


		function prepareCreatingFile(fileName, onCreate){
			if(fileName == null){
				messageHandler.prompt("Create file", "Enter a name for the file:", "File name", function(name){
					if(name != null && name.replace(/ /g, '') != ''){
						prepareCreatingFile(name, onCreate);
					}
				});
			}else{
				if(interact.selectedItem == undefined){
					interact.selectedItem = rootContent;
				}

				if(onCreate){
					if(outsideFunctions.onCreateNewFile != null){
						outsideFunctions.onCreateNewFile(fileName, interact.idCounter, function(){
							return createItem(fileName, onCreate);
						});
					}else{
						createItem(fileName, onCreate);
					}
				}else{
					createItem(fileName, onCreate);
				}
			}
		}

		function createItem(fileName, onCreate){
			
			var newFile = new fileStruct();
			newFile.image = outsideFunctions.sticker;
			newFile.id = interact.idCounter;
			newFile.name = fileName;
			newFile.contains = interact.selectedItem;
			newFile.element = renderer.createFile(newFile);
			if(interact.selectedItem.content == undefined){//We have selected a file, take it's parent folder
				if(checkFileNameAlreayExists(interact.selectedItem.parent.content, fileName) && onCreate){
					messageHandler.alert("Alert", "There already exists an item with that name in target folder.");
					return false;
				}
				interact.selectedItem.parent.content.push(newFile);
				newFile.parent = interact.selectedItem.parent;
				interact.selectedItem.parent.elemContainer.appendChild(newFile.element);
			}else{//We have selected a folder, use it
				if(checkFileNameAlreayExists(interact.selectedItem.content, fileName) && onCreate){
					messageHandler.alert("Alert", "There already exists an item with that name in target folder.");
					return false;
				}
				interact.selectedItem.content.push(newFile);
				newFile.parent = interact.selectedItem;
				interact.selectedItem.elemContainer.appendChild(newFile.element);
			}
			

			if(onCreate){
				outsideFunctions.onCreatedFileSuccess();

				
			}
			interact.idCounter++;

			

			createInteraction.addListenerToFile(newFile);


			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				if(newFile.parent.root != undefined){//Select root as target folder
					interact.sharedResourceFolderJs[i].selectItemFromReference(undefined);
				}else{//Select mirrored parent folder as target
					interact.sharedResourceFolderJs[i].selectItemFromReference(
						interact.sharedResourceFolderJs[i].getHashes()[newFile.parent.id]
						);
				}
					
				interact.sharedResourceFolderJs[i].sticker = outsideFunctions.sticker;
				interact.sharedResourceFolderJs[i].createFile(fileName);
			}


			outsideFunctions.sticker = undefined;

			interact.hashedEntries[newFile.id] = newFile;

			interact.newlyCreatedFile = newFile;
			//return newFile;
			return true;
		}



		function checkFileNameAlreayExists(contentArr, targetName){
			if(interact.params.onlyUniqueNames){
				if(nameExistsGlobal(targetName)){
					return true;
				}
			}

			for(var i=0; i<contentArr.length; i++){
				if(contentArr[i].name == targetName){
					console.log("here2 ");
					return true;
				}
			}
			
			return false;
		}


		function nameExistsGlobal(name){
			var keys = Object.keys(interact.hashedEntries);
			for(var i=0; i<keys.length; i++){
				if(interact.hashedEntries[keys[i]].name == name){
					return true;
				}
			}
			return false;
		}

		function checkFolderNameAlreayExists(contentArr, targetName){
			if(interact.params.onlyUniqueNames){
				for(var i=0; i<interact.namesOfFolders.length; i++){
					if(interact.namesOfFolders[i] == targetName){
						return true;
					}
				}
			}

			for(var i=0; i<contentArr.length; i++){
				if(contentArr[i].name == targetName){
					return true;
				}
			}
			
			return false;
		}
		

	}return{
		init: initModule
	}


});