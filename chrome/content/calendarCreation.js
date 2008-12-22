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
var sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
            .getService(Components.interfaces.nsIStringBundleService);
var locale = sbs.createBundle("chrome://thunderbirthday/locale/calendarCreation.properties");


/**
 * cTBD_loadCalendarCreation
 * Modifies the calendarCreation dialog to the suits of ThunderBirthDays
 */
function cTBD_loadCalendarCreation() {
    // Show cTBD_locationPageLocal instead of skipping the location
    // page for local calendars
    var initialPage = document.getElementsByAttribute('pageid', 'initialPage')[0];
    initialPage.setAttribute('onpageadvanced','cTBD_onInitialAdvance()');
    
    // Enable automatic name proposition for the new calender when
    // choosing thunderbird format
    var customizePage = document.getElementsByAttribute('pageid', 'customizePage')[0];
    customizePage.setAttribute('onpageshow',
                "cTBD_initName(); " + customizePage.getAttribute('onpageshow'));

    customizePage.setAttribute('onpageadvanced',
                               "cTBD_preCreateCalendar(); "
                               + customizePage.getAttribute('onpageadvanced'));
    
    // Fill Dropdownbox with adressbooks
    cTBD_fillDropDownBox();
}


/**
 * cTBD_fillDropDownBox
 * Fills the dropdownbox on the cTBD_locationPageLocal page with the names
 * of the adresbooks
 */
function cTBD_fillDropDownBox() {
    var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                          .getService(Components.interfaces.nsIRDFService);
    var abRootDir = abRdf.GetResource("moz-abdirectory://")
                         .QueryInterface(Components.interfaces.nsIAbDirectory);
    
    var abSubDirs = abRootDir.childNodes
                             .QueryInterface(Components.interfaces.nsISimpleEnumerator);
    
    var listbox = document.getElementsByAttribute('id', 'cTBD-abook-uri-popup')[0];
    
    // "All adressbooks" item
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute('label',locale.GetStringFromName("menuAllAddressbooks"));
    menuitem.setAttribute('value',"moz-abdirectory://");
    
    listbox.appendChild(menuitem);
    
    // List of adressbooks
    while (abSubDirs.hasMoreElements()) {
        var abDir = abSubDirs.getNext()
                             .QueryInterface(Components.interfaces.nsIAbDirectory);
        
        var menuitem = document.createElement("menuitem");
        menuitem.setAttribute('label',abDir.dirName);
        menuitem.setAttribute('value',abDir.directoryProperties.URI);
        
        listbox.appendChild(menuitem);
    }
}


/**
 * cTBD_onInitialAdvance
 * Replaces the onInitialAdvance() function. Changes the
 * next page after the initial page according to the selected radio button.
 */
function cTBD_onInitialAdvance() {
    var type = document.getElementById('calendar-type').selectedItem.value;
    var page = document.getElementsByAttribute('pageid', 'initialPage')[0];
    if (type == 'local') {
        // since Lightning 0.8, the replaced function has to call this
        if (typeof floating == "function") prepareCreateCalendar();
        page.next = 'cTBD_locationPageLocal';
    } else {
        page.next = 'locationPage';
    }
}

/**
 * cTBD_onChangeFormatSelection
 * Hides/Unhides the textbox for the abook-path according to whether the
 * thunderbird radio button is selected or not.
 */
function cTBD_onChangeFormatSelection() {
    if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0]
                .selectedItem.value == 'thunderbirthday') {
        document.getElementsByAttribute('id', 'cTBD-abook-uri')[0]
                .setAttribute('hidden','false');
    } else {
        document.getElementsByAttribute('id', 'cTBD-abook-uri')[0]
                .setAttribute('hidden','true');
    }
    
    cTBD_checkRequiredLocal();
}

/**
 * cTBD_checkRequiredLocal
 * Checks if either default format is selected or cTBD-abook-uri
 * is a valid uri ending with /abook.mab and enables forwarding if so.
 */
function cTBD_checkRequiredLocal() {
    var canAdvance = false;
    
    if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0]
                .selectedItem.value != 'thunderbirthday' ||
        document.getElementsByAttribute('id', 'cTBD-abook-uri')[0]
                .selectedItem != null) {
        canAdvance = true;
    }
    
    document.getElementById('calendar-wizard').canAdvance = canAdvance;
}

/**
 * cTBD_initName
 * Fills the textbox on the customizePage with a proposition, if
 * thunderbird has been choosen as calender format
 */
function cTBD_initName() {
    var nameField = document.getElementById("calendar-name");
    if (document.getElementsByAttribute('id', 'cTBD-calendar-format')[0]
                .selectedItem.value != 'thunderbirthday' ||
        nameField.value) {
        return;
    }

    nameField.value = locale.GetStringFromName("calendarNameProposition");
}

/**
 * cTBD_preCreateCalendar
 * Sets calender-type and calender-format to thunderbirthday, so the
 * appropriate provider will be choosen on calendar creation
 */
function cTBD_preCreateCalendar() {
    if (document.getElementById('cTBD-calendar-format')
                .selectedItem.value == "thunderbirthday") {
        document.getElementById("calendar-uri").value = 
                    document.getElementsByAttribute('id', 'cTBD-abook-uri')[0].value;
        document.getElementById('calendar-type').selectedItem.value = "thunderbirthday";
        document.getElementById('calendar-format').selectedItem.value = "thunderbirthday";
    }
}

/**
 * makeURL
 * Takes a string and returns an nsIURI
 *
 * @param aUriString  the string of the address to for the spec of the nsIURI
 *
 * @returns  an nsIURI whose spec is aUriString
 */
function makeURL(aUriString) {
    var ioSvc = Components.classes["@mozilla.org/network/io-service;1"].
                getService(Components.interfaces.nsIIOService);
    return ioSvc.newURI(aUriString, null, null);
}