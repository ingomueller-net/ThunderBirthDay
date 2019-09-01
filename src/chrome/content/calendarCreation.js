"use strict";

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Thunderbirthday Provider code.
 *
 * The Initial Developer of the Original Code is
 *  Ingo Mueller (thunderbirthday at ingomueller dot net)
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Load locales
 */
var cTBD_sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
                .getService(Components.interfaces.nsIStringBundleService);
var cTBD_locale = cTBD_sbs.createBundle("chrome://thunderbirthday/locale/" + 
                                        "calendarCreation.properties");

var cTBD_savedCalendarUri = null;
var cTBD_savedCalendarFormat = null;
var cTBD_savedCalendarName = null;


/**
 * Add our event listners and load the list of address books.
 */
function cTBD_loadCalendarCreation() {
    var initialPage = document.getElementsByAttribute("pageid", "initialPage")[0];
    var customizePage = document.getElementsByAttribute("pageid", "customizePage")[0];

    var calendarType = document.getElementById("calendar-type");
    var addressBookSelector = document.getElementById("cTBD-abook-uri");

    // Fill Dropdownbox with adressbooks
    cTBD_fillDropDownBox();

    // These page event listeners will be called *after* the ones
    // from lightning, as they are also registered second.
    initialPage.addEventListener("pageadvanced", cTBD_updateNextPageAndSaveWizardState);
    customizePage.addEventListener("pagerewound", cTBD_restoreWizardState);

    // The select event is fired before the command event, which allows
    // us to reset the advance button state in the select event without
    // potentially overwriting the state set by another extension in
    // the command event. This means an extension can always update the
    // state in the select handler, but should only update it in command,
    // when it is currently selected as a provider.
    calendarType.addEventListener("select", cTBD_updateAdvanceButtonState);
    calendarType.addEventListener("command", cTBD_updateAddressBookSelectorVisibility);

    // Always update the advance button state when the address book is
    // changed, as this can only happen when we are currently selected.
    addressBookSelector.addEventListener("command", cTBD_updateAdvanceButtonState);
}

window.addEventListener("load", cTBD_loadCalendarCreation);


/**
 * Fills the dropdownbox on the cTBD_locationPageLocal page with the names
 * of the address books. Those that already have an associated calendar
 * will be disabled.
 */
function cTBD_fillDropDownBox() {
    let cals = cal.getCalendarManager().getCalendars({});

    let listbox = document.getElementById("cTBD-abook-uri-popup");

    let addMenuitem = (label, value) => {
        let menuitem = document.createElement("menuitem");

        if (cals.some(calendar => calendar.uri.spec == value)) {
            menuitem.setAttribute("disabled", "true");
            label = cTBD_locale.formatStringFromName(
                "calendarExisting",
                [label], 1
            );
        }

        menuitem.setAttribute("value", value);
        menuitem.setAttribute("label", label);
        listbox.appendChild(menuitem);
    };

    // "All adressbooks" item
    addMenuitem(cTBD_locale.GetStringFromName("menuAllAddressbooks"), "moz-abdirectory://");

    // Get addressbook enumerator
    var abManager = Components.classes["@mozilla.org/abmanager;1"]
                              .getService(Components.interfaces.nsIAbManager);
    var abDirs = abManager.directories
                          .QueryInterface(Components.interfaces
                                                    .nsISimpleEnumerator);

    // List of adressbooks
    while (abDirs.hasMoreElements()) {
        var abDir = abDirs.getNext()
                          .QueryInterface(Components.interfaces
                                                    .nsIAbDirectory);
        
        addMenuitem(abDir.dirName, abDir.URI);
    }
}


/**
 * Change the next page to customizePage if the birthday calendar type
 * is selected and save the uri, format, and name, so we can restore
 * them to their original values if we go back to the initial page.
 *
 * Must be run *after* the lightning onInitialAdvance function.
 */
function cTBD_updateNextPageAndSaveWizardState(event) {
    var type = document.getElementById("calendar-type").selectedItem.value;
    var initialPage = document.getElementsByAttribute("pageid", "initialPage")[0];

    // Go directly to the customizePage, as we do not need the locationPage
    if (type == "birthday") {
        initialPage.next = "customizePage";

        var calendarUri = document.getElementById("calendar-uri");
        var calendarFormat = document.getElementById("calendar-format");
        var calendarName = document.getElementById("calendar-name");

        // Save values, that are eventually to be overwritten
        cTBD_savedCalendarUri = calendarUri.value;
        cTBD_savedCalendarFormat = calendarFormat.selectedItem.value;
        cTBD_savedCalendarName = calendarName.value;

        // Set values accordingly
        calendarUri.value = document.getElementById("cTBD-abook-uri").value;
        calendarFormat.selectedItem.value = "thunderbirthday";
        calendarName.value = cTBD_locale.GetStringFromName("calendarNameProposition");

        // As we skip the locationPage, we need to call prepareCreateCalendar
        // ourselfs, just as it is done for local in the original onInitialAdvance.
        // It will create the calendar provider and check for duplicate calendars etc.
        prepareCreateCalendar(event);
    }
}


/**
 * Restores the uri, format, and name saved in
 * cTBD_updateNextPageAndSaveWizardState.
 */
function cTBD_restoreWizardState() {
    // cTBD_savedCalendarName is only non-null, if we entered the
    // customizePage through cTBD_updateNextPageAndSaveWizardState.
    if (cTBD_savedCalendarName != null) {
        var calendarUri = document.getElementById("calendar-uri");
        var calendarFormat = document.getElementById("calendar-format");
        var calendarName = document.getElementById("calendar-name");

        calendarUri.value = cTBD_savedCalendarUri;
        calendarFormat.selectedItem.value = cTBD_savedCalendarFormat;
        calendarName.value = cTBD_savedCalendarName;

        cTBD_savedCalendarUri = null;
        cTBD_savedCalendarFormat = null;
        cTBD_savedCalendarName = null;
    }
}


/**
 * Checks if either default format is selected or a valid address book
 * is selected and allows advancing the wizard if so.
 */
function cTBD_updateAdvanceButtonState() {
    let calendarType = document.getElementById("calendar-type");
    let addressBookSelector = document.getElementById("cTBD-abook-uri");

    let type = calendarType.selectedItem.value;
    let selectedItem = addressBookSelector.selectedItem;

    let canAdvance = type != "birthday" || selectedItem != null;
    document.getElementById("calendar-wizard").canAdvance = canAdvance;
}


/**
 * Show the address book selector only if the birthday calendar type
 * is selected.
 */
function cTBD_updateAddressBookSelectorVisibility() {
    let calendarType = document.getElementById("calendar-type");
    let addressBookSelector = document.getElementById("cTBD-abook-uri");

    if (calendarType.selectedItem.value == "birthday") {
        addressBookSelector.setAttribute("hidden","false");
        // Always update advance button, as we are currently selected
        cTBD_updateAdvanceButtonState();
    } else {
        addressBookSelector.setAttribute("hidden","true");
        // Do not update the advance button here (in the command
        // callback), as another extensions might now be selected and
        // may want to take control of the button. We reset our
        // button state in the select callback, which is fired first.
    }
}
