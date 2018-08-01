define('folderRenderer',[], function(){
	"use strict";
	
	function initModule(divIn, interact){



		/*
		This module is called by "itemCreation" to generate elements for folders and items. 

		The element is returnet and assigned to their respective object and appended.
		*/


		function preventContext(e){
			e.preventDefault();
		}


		this.createFolder = function(folder){
			var folderEle = document.createElement("div");
			folderEle.addEventListener("contextmenu", preventContext);

			var flexContainer = document.createElement("div");
			flexContainer.name = "flexContainer";
			flexContainer.className = "fileExplorerItem";

			var itemImg = document.createElement("div");
			itemImg.className = "fileExplorerImagePreview fileExplorerFolderClosed fileExplorerContainBack";
			flexContainer.appendChild(itemImg);

			var span = document.createElement("span");
			span.className = "fileExplorerSpan";
			span.innerHTML = folder.name;
			flexContainer.appendChild(span);
			
			if(!interact.params.disableInteraction){
				addEditButton(flexContainer);
			}

			folderEle.appendChild(flexContainer);

			folder.elemContainer.style.display = "none";
			folder.elemContainer.style.marginLeft = "16px";
			folderEle.appendChild(folder.elemContainer);



			return folderEle;
		}
		

		this.createFile = function(file){
			var itemEle = document.createElement("div");
			itemEle.className = "fileExplorerItem";
			itemEle.addEventListener("contextmenu", preventContext);


			var itemImg = document.createElement("div");
			itemImg.removeAttribute("style");
			itemImg.className = "fileExplorerImagePreview fileExplorerContainBack";
			//itemImg.style.filter = "brightness(100%)";
			if(file.image !== undefined && file.image.replace(/ /g, '') !== ''){
				itemImg.style.backgroundImage = "url('"+file.image+"')";
			}else{
				itemImg.className += " fileExplorerFile";
			}
			itemEle.appendChild(itemImg);

			var span = document.createElement("span");
			span.className = "fileExplorerSpan";
			span.innerHTML = file.name;
			itemEle.appendChild(span);





			if(!interact.params.disableInteraction){
				addEditButton(itemEle);
			}


			return itemEle;
		}


		function addEditButton(addTo){
			var edit = document.createElement("div");
			edit.className = "fileExplorerMiniMenu editFolderItem";
			addTo.appendChild(edit);
		}



	}return{
		init: initModule
	}


});
define('itemDeleter',[], function(){
	"use strict";
	
	function initModule(messageHandler, outsideFunctions, interact, rootContent){





		//public
		this.delete = function(interact){
			if(interact.selectedItem != undefined && interact.selectedItem.root == undefined){
				if(interact.selectedItem.type == "folder"){
					messageHandler.confirm("Delete", "Are you sure you want to delete the folder \""+interact.selectedItem.name+"\" and all it's content?", function(val){
						if(val){
							delete interact.hashedEntries[interact.selectedItem.id];
							deleteFolder(interact, true);
							/*if(interact.selectedItem.copyAssociates != undefined){
								for(var i=0; i<interact.selectedItem.copyAssociates.length; i++){
									interact.selectedItem.copyAssociates[i].element.parentElement.removeChild(interact.selectedItem.copyAssociates[i].element);
								}
							}*/
							
							deleteFile(interact.selectedItem, interact.selectedItem.parent, true);
							interact.selectedItem = rootContent;

						}
					});
				}else{
					messageHandler.confirm("Delete", "Are you sure you want to delete the file \""+interact.selectedItem.name+"\"?", function(val){
						if(val){
							delete interact.hashedEntries[interact.selectedItem.id];
							deleteFile(interact.selectedItem, interact.selectedItem.parent, true);
							interact.selectedItem = rootContent;
						}
					});
				}
			}


		}



		function deleteFile(deleteItem, parent, runOnDelete){
			var deletedName = deleteItem.name, deletedId = deleteItem.id;

			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				var copyElement = interact.sharedResourceFolderJs[i].getHashes()[targetId].element;
				copyElement.parentElement.removeChild(copyElement);
			}


			
			for(var i=0; i<parent.content.length; i++){
				if(parent.content[i].id == deleteItem.id){
					parent.content.splice(i, 1);
					break;
				}
			}

			var container = parent.elemContainer.children;
			for(var i=0; i<container.length; i++){
				if(container[i] == deleteItem.element){
					container[i].parentElement.removeChild(container[i]);
					break;
				}
			}

		
			if(runOnDelete){
				outsideFunctions.onDeleteFile(deletedName, deletedId);
			}
		}
		

		function deleteFolder(item, runOnDelete){
			var folderName = item.selectedItem.name;

			for(var i = item.selectedItem.content.length-1; i!=0; i--){
				if(item.selectedItem.content[i].type == "folder"){
					deleteFolder(item.selectedItem.content[i], runOnDelete);
				}else{
					deleteFile(item.selectedItem.content[i], item.selectedItem.content[i].parent, runOnDelete);
				}
			}

			for(var i = item.selectedItem.parent.content.length-1; i!=0; i--){
				if(item.selectedItem.parent.content[i].type == "folder" && item.selectedItem.parent.content[i].name == item.selectedItem.name){
					item.selectedItem.parent.content.splice(i, 1);
				}
			}
			

			for(var i=0; i<interact.namesOfFolders.length; i++){
				if(interact.namesOfFolders[i] == folderName){
					interact.namesOfFolders.splice(i, 1);
				}
			}
		}






	}return{
		init: initModule
	}


});
define('moveItem',[], function(){
	"use strict";
	
	function initModule(interact){


		this.moveItem = function(itemToMove, target, interact){
			executeMoving(itemToMove, target);

			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				var targetContainer = interact.sharedResourceFolderJs[i].getHashes()[target.id];
				if(targetContainer == undefined){
					targetContainer = interact.sharedResourceFolderJs[i].getRoot();
				}
				executeMoving(interact.sharedResourceFolderJs[i].getHashes()[itemToMove.id], 
					targetContainer);
			}
		}


		function executeMoving(itemToMove, target){
			//Remove element from container
			itemToMove.element.parentElement.removeChild(itemToMove.element);

			//Remove data object from parent container array
			itemToMove.parent.content.splice(itemToMove.parent.content.indexOf(itemToMove), 1);

			//assign new parent based on target folder
			if(target.content == undefined){
				itemToMove.parent = target.parent;
			}else{
				itemToMove.parent = target;
			}

			//append file's element in parent's element container
			itemToMove.parent.elemContainer.appendChild(itemToMove.element);
			itemToMove.parent.content.push(itemToMove);
		}



		this.moveItemUp = function(item){
			itemUp(item);
			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				itemUp(interact.sharedResourceFolderJs[i].getHashes()[item.id]);
			}
		}

		function itemUp(item){
			var itemContainer = item.element.parentElement;
			var itemChilds = itemContainer.children;
			var insertBefore = 0;
			for(var i=0; i<itemChilds.length; i++){
				if(itemChilds[i] == item.element){
					insertBefore = i-1;
					if(insertBefore < 0){insertBefore = 0;}
					break;
				}
			}
			//Remove element from container
			item.element.parentElement.removeChild(item.element);

			itemContainer.insertBefore(item.element, itemChilds[insertBefore]);


			moveElement(item.parent.content, item, -1);
		}

		this.moveItemDown = function(item){
			itemDown(item);
			for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
				itemDown(interact.sharedResourceFolderJs[i].getHashes()[item.id]);
			}
		}

		function itemDown(item){
			var itemContainer = item.element.parentElement;
			var itemChilds = itemContainer.children;
			var insertBefore = 0;
			for(var i=0; i<itemChilds.length; i++){
				if(itemChilds[i] == item.element){
					insertBefore = i+1;
					if(insertBefore > itemChilds.length-1){insertBefore = itemChilds.length-1;}
					break;
				}
			}
			//Remove element from container
			item.element.parentElement.removeChild(item.element);

			itemContainer.insertBefore(item.element, itemChilds[insertBefore]);


			moveElement(item.parent.content, item, 1);
		}



		var moveElement = function(array, element, delta) {
			var index = array.indexOf(element);
			var newIndex = index + delta;
			if (newIndex < 0  || newIndex == array.length) return; //Already at the top or bottom.
			var indexes = [index, newIndex].sort(); //Sort the indixes
			array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
		};

	}return{
		init: initModule
	}


});
define('menuOptions',["itemDeleter", "moveItem"], function(itemDeleter, moveItem){
	"use strict";
	
	function initModule(outsideFunctions, messageHandler, interact, rootContent){
		var itemMover = new moveItem.init(interact);
		var opened = false;
		var currentItem;


		var deleter = new itemDeleter.init(messageHandler, outsideFunctions, interact, rootContent);

		var cencelMovingButton = document.createElement("button");
		cencelMovingButton.className = "fileOptionButton";
		cencelMovingButton.innerHTML = "Cancel";
		cencelMovingButton.onclick = function(){
			currentItem.element.style.opacity = "1";
			interact.draging = undefined;
			interact.movingIndicator.style.display = "none";
			if(interact.buttonCreateItems != undefined){
				interact.buttonCreateItems.style.display = "block";
			}
		};
		if(interact.movingIndicator != undefined){
			interact.movingIndicator.appendChild(cencelMovingButton);
		}
		

		var placeHereButton = document.createElement("button");
		placeHereButton.className = "fileOptionButton";
		placeHereButton.innerHTML = "Place";
		placeHereButton.onclick = function(){

			currentItem.element.style.opacity = "1";
			interact.draging = undefined;
			interact.movingIndicator.style.display = "none";
			

			//Check if target new folder is not it's current folder
			var moveIt = true;
			if(interact.selectedItem.content == undefined){
				if(currentItem.id == interact.selectedItem.parent.id){
					moveIt = false;
				}
				if(interact.selectedItem.parent.root != undefined && currentItem.parent.root != undefined){
					moveIt = false;
				}
			}else{
				if(currentItem.id == interact.selectedItem.id){
					moveIt = false;
				}
				if(interact.selectedItem.root != undefined && currentItem.parent.root != undefined){
					moveIt = false;
				}
			}


			var targetParent;
			if(interact.selectedItem.content == undefined){
				targetParent = interact.selectedItem.parent;
			}else{
				targetParent = interact.selectedItem;
			}

			//check if file with same name already exists in target new folder
			for(var i=0; i<targetParent.content.length; i++){
				if(targetParent.content[i].name == currentItem.name){
					moveIt = false;
					if(targetParent.content[i].id != currentItem.id){
						messageHandler.alert("Alert", "There already exists an item with that name in target folder.");
					}
					break;
				}
			}



			//console.log(moveIt);
			if(moveIt){
				//Remove element from container
				/*currentItem.element.parentElement.removeChild(currentItem.element);

				//Remove data object from parent container array
				currentItem.parent.content.splice(currentItem.parent.content.indexOf(currentItem), 1);

				//assign new parent based on target folder
				if(interact.selectedItem.content == undefined){
					currentItem.parent = interact.selectedItem.parent;
				}else{
					currentItem.parent = interact.selectedItem;
				}

				//append file's element in parent's element container
				currentItem.parent.elemContainer.appendChild(currentItem.element);
				currentItem.parent.content.push(currentItem);*/

				itemMover.moveItem(currentItem, interact.selectedItem, interact);

				
			}
			
			if(interact.buttonCreateItems != undefined){
				interact.buttonCreateItems.style.display = "block";
			}
			interact.movingIndicator.className = "fileExplorerMI";

		};

		if(interact.movingIndicator != undefined){
			interact.movingIndicator.appendChild(placeHereButton);
		}
		



		var menu = document.createElement("div");
		menu.className = "fileExplorerMenu";

		addMenuOption("Move", function(){
			var domRect = menu.getBoundingClientRect();
			removeMenu();
			currentItem.element.style.opacity = "0.36";
			interact.mouseDrag = false;
			interact.draging = currentItem;

			if(interact.buttonCreateItems != undefined){
				interact.buttonCreateItems.style.display = "none";
			}
			
			interact.movingIndicator.style.display = "inline-block";
		});
		addMenuOption("Rename", function(){
			removeMenu();
			messageHandler.prompt("Rename", "Enter a new name: ", "Name", function(n){
				if(n != null){
					var increment = 0;
					var nameTest = n;
					while(checkFileNameAlreayExists(currentItem.parent.content, nameTest)){
						nameTest = increment+"_"+n;
						increment++;
					}

					for(var i=0; i<interact.sharedResourceFolderJs.length; i++){
						var renameItem = interact.sharedResourceFolderJs[i].getHashes()[currentItem.id];
						renameItem.name = nameTest;
						renameItem.element.getElementsByTagName("span")[0].innerHTML = nameTest;
					}

					outsideFunctions.onRenameItem(currentItem.name, currentItem.id, nameTest);
					currentItem.name = nameTest;
					currentItem.element.getElementsByTagName("span")[0].innerHTML = nameTest;
				}
			});
		});
		addMenuOption("Delete", function(){
			removeMenu();
			interact.selectedItem = currentItem;
			deleter.delete(interact);
		});
		

		var duplicateOption = addMenuOption("Duplicate", function(){
			removeMenu();
			messageHandler.prompt("Copy", "Enter a name for the copy: ", currentItem.name, function(n){
				if(n != null){
					if(n == currentItem.name){
						n = currentItem.name;
					}
					var increment = 0;
					var nameTest = n;
					while(checkFileNameAlreayExists(currentItem.parent.content, nameTest)){
						nameTest = increment+"_"+n;
						increment++;
					}
					interact.selectedItem = currentItem;
					outsideFunctions.sticker = currentItem.image;
					outsideFunctions.createFile(nameTest);
					outsideFunctions.onDuplicateFile(currentItem.name, currentItem.id, nameTest, interact.newlyCreatedFile.id);
				}
			});
		});


		addMenuOption("Move up", function(){
			removeMenu();
			itemMover.moveItemUp(currentItem);
			outsideFunctions.onMoveItemUp(currentItem.name, currentItem.id);
		});

		addMenuOption("Move down", function(){
			removeMenu();
			itemMover.moveItemDown(currentItem);
			outsideFunctions.onMoveItemDown(currentItem.name, currentItem.id);
		});





		this.open = function(item){
			if(interact.draging == undefined){
				interact.holding = false;
				if(opened){
					removeMenu();
					currentItem = item;
					appendMenu();
				}else{
					currentItem = item;
					appendMenu();
				}

				if(currentItem.type == "folder"){
					duplicateOption.style.display = "none";
				}else{
					duplicateOption.style.display = "block";
				}
			}
		}

		function appendMenu(){
			opened = true;
			currentItem.element.getElementsByClassName("editFolderItem")[0].style.webkitFilter = "none";
			currentItem.element.getElementsByClassName("editFolderItem")[0].style.filter = "none";
			currentItem.element.getElementsByClassName("editFolderItem")[0].appendChild(menu);

			for(var i=0; i<menu.children.length; i++){
				menu.children[i].className = "fileExplorerMenuEntry fileExplorerMenuC1";
			}
			
			//CLear selected text that occurs when menu becomes visible
			if (window.getSelection) {window.getSelection().removeAllRanges();}
 			else if (document.selection) {document.selection.empty();}

 			
			interact.root.elemContainer.addEventListener("mouseup", outsideClick, true);
			setTimeout(function(){
				document.body.addEventListener("mouseup", outsideClick, false);
				document.body.addEventListener("touchend", outsideClick, false);
			}, 45);
			
		}
		

		function removeMenu(){
			opened = false;
			try{
				currentItem.element.getElementsByClassName("editFolderItem")[0].removeAttribute("style");
				currentItem.element.getElementsByClassName("editFolderItem")[0].removeChild(menu);
			}catch(err){

			}
			
			document.body.removeEventListener("mouseup", outsideClick, false);
			document.body.removeEventListener("touchend", outsideClick, false);
			interact.root.elemContainer.removeEventListener("mouseup", outsideClick, true);
		}
		

		this.closeMenu = function(){
			removeMenu();
		}

		function outsideClick(e){
			var children = menu.children;

			var isButtonClick = false;
			for(var i=0; i<children.length; i++){
				if(e.target == children[i]){
					isButtonClick = true;
					break;
				}
			}

			if(!isButtonClick && e.target != menu){//Clicked outside
				removeMenu();
			}
		}

		function addMenuOption(name, func){
			var option = document.createElement("div");
			option.className = "fileExplorerMenuEntry";
			option.innerHTML = name;

			option.addEventListener("mouseup", function(){
				func();
			});

			menu.appendChild(option);

			return option;
		}


		function checkFileNameAlreayExists(contentArr, targetName){
			if(interact.params.onlyUniqueNames){
				for(var i=0; i<interact.namesOfFiles.length; i++){
					if(interact.namesOfFiles[i] == targetName){
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
define('dragItemGhost',[], function(){
	"use strict";

	/*
	This module creates the ghost element when draging an item.
	*/
	
	function initModule(){
		var ghost = document.createElement("div");
		ghost.className = "fileExplorerGhost";
		ghost.style.zIndex = "99999999";

		var icon = document.createElement("div");
		icon.className = "fileExplorerImagePreview";
		ghost.appendChild(icon);
		var text = document.createElement("span");
		text.className = "fileExplorerSpan";
		ghost.appendChild(text);

		var ghostActivated = false;

		this.createGhost = function(item){
			text.innerHTML = item.name;

			ghost.style.width = item.element.offsetWidth+"px";
			
			if(item.type == "file"){
				icon.className = "fileExplorerImagePreview fileExplorerContainBack";
				icon.style.backgroundImage = "url('"+item.element.getElementsByTagName("div")[0].src+"')";
			}else if(item.type == "folder"){
				icon.removeAttribute("style");
				icon.className = "fileExplorerImagePreview fileExplorerContainBack fileExplorerFolderClosed";
			}
			
			document.body.appendChild(ghost);

			document.body.addEventListener("mousemove", moveGhost);
			ghostActivated = true;
		}


		this.killGhost = function(){
			if(ghostActivated){
				ghostActivated = false;
				document.body.removeEventListener("mousemove", moveGhost);
				document.body.removeChild(ghost);
			}
		}

		function moveGhost(e){
			ghost.style.top = e.clientY+"px";
			ghost.style.left = e.clientX+"px";
		}

	}return{
		init: initModule
	}


});
define('interaction',["menuOptions", "moveItem",
	"dragItemGhost"], function(
		menuOptionsModule, moveItem,
		dragItemGhost){
	"use strict";
	
	function initModule(rootContent, outsideFunctions, messageHandler, interact){
		/*
		This module is called by "itemCreator" to assign listeners to folder and file elements
		*/

		var itemMover = new moveItem.init();
		var ghostCreator = new dragItemGhost.init();
		var menuOptions = new menuOptionsModule.init(outsideFunctions, messageHandler, interact, rootContent);





		rootContent.elemContainer.addEventListener("mouseup", function(e){
			if(!interact.params.disableInteraction){
				if(interact.draging != undefined && interact.mouseDrag == true){
					itemMover.moveItem(interact.draging, rootContent, interact);
				}
				interact.draging = undefined;
				interact.selectedItem = rootContent;
				ghostCreator.killGhost();
				interact.buttonCreateItems.style.display = "block";
				rootContent.elemContainer.className = "fileExplorerRootCon";
			}
		});



		this.addListenerFolder = function(folder){
			var event = "mouseup";
			if(isTouchDevice()){
				event = "touchend";
			}
			folder.element.addEventListener(event, function(e){
				e.stopPropagation();

				if(interact.draging == undefined || interact.mouseDrag == false){
					deSelectItem(interact.selectedItem);

					if(interact.selectedItem.element != undefined){
						//interact.selectedItem.element.className = "fileExplorerItem";
					}

					if(folder.open){
						folder.open = false;
						folder.elemContainer.style.display = "none";
						var contentContainer = folder.element.getElementsByTagName("div")[0];

						contentContainer.getElementsByTagName("div")[0].className = "fileExplorerImagePreview fileExplorerFolderClosed fileExplorerContainBack";
						contentContainer.className = "fileExplorerItem";
						interact.selectedItem = rootContent;
					}else{
						folder.open = true;
						folder.elemContainer.style.display = "block";
						var contentContainer = folder.element.getElementsByTagName("div")[0];
						
						contentContainer.getElementsByTagName("div")[0].className = "fileExplorerImagePreview fileExplorerFolderOpened fileExplorerContainBack";
						contentContainer.className = "fileExplorerItemSelectedColor";
						slectItem(folder);
					}
				}else{
					if(interact.draging.id != folder.id && !iAmSuperFolder(folder, interact.draging)){
						itemMover.moveItem(interact.draging, folder, interact);
					}
					applyItemClass(folder, "fileExplorerItem");
					interact.draging = undefined;
					interact.selectedItem = rootContent;
					ghostCreator.killGhost();
					interact.buttonCreateItems.style.display = "block";
				}
				

				
			}, false);


			if(!interact.params.disableInteraction){
				applyDragingListeners(folder);
			}
			


			if(folder.element.getElementsByClassName("editFolderItem")[0] != undefined){
				//ads listener to menu button
				addInteractionEvent(folder.element.getElementsByClassName("editFolderItem")[0], function(e){
					e.stopPropagation();
					menuOptions.open(folder);
				}, false);
			}
			
		}

		this.addListenerToFile = function(file){
			var event = "mouseup";
			if(isTouchDevice()){
				event = "touchend";
			}
			file.element.addEventListener(event, function(e){
				e.stopPropagation();
				
				interact.holding = false;
				if(interact.draging == undefined || interact.mouseDrag == false){
					deSelectItem(interact.selectedItem);

					if(interact.selectedItem.id == file.id && interact.selectedItem != undefined){
						interact.selectedItem = rootContent;
						file.element.className = "fileExplorerItem";
					}else{
						slectItem(file);
						outsideFunctions.onClickFile(file.name, file.id, file.image);
						file.element.className = "fileExplorerItemSelectedColor";
						interact.selectedItem = file;
					}
				}else{
					if(interact.draging.id != file.id && !iAmSuperFolder(file, interact.draging)){
						itemMover.moveItem(interact.draging, file, interact);
					}
					applyItemClass(file, "fileExplorerItem");
					interact.draging = undefined;
					interact.selectedItem = rootContent;
					interact.buttonCreateItems.style.display = "block";
					ghostCreator.killGhost();
				}
				

			});


			
			if(!interact.params.disableInteraction){
				applyDragingListeners(file);
			}
			

			if(file.element.getElementsByClassName("editFolderItem")[0] != undefined){
				addInteractionEvent(file.element.getElementsByClassName("editFolderItem")[0], function(e){
					e.stopPropagation();
					menuOptions.open(file);
				}, false);
			}
			
		}


		function iAmSuperFolder(superFolderCheck, movingItem){
			if(superFolderCheck.parent != undefined){
				if(superFolderCheck.parent.id == movingItem.id){
					return true;
				}
				return iAmSuperFolder(superFolderCheck.parent, movingItem);
			}
			return false;
		}

		function applyDragingListeners(item){
			//For draging
			item.element.addEventListener("mousedown", function(e){
				e.stopPropagation();
				if(interact.draging == undefined){
					interact.holding = item.id;
					interact.mouseDrag = true;
				}
			});
			item.element.addEventListener("mouseup", function(e){
				e.stopPropagation();
				interact.holding = false;
			});
			item.element.addEventListener("mouseleave", function(e){
				if(interact.holding !== false && interact.draging == undefined && interact.mouseDrag){
					interact.draging = interact.hashedEntries[interact.holding];
					interact.buttonCreateItems.style.display = "none";
					ghostCreator.createGhost(interact.draging);
					menuOptions.closeMenu();
					applyItemClass(item, "fileExplorerItem");
				}
				interact.holding = false;
				
			});
			item.element.addEventListener("mousemove", function(e){
				if(interact.draging != undefined && interact.mouseDrag){
					applyItemClass(item, "fileExplorerDragLight");
				}else{
					if(interact.selectedItem.id == item.id){
						applyItemClass(item, "fileExplorerItemSelectedColor");
					}else{
						applyItemClass(item, "fileExplorerItem");
					}
				}
			});
		}

		function deSelectItem(previousSelected){
			if(previousSelected != undefined){
				if(previousSelected.element != undefined){
					applyItemClass(previousSelected, "fileExplorerItem");
				}
			}
		}

		function applyItemClass(item, classAdd){
			if(item.type == "file"){
				if(item.element.className != classAdd){
					item.element.className = classAdd;
				}
			}else if(item.type == "folder"){
				if(item.element.className != classAdd){
					item.element.childNodes[0].className = classAdd;
				}
			}
		}

		function slectItem(selectThis){
			if(interact.selectedItem != undefined){
				interact.selectedItem = selectThis;
			}else{
				interact.selectedItem = rootContent;
			}
			
			if(interact.selectedItem.element != undefined){
				//interact.selectedItem.element.className = "fileExplorerItemSelectedColor";
			}
		}
		
		function isTouchDevice() {
		    return 'ontouchstart' in document.documentElement;
		}


		function addInteractionEvent(toElem, func, bubble){
			toElem.addEventListener("mouseup", func, bubble);
			toElem.addEventListener("touchend", func, bubble);
		}

	}return{
		init: initModule
	}


});
define('itemCreation',["folderRenderer",
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
define('inputPrompt',[], function(){
	"use strict";
	
	function initModule(){
		/*
		This module works as a replacement for prompt, conform and alert.
		
		the functions are:

		prompt: (headerText, paragraph, defaultText, onComplete){
		alert: (headerText, paragraph, onClose){
		confirm: (headerText, paragraph, onComplete){
		*/
		var execureWhenComplete = [];

		var onCompletePrompt;

		var backdrop = document.createElement("div");
		backdrop.className = "fileExplorerPromptBackdrop";


		var topColor = document.createElement("div");
		topColor.className = "fileExplorerPromptTopColor";

		var container = document.createElement("div");
		container.className = "fileExplorerPromptContainer";

		var head = document.createElement("h2");
		head.className = "fileExplorerPromptHeader";
		

		var para = document.createElement("p");
		para.className = "fileExplorerPromptPara";
		
		var inputText = document.createElement("input");
		inputText.id = "inputTextPrompt";
		inputText.type = "text";
		inputText.className = "fileExplorerParaInputText";


		var proceedButton = document.createElement("button");
		proceedButton.className = "fileOptionButton";

		var cancelButton = document.createElement("button");
		cancelButton.className = "fileOptionButton";
		cancelButton.style.float = "right";

		container.appendChild(head);
		container.appendChild(para);
		container.appendChild(inputText);

		container.appendChild(proceedButton);
		container.appendChild(cancelButton);
		topColor.appendChild(container);

		backdrop.appendChild(topColor);
		

		this.setFunctionExecOnComplete = function(newFunc){
			execureWhenComplete.push(newFunc);
		}

		this.prompt = function(headerText, paragraph, defaultText, onComplete){
			onCompletePrompt = onComplete;
			if(onComplete == undefined){
				customPrompt("", headerText, paragraph, defaultText);
			}else{
				customPrompt(headerText, paragraph, defaultText, onComplete);
			}
		}

		inputText.addEventListener("keyup", function(e){
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13){
				promptProceed();
			}
		}, false);

		function customPrompt(headerText, paragraph, defaultText, onComplete){
			document.body.appendChild(backdrop);
			restoreAniTopBar();
			inputText.value = defaultText;
			inputText.style.display = "block";
			cancelButton.style.display = "inline";

			head.innerHTML = headerText;
			para.innerHTML = paragraph;

			proceedButton.innerHTML = "Okay";
			cancelButton.innerHTML = "Cancel";

			proceedButton.onclick = function(){
				promptProceed();
			};

			cancelButton.onclick = function(){
				returnBar(function(){
					document.body.removeChild(backdrop);
					if(onComplete != undefined){
						onComplete(null);
					}
				});
			};
			animateTopBar();

			setTimeout(function(){
				selectInput();
			}, 25);
		}

		function selectInput(){
			var inputEle = document.getElementById("inputTextPrompt");
			
			inputEle.setSelectionRange(0, inputEle.value.length);
			inputEle.focus();
		}

		function promptProceed(){
			returnBar(function(){
				document.body.removeChild(backdrop);
				if(onCompletePrompt != undefined){
					onCompletePrompt(inputText.value);
					sendCompletion();
				}
			});
		}

		this.alert = function(headerText, paragraph, onClose){
			document.body.appendChild(backdrop);
			restoreAniTopBar();
			inputText.style.display = "none";
			cancelButton.style.display = "none";

			if(paragraph == undefined){
				head.innerHTML = "Error:";
				para.innerHTML = headerText;
			}else{
				head.innerHTML = headerText;
				para.innerHTML = paragraph;
			}
			

			proceedButton.innerHTML = "Okay";
			cancelButton.innerHTML = "Cancel";

			proceedButton.onclick = function(){
				returnBar(function(){
					document.body.removeChild(backdrop);
					if(onClose != undefined){
						onClose();
					}
				});
			};

			cancelButton.onclick = function(){};

			animateTopBar();


		}


		this.confirm = function(headerText, paragraph, func){
			if(func == undefined){
				customComfirm("", headerText, paragraph);
			}else{
				customComfirm(headerText, paragraph, func);
			}
		}

		function customComfirm(headerText, paragraph, func){
			document.body.appendChild(backdrop);
			restoreAniTopBar();
			inputText.style.display = "none";
			cancelButton.style.display = "inline";

			head.innerHTML = headerText;
			para.innerHTML = paragraph;

			proceedButton.innerHTML = "Yes";
			cancelButton.innerHTML = "No";

			proceedButton.onclick = function(){
				returnBar(function(){
					document.body.removeChild(backdrop);
					func(true);
				});
			};

			cancelButton.onclick = function(){
				returnBar(function(){
					document.body.removeChild(backdrop);
					func(false);
				});
			};

			animateTopBar();
		}


		function returnBar(onComplete){
			topColor.style.transition = "top 0.4s";
			topColor.style.top = "-"+topColor.clientHeight+"px";
			backdrop.style.opacity = "0";
			setTimeout(function(){
				onComplete();
			}, 400);
		}

		function animateTopBar(){
			topColor.style.transition = "top 0.4s";

			setTimeout(function(){
				topColor.style.top = "0px";
			}, 50);
		}

		function restoreAniTopBar(){
			topColor.style.transition = "";
			topColor.style.top = "-"+topColor.clientHeight+"px";
			backdrop.style.transition = "opacity 0.5s";
			backdrop.style.opacity = "1";
		}

		function sendCompletion(){
			for(var i=0; i<execureWhenComplete.length; i++){
				execureWhenComplete[i]();
			}
		}

	}return{
		init: initModule
	}


});
define('helpFunctions',[], function(){
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
					outsideFunctions.sticker = data[i].image;
					itemCreate.createFile(data[i].name);
				}
			}
			
		}



		this.applyItemClass = function(item, classAdd){
			if(item.type == "file"){
				if(item.element.className != classAdd){
					item.element.className = classAdd;
				}
			}else if(item.type == "folder"){
				if(item.element.className != classAdd){
					item.element.childNodes[0].className = classAdd;
				}
			}
		}

		this.deSelectItem = function(previousSelected){
			if(previousSelected != undefined){
				if(previousSelected.element != undefined){
					this.applyItemClass(previousSelected, "fileExplorerItem");
				}
			}
		}

		this.deSelect = function(){
			this.deSelectItem(interact.selectedItem);
		}

		this.selectFile = function(inContent, nmeId){
			this.deSelectItem(interact.selectedItem);

			if(typeof nmeId == "number" && nmeId < 0){
				return;
			}
			
			var id;
			if(typeof nmeId == "string"){
				for(var i=0; i<interact.idCounter; i++){
					if(interact.hashedEntries[i] != undefined){
						if(interact.hashedEntries[i].name == nmeId){
							id = interact.hashedEntries[i].id;
							break;
						}
					}
				}
			}else{
				id = nmeId;
			}

			if(id != undefined){
				if(interact.hashedEntries[id] != undefined){
					if(interact.hashedEntries[id].type == "file"){
						interact.selectedItem = interact.hashedEntries[id];
						this.applyItemClass(interact.selectedItem, "fileExplorerItemSelectedColor");
					}
				}
			}
			
		}





		


		this.checkForName = function(inContent, atPosition, position){
			for(var i=0; i<inContent.length; i++){
				if(inContent[i].type == "folder"){
					return this.checkForName(inContent[i].content, atPosition, position);
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
						fileImage = contentReadFrom[i].image;//contentReadFrom[i].element.getElementsByTagName("div")[0].src;
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
define('createFolder',["itemCreation", "inputPrompt", "helpFunctions"], 
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
