define([], function(){
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