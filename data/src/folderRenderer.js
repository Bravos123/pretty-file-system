define([], function(){
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