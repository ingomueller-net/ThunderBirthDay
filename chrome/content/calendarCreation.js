/**
 * Modifies the calendarCreation dialog to the suits of ThunderBirthDays
 */
function cTBD_loadCalendarCreation() {
	// Show cTBD_locationPageLocal instead of skipping the location page for local calendars
	var initialPage = document.getElementsByAttribute('pageid', 'initialPage')[0];
	initialPage.setAttribute('onpageadvanced','cTBD_onInitialAdvance()');
	
	// Enable automatic name proposition for the new calender when choosing thunderbird format
	var  customizePage = document.getElementsByAttribute('pageid', 'customizePage')[0];
	customizePage.setAttribute('onpageshow',
				"cTBD_initName(); " + customizePage.getAttribute('onpageshow'));

	customizePage.setAttribute('onpageadvanced',
				 "cTBD_preCreateCalendar(); " + customizePage.getAttribute('onpageadvanced'));
	
	// Fill Dropdownbox with adressbooks
	cTBD_fillDropDownBox();
	
	// debug
	test();
}


/**
 * Fills the dropdownbox on the cTBD_locationPageLocal page with the names of the adresbooks
 */
function cTBD_fillDropDownBox() {
	var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
	var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);
	
	var abSubDirs = abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);
	
	var listbox = document.getElementsByAttribute('id', 'cTBD-abook-uri-popup')[0];
	
	// "All adressbooks" item
	var menuitem = document.createElement("menuitem");
	menuitem.setAttribute('label',"Alle Adressbuecher");
	menuitem.setAttribute('value',"moz-abdirectory://");
	
	listbox.appendChild(menuitem);
	
	// List of adressbooks
	while (abSubDirs.hasMoreElements()) {
		var abDir = abSubDirs.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
		
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute('label',abDir.dirName);
		menuitem.setAttribute('value',abDir.directoryProperties.URI);
		
		listbox.appendChild(menuitem);
	}
}


/**
 * Replaces the onInitialAdvance() function. Changes the next page after the initial page according to the selected radio button.
 */
function cTBD_onInitialAdvance() {
    var type = document.getElementById('calendar-type').selectedItem.value;
    var page = document.getElementsByAttribute('pageid', 'initialPage')[0];
    if (type == 'local')
        page.next = 'cTBD_locationPageLocal';
    else
        page.next = 'locationPage';
}

/**
 * Hides/Unhides the textbox for the abook-path according to whether the thunderbird radio button is selected or not.
 */
function cTBD_onChangeFormatSelection() {
	if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0].selectedItem.value == 'thunderbirthday') {
		document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].setAttribute('hidden','false');
	} else {
		document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].setAttribute('hidden','true');
	}
	
	cTBD_checkRequiredLocal();
}

/**
 * Checks if either default format is selected or cTBD-abook-uri is a valid uri ending with /abook.mab and enables forwarding if so.
 */
function cTBD_checkRequiredLocal() {
	var canAdvance = false;
	
	if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0].selectedItem.value != 'thunderbirthday' ||
				document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].selectedItem != null) {
		canAdvance = true;
	}
	
	document.getElementById('calendar-wizard').canAdvance = canAdvance;
}

/**
 * Fills the textbox on the customizePage with a proposition, if thunderbird has been choosen as calender format
 */
function cTBD_initName() {
    var nameField = document.getElementById("calendar-name");
    if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0].selectedItem.value != 'thunderbirthday'
				|| nameField.value)
        return;

    nameField.value = "Geburtstage des Thunderbird-Adressbuchs";
}

/**
 * Sets calender-type and calender-format to thunderbirthday, so the appropriate provider will be choosen on calendar creation
 */
function cTBD_preCreateCalendar() {
	if (document.getElementById('cTBD-calendar-format').selectedItem.value == "thunderbirthday") {
		document.getElementById("calendar-uri").value = 
					document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].value;
		document.getElementById('calendar-type').selectedItem.value = "thunderbirthday";
		document.getElementById('calendar-format').selectedItem.value = "thunderbirthday";
	}
}

/**
 * Takes a string and returns an nsIURI
 *
 * @param aUriString  the string of the address to for the spec of the nsIURI
 *
 * @returns  an nsIURI whose spec is aUriString
 */
function makeURL(aUriString) {
    var ioSvc = Cc["@mozilla.org/network/io-service;1"].
                getService(Ci.nsIIOService);
    return ioSvc.newURI(aUriString, null, null);
}

function test() {
	// return;
	
	var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
	var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);
	
	with (abRootDir.directoryProperties) alert (abRootDir.dirName + dirType + fileName + URI);
	
	var abSubDirs = abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);
	// var abSubDirs = abRootDir.QueryInterface(Components.interfaces.nsISimpleEnumerator);
	
	while (abSubDirs.hasMoreElements()) {
		var abDir = abSubDirs.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
		
		// alert (abDir.dirName);
		// with (abDir.directoryProperties) alert (dirType + fileName + URI);
		
		// alert(abDir.childCards);
		
		var abCardsEnum = abDir.childCards.QueryInterface(Components.interfaces.nsIEnumerator);
		try {
			abCardsEnum.first();
			do {
				var abCard = abCardsEnum.currentItem().QueryInterface(Components.interfaces.nsIAbCard);
				
				with (abCard) alert("ab: "
							+ getCardValue("BirthYear")
							+ getCardValue("BirthMonth") 
							+ getCardValue("BirthDay"));
				
				// abCardsEnum.next();
			} while(abCardsEnum.next())
		} catch (e) {
			alert(e.message);
		}
	}
}