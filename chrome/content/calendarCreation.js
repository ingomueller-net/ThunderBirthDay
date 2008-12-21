/**
 * Modifies the calendarCreation dialog to the suits of the TestExt
 */
function loadTestExt() {
	// Show locationPageLocal instead of skipping the location page for local calendars
	var initialPage = document.getElementsByAttribute('pageid', 'initialPage')[0];
	initialPage.setAttribute('onpageadvanced','onInitialAdvanceTestExt()');
	
	// Enable automatic name proposition for the new calender when choosing thunderbird format
	var  customizePage = document.getElementsByAttribute('pageid', 'customizePage')[0];
	customizePage.setAttribute('onpageshow',
				"initNameLocal(); " + customizePage.getAttribute('onpageshow'));

	customizePage.setAttribute('onpageadvanced',
				 "preCreateCalendar(); " + customizePage.getAttribute('onpageadvanced'));
}

/**
 * Replaces the onInitialAdvance() function. Changes the next page after the initial page according to the selected radio button.
 */
function onInitialAdvanceTestExt() {
    var type = document.getElementById('calendar-type').selectedItem.value;
    var page = document.getElementsByAttribute('pageid', 'initialPage')[0];
    if (type == 'local')
        page.next = 'locationPageLocal';
    else
        page.next = 'locationPage';
}

/**
 * Hides/Unhides the textbox for the abook-path according to whether the thunderbird radio button is selected or not.
 */
function onChangeFormatSelection() {
	if (document.getElementsByAttribute('id', 'calendar-format-local')[0].selectedItem.value == 'default') {
		document.getElementsByAttribute('id', 'abook-lbl')[0].setAttribute('hidden','true');
		document.getElementsByAttribute('id', 'abook-uri-local')[0].setAttribute('hidden','true');
	} else {
		document.getElementsByAttribute('id', 'abook-lbl')[0].setAttribute('hidden','false');
		document.getElementsByAttribute('id', 'abook-uri-local')[0].setAttribute('hidden','false');
	}
	
	checkRequiredLocal();
}

/**
 * Checks if either default format is selected or the abook-path contains /abook.mab and enables forwarding if so.
 */
function checkRequiredLocal() {
	var canAdvance = false;
	
	if (document.getElementsByAttribute('id', 'calendar-format-local')[0].selectedItem.value == 'default' ||
			document.getElementsByAttribute('id', 'abook-uri-local')[0].value.match(/.*[\/\\]abook.mab$/i))
		canAdvance = true;
	
	document.getElementById('calendar-wizard').canAdvance = canAdvance;
}

/**
 * Fills the textbox on the customizePage with a proposition, if thunderbird has been choosen as calender format
 */
function initNameLocal() {
    var nameField = document.getElementById("calendar-name");
    if (document.getElementsByAttribute('id', 'calendar-format-local')[0].selectedItem.value != 'thunderbird'
				|| nameField.value)
        return;

    nameField.value = "Geburtstage des Thunderbird-Adressbuchs";
}

/**
 * Sets calender-type and calender-format to thunderbird, so the appropriate provider will be choosen on calendar creation
 */
function preCreateCalendar() {
	document.getElementById('calendar-type').selectedItem.value = "thunderbird";
	document.getElementById('calendar-format').selectedItem.value = "thunderbird";
}