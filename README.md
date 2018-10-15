# pretty-file-system

## About:
Pretty file system(PFS) is a simple but powerfull tool to manage file systems.


## How to use:
PFS can be used as a RequireJS module or as a normal library.

```
If you use "data/dist/prettyFileSystem.js" you create a PFS object to manipulate a file system:
var parameters = {
		itemName: "File",
		disableInteraction: false,
		onlyUniqueNames: true,
		createItemButtonOn: true,
		canResize: false
};

var system = new prettyFiles.init().getInit("ID OF TARGET FILE SYSTEM ELEMENT", parameters);
```

Functions are accessed through:
```
system.FUNCTIONNAME();
```

Just remember to include a stylingsheet from "data/styles/"
```
<link rel="stylesheet" type="text/css" href="data/styles/Happy-doodles.css">
```

**Be sure to look at the examples!**

# Functions
###### updateFileImage(id, image)
Applies the new image source *image* on file with id *id*.

###### getNameAtPosition(p)
Itterates through every item and returns the item at position *p*.

###### insertData(JSONData)
Recreates a file system based on the JSON string *JSONData*.

The structure to insert an item would be:
{
	type: "file",
	name: STRING,
	image: STRING,
	customData: any Javascript variable type
}

The structure to insert an item would be:
{
	type: "folder",
	name: STRING,
	contains: an array that may contain more folder or file objects.
}


###### getStructure(returnAsJSON = false)
Returns the root content object. If *returnAsJSON* is true a JSON string is returned instead.
This function combined with *insertData* allows you to save and load states.

###### createFolder(folderName)
Creates folder with name *folderName*. To specify where it should be created use *selectItem*.

###### createFile(fileName, triggerCreateFunc, customData)
Creates file with name *fileName*. To specify where it should be created use *selectItem*.
If the file is created successfully and *triggerCreateFunc* is true, *onCreateNewFile* will be executed.
*customData* is a property where you can store any custom data in the item object.

###### selectItem(identifier)
Selects the item based on *identifier*. If *identifier* is a string the item with the name *identifier*
will be selected, otherwise if *identifier* is a number the item with that id will be selected.

###### flush()
Removes all items from the file system window. The items are not deleted. The file system is only resetted.

###### deSelect()
Deselects currently selected item.

###### prompt(headerText, paragraph, defaultText, onComplete)
Allows you to use the built in custom prompt. This asks the user for an input and executes *onComplete* when complete.
*onComplete* is executed with one paramater that is the user input.
Example:
```
system.prompt("Header", "Paragraph", "Default text", function(INPUT){
  //Handle input text INPUT
});
```

###### alert(headerText, paragraph, onClose)
Allows you to use the built in custom alert. When the alert is closed *onClose* is executed. *onClose* can be undefined.

###### confirm(headerText, paragraph, onComplete)
Allows you to use the built in custom confirm. When the confirmation is complete *onComplete* is executed.


# Assignable functions.
All these functions should be assigned a custom function.
Example:
```
filesystem.onClickFile = function(fileClicked, id, image){
  console.log("Clicked file: "+fileClicked+"\nid: "+id+"\nimage: "+image);
};
```

###### onCreatedFileSuccess()
This function is executed when a file is successfully created.

###### onMoveItemUp(name, id)
This function is executed when an item is moved up. It's name and id is given as parameters.

###### onMoveItemDown(name, id)
This function is executed when an item is moved down. It's name and id is given as parameters.

###### onDuplicateFile(name, id, copyTargetName, copyTargetId)
This function is executed when a file is duplicated. Duplicated target's name and id is given as parameters, as well as 
the new duplicate file's name and id.

###### onClickFile(fileClicked, id, image, customData)
This function is executed when a file is clicked. It's name(*fileClicked*),  id and image is given as parameters.
If the clicked item had any data set on it's *customData* it will be sent as the parameter *customData*.

###### onCreateNewFile(name, id, procced)
This function is executed when a new file is created. The new file's name and id is given as parameters.
If this function is used, you must allways call procced(); somewhere in your custom function. *This is because the custom
input is asynchronous so the rest of the function needs to be called as a separet function when the input is done.*

Example:
```
system.onCreateNewFile = function(name, id, procced){
  //User created a file called "name". create an object called "name" in my own program.
  carsList.push_back(name);
  
  procced();
};
```

###### onRenameItem(name, id, newName)
This function is executed when a file is renamed. Target file's name and id is given as parameters, as well as the new name
for the file.

###### onDeleteFile(name, id)
This function is executed when a file is deleted. Target file's name and id is given as parameters.


# Variables
###### sticker
This is a buffer that holds an image source. This image souce will be applied to the next created file.
After that it will be reset to undefined. This allows you to apply an image to created files.

Example:
```
system.onCreateNewFile = function(name, id, procced){
  system.prompt("Image", "Include an image source", "", function(input){
			if(input != null && input.replace(/ /g, '') != ''){
				system.sticker = input;
				proceed();
				if(proceed()){
					system.sticker = input;
				}
			}
		});
};
```

# How to build
This library is developed in RequireJS. If you want to make changes you need to download the folder /data/src/\*. 
From there you use r.js to compile it into a single file, which will still require require-min.js to function. If you want to 
create a stand alone version, like the prebuilt version /data/dist/prettyFileSystem.js, use AMDclean http://gregfranko.com/amdclean/.

# Examples
[base example](https://www.vitalkia.com/jsLibraries/FileExplorer/examples/example1.html)

[Mirroring example](https://www.vitalkia.com/jsLibraries/FileExplorer/examples/mirroring.html)

[Different styles example](https://www.vitalkia.com/jsLibraries/FileExplorer/examples/stylesDisplay.html)
