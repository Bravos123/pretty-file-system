define([], function(){
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