define(["menuOptions", "moveItem",
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

			addMouseAndTouch(folder.element, function(e){
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
				

				
			});


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
			addMouseAndTouch(file.element, function(e){
				e.stopPropagation();
				
				interact.holding = false;
				if(interact.draging == undefined || interact.mouseDrag == false){
					deSelectItem(interact.selectedItem);

					if(interact.selectedItem.id == file.id && interact.selectedItem != undefined){
						interact.selectedItem = rootContent;
						file.element.className = "fileExplorerItem";
					}else{
						slectItem(file);
						outsideFunctions.onClickFile(file.name, file.id, file.image, file.customData);
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


		function addMouseAndTouch(element, func){
			element.addEventListener("mouseup", func);
			if(isTouchDevice()){
				element.addEventListener("touchend", function(e){
					e.preventDefault();
					func();
				});
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
			return false;//Touch detection is not working properly
		    //return 'ontouchstart' in document.documentElement;
		}


		function addInteractionEvent(toElem, func, bubble){
			toElem.addEventListener("mouseup", func, bubble);
			toElem.addEventListener("touchend", func, bubble);
		}

	}return{
		init: initModule
	}


});