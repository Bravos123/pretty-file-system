define(["itemDeleter", "moveItem"], function(itemDeleter, moveItem){
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
			option.onclick = func;


			/*option.addEventListener("mouseleave", function(){
				option.className = "fileExplorerMenuEntry fileExplorerMenuC1";
			});


			option.addEventListener("mouseenter", function(){
				option.className = "fileExplorerMenuEntry fileExplorerMenuLight";
			});*/
			

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