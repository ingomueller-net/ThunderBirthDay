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
	if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0].selectedItem.value == 'default') {
		document.getElementsByAttribute('id', 'cTBD-abook-lbl')[0].setAttribute('hidden','true');
		document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].setAttribute('hidden','true');
	} else {
		document.getElementsByAttribute('id', 'cTBD-abook-lbl')[0].setAttribute('hidden','false');
		document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].setAttribute('hidden','false');
	}
	
	cBD_checkRequiredLocal();
}

/**
 * Checks if either default format is selected or the abook-path contains /abook.mab and enables forwarding if so.
 */
function cBD_checkRequiredLocal() {
	var canAdvance = false;
	
	if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0].selectedItem.value == 'default' ||
			document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].value.match(/.*[\/\\]abook.mab$/i))
		canAdvance = true;
	
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
		document.getElementById('calendar-type').selectedItem.value = "thunderbirthday";
		document.getElementById('calendar-format').selectedItem.value = "thunderbirthday";
	}
}