define([], function(){
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