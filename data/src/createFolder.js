define(["itemCreation", "inputPrompt", "helpFunctions"], 
	function(itemCreation, inputPrompt, helpFunctions){
	"use strict";
	function initModule(){
		

		var rootContent = {
			root: true,
			content: [],
			elemContainer: document.createElement("div")
		};
		rootContent.elemContainer.className = "fileExplorerRootCon";

		var interact = {
			selectedItem: rootContent,
			sharedResourceFolderJs: [],//reference of other folder listers that mirror this content
			hashedEntries: [],
			movingIndicator: document.createElement("div"),
			buttonCreateItems: undefined,
			root: rootContent,
			draging: undefined,
			holding: false,
			mouseDrag: false,
			idCounter: 0,
			params: undefined,
			namesOfFolders: [],
			newlyCreatedFile: undefined
		};
		var messageHandler = new inputPrompt.init();
		var deleter;
		


		var outsideFunctions = {
			/*setContent: function(newContent){
				rootContent = newContent;
			},*/
			/*getTopColorPanel: function(){
				return topColorContainer;
			},*/
			/*triggerCreateItem: function(type, givenName, forseCompletion, triggerSuccessFunc){
				itemCreate.userCreateItem(type, givenName, forseCompletion, triggerSuccessFunc);
			},*/
			getContent: function(){
				return rootContent.content;
			},
			setDivContainer: function(divIn){
				divIn.appendChild(outsideFunctions.thisMainContainer);
			},
			thisMainContainer: undefined,


			
			
			//customMessaging: false,
			getHashes: function(){
				return interact.hashedEntries;
			},
			setSharedResources: function(folderJsObjectToMirror){
				interact.sharedResourceFolderJs.push(folderJsObjectToMirror);
				//folderJsObjectToMirror.setContent(rootContent);
			},
			
			getRoot: function(){
				return rootContent;
			},
			
			selectItemFromReference: function(selectThis){
				interact.selectedItem = selectThis;
			},
			setIdCounter: function(val){
				interact.idCounter = val;
			},
			reset: function(){
				resetMe();
			},



			//Used by user
			sticker: undefined,
			updateFileImage: function(idOrName, img){
				var idPick;
				if(typeof idOrName == "string"){
					var foundId = false;
					//console.log("interact.idCounter: "+interact.idCounter);
					for(var i=0; i<interact.idCounter; i++){
						if(interact.hashedEntries[i] != undefined){
							if(interact.hashedEntries[i].name == idOrName){
								//console.log("found:");
								//console.log(interact.hashedEntries[i]);
								idPick = interact.hashedEntries[i].id;
								foundId = true;
								break;
							}
						}
					}
					if(!foundId){
						return;
					}
				}else{
					idPick = idOrName;
				}

				if(interact.hashedEntries[idPick] != undefined){
					if(interact.hashedEntries[idPick].type == "file"){
						interact.hashedEntries[idPick].element.getElementsByTagName("div")[0].style.backgroundImage = "url('"+img+"')";
						interact.hashedEntries[idPick].image = img;
						for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
							interact.sharedResourceFolderJs[i].getHashes()[idPick].element.getElementsByTagName("div")[0].style.backgroundImage = "url('"+img+"')";
							interact.sharedResourceFolderJs[i].getHashes()[idPick].image = img;
						}
					}
					outsideFunctions.sticker = undefined;
				}
				
			},
			getNameAtPosition: function(position){
				var atPosition = {v: 0};
				return helper.checkForName(rootContent.content, atPosition, position);
			},
			insertData: function(dataArray){
				if(dataArray == undefined){
					console.warn("Inserted data is undefined");
					return;
				}
				if(dataArray.length != 0 && dataArray.replace(/ /g, '') != ''){
					dataArray = JSON.parse(dataArray);
					helper.parseMetaData(rootContent, dataArray);
				}
			},
			getStructure: function(returnAsJSON){
				var contentMeta = [];
				helper.parseContentToMeta(contentMeta, rootContent.content);
				
				if(returnAsJSON === true){
					return JSON.stringify(contentMeta);
				}
				return contentMeta;
			},
			createFolder: function(fName){
				return itemCreate.createFolder(fName);
			},
			createFile: function(name, onCreate){
				itemCreate.createFile(name, onCreate);
			},
			selectItem: function(identifier){
				helper.selectFile(rootContent, identifier);
			},
			deSelect: function(){
				helper.deSelect();
			},
			flush: function(){
				resetMe();
				for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
					interact.sharedResourceFolderJs[i].reset();
				}
			},
			prompt: function(headerText, paragraph, defaultText, onComplete){
				messageHandler.prompt(headerText, paragraph, defaultText, onComplete);
			},
			alert: function(headerText, paragraph, onClose){
				messageHandler.alert(headerText, paragraph, onClose);
			},
			confirm: function(headerText, paragraph, func){
				messageHandler.confirm(headerText, paragraph, func);
			},
			onCreatedFileSuccess: function(){

			},
			onMoveItemUp: function(name, id){

			},
			onMoveItemDown: function(name, id){

			},
			onDuplicateFile: function(name, id, copyTargetName, copyTargetId){

			},
			onClickFile: function(fileClicked, id, image){

			},
			/*onCreateNewFile: function(name, id, procced){

			},*/
			onCreateNewFile: null,
			
			onRenameItem: function(name, id, newName){

			},
			onDeleteFile: function(name, id){

			}
		};

		var itemCreate = new itemCreation.init(rootContent, messageHandler, 
				outsideFunctions, interact);
		var helper = new helpFunctions.init(outsideFunctions, interact, itemCreate);



		function emptyElement(elem){
			while(elem.firstChild){
				elem.removeChild(elem.firstChild);
			}
		}

		function resetMe(){
			emptyElement(rootContent.elemContainer);
			interact.idCounter = 0;
			rootContent.content.length = 0;
			interact.namesOfFolders.length = 0;
			interact.hashedEntries.length = 0;
		}

		this.getInit = function(divIn, params){
			params.itemName = ((params.itemName == undefined) ? "File" : params.itemName);
			params.disableInteraction = ((params.disableInteraction == undefined) ? false : params.disableInteraction);
			params.onlyUniqueNames = ((params.onlyUniqueNames == undefined) ? false : params.onlyUniqueNames);
			params.createItemButtonOn = ((params.createItemButtonOn == undefined) ? true : params.createItemButtonOn);
			params.mirror = ((params.mirror == undefined) ? null : params.mirror);

			if(params.mirror != null){
				if(params.mirror.getRoot().content.length == 0){
					params.disableInteraction = true;
					params.onlyUniqueNames = false;
					params.createItemButtonOn = false;
				}else{
					params.mirror = null;
					console.log("Both file explorers must be empty before they can be connected through mirroring.");
				}
			}

			interact.params = params;

			if(divIn != undefined){
				if(typeof divIn == "string"){
					divIn = document.getElementById(divIn);
				}
			}else{
				divIn = document.createElement("div");
			}

			outsideFunctions.thisMainContainer = divIn;
			
			var realContainer = document.createElement("div");
			


			realContainer.className = "fileExplorerItemContainer fileExplorerSize";
			divIn.className = "fileExplorerContainer fileExplorerImage";




			if(!params.disableInteraction){
				helper.appendTopBarContainer(divIn, params.createItemButtonOn, params.itemName, interact);
			}

			


			divIn.appendChild(realContainer);


			realContainer.appendChild(rootContent.elemContainer);


			

			


			if(params.mirror != null){
				params.mirror.setSharedResources(outsideFunctions);
			}



			return outsideFunctions;
		}

		



		



	}return{
		init: initModule
	}


});