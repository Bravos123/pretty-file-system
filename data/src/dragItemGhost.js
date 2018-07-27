define([], function(){
	"use strict";

	/*
	This module creates the ghost element when draging an item.
	*/
	
	function initModule(){
		var ghost = document.createElement("div");
		ghost.className = "fileExplorerGhost";

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