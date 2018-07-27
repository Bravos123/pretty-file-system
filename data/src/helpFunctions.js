define([], function(){
	"use strict";
	
	function initModule(outsideFunctions, interact, itemCreate){

		this.parseMetaData = function(putIn, data){
			for(var i=0; i<data.length; i++){
				if(data[i].type == "folder"){
					interact.selectedItem = putIn;
					var createdFolder = itemCreate.createFolder(data[i].name);
					interact.namesOfFolders.push(data[i].name);
					this.parseMetaData(createdFolder, data[i].contains);
				}else if(data[i].type == "file"){
					interact.selectedItem = putIn;
					interact.namesOfFiles.push(data[i].name);
					outsideFunctions.sticker = data[i].image;
					itemCreate.createFile(data[i].name);
				}
			}
		}



		this.selectFile = function(inContent, nmeId){
			for(var i=0; i<inContent.length; i++){
				if(inContent[i].type == "folder"){
					selectFile(inContent[i].contains, nmeId);
				}else if(inContent[i].type == "file"){
					if(typeof nmeId == "string"){
						if(inContent[i].name == nmeId){
							interact.selectedItem = inContent[i];
							break;
						}
					}else if(typeof nmeId == "number"){
						if(inContent[i].id == nmeId){
							interact.selectedItem = inContent[i];
							break;
						}
					}
				}
			}
		}



		this.checkForName = function(inContent, atPosition, position){
			for(var i=0; i<inContent.length; i++){
				if(inContent[i].type == "folder"){
					var seartchReturn = this.checkForName(inContent[i].content, atPosition, position);
					if(seartchReturn != undefined){
						return seartchReturn;
					}
				}else if(inContent[i].type == "file"){
					if(atPosition.v === position){
						return inContent[i].name;
					}
					atPosition.v++;
				}
			}
			return undefined;
		}




		this.parseContentToMeta = function(contentMeta, contentReadFrom){
			for(var i=0; i<contentReadFrom.length; i++){
				var contentObject;
				if(contentReadFrom[i].type == "folder"){
					contentObject = {
						type: contentReadFrom[i].type,
						name: contentReadFrom[i].name,
						contains: [],
						id: contentReadFrom[i].id
					};
					this.parseContentToMeta(contentObject.contains, contentReadFrom[i].content);
				}else if(contentReadFrom[i].type == "file"){
					var fileImage = undefined;
					if(contentReadFrom[i].image != undefined){
						fileImage = contentReadFrom[i].element.getElementsByTagName("img")[0].src;
					}
					contentObject = {
						type: contentReadFrom[i].type,
						name: contentReadFrom[i].name,
						id: contentReadFrom[i].id,
						image: fileImage
						//metaData: contentReadFrom[i].metaData.slice()
					};
				}
				contentMeta.push(contentObject);
			}
		}


		this.appendTopBarContainer = function(divIn, addCreationButtons, itemName, interact){
			var topColorContainer = document.createElement("div");
			topColorContainer.className = "fileExplorerTopCon";

			if(addCreationButtons){
				interact.buttonCreateItems = document.createElement("div");
				interact.buttonCreateItems.style.textAlign = "center";
				interact.buttonCreateItems.style.width = "100%";

				var buttonCreateItem = document.createElement("button");
				buttonCreateItem.className = "fileOptionButton fileOptionCreateFile";
				buttonCreateItem.innerHTML = "Create "+itemName;
				buttonCreateItem.addEventListener("mouseup", function(){
					outsideFunctions.createFile(null, true);
				});
				interact.buttonCreateItems.appendChild(buttonCreateItem);

				var buttonCreateFolder = document.createElement("button");
				buttonCreateFolder.className = "fileOptionButton fileOptionCreateFolder";
				buttonCreateFolder.innerHTML = "Create folder";
				buttonCreateFolder.addEventListener("mouseup", function(){
					//outsideFunctions.triggerCreateItem("folder");
					itemCreate.userCreateItem("folder");
				});
				interact.buttonCreateItems.appendChild(buttonCreateFolder);

				topColorContainer.appendChild(interact.buttonCreateItems);
			}


			interact.movingIndicator.className = "fileExplorerMI";
			topColorContainer.appendChild(interact.movingIndicator);

			divIn.appendChild(topColorContainer);
		}

	}return{
		init: initModule
	}


});