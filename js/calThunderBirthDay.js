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
 *    Ingo Mueller (thunderbirthday at ingomueller dot net)
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *    Philipp Kewisch (mozilla@kewis.ch), developper of the Google
 *            Calender Provider this extension is (vaguely) based on
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
 * calThunderBirthDay
 * This implements the calICalendar interface adapted to the ThunderBirthDay
 * Provider.
 */
function calThunderBirthDay() {
    this.initProviderBase();
}

calThunderBirthDay.prototype = {
    // Inherit from calProviderBase for the the nice helpers
    __proto__: calProviderBase.prototype,
    
/*
 * Implement nsISupports
 */
    QueryInterface: function cTBD_QueryInterface(aIID) {
        if (!aIID.equals(Components.interfaces.nsISupports) &&
            !aIID.equals(Components.interfaces.calICalendar)) {
            throw Components.results.NS_ERROR_NO_INTERFACE;
        }
        return this;
    },

/*
 * Member Variables
 */
    mUri: null,
    mDirectories: null,
    mBaseItems: null,
    
/*
 * Implement calICalendar
 * (Lightning 0.5-0.7 only)
 */
    get suppressAlarms() {
        // For the moment, ThunderBirthDay doesn't support alarms
        return true;
    },
    
    set suppressAlarms(v) {
        // For the moment, ThunderBirthDay doesn't support alarms
        // so don't accept changes here
        return true;
    },
    
/*
 * Implement calICalendar
 * (Lightning 0.5-0.8 only)
 */
    get sendItipInvitations() {
        // We don't "handle invitations internally"...
        return true;
    },
    
/*
 * Implement calICalendar
 * (Lightning 0.8+ only)
 *
 * The following code is heavily inspired by the google calendaer provider.
 * See http://mxr.mozilla.org/mozilla1.8/source/calendar/providers/gdata/
 */
    getProperty: function cGC_getProperty(aName) {
        MyLOG(2, "TBD: getProperty: " + aName);
        
        switch (aName) {
            // Limitations due to being read-only
            case "readOnly":
            case "suppressAlarms":
                return true;
            // Capabilities
            case "requiresNetwork":
            case "capabilities.attachments.supported":
            case "capabilities.priority.supported":
            case "capabilities.tasks.supported":
            case "capabilities.alarms.popup.supported":
            case "capabilities.alarms.oninviations.supported":
            case "capabilities.timezones.UTC.supported":
                return false;
            // imip/itip
            case "imip.identity.disabled":
                return true;
            case "capabilities.privacy.values":
                return ["DEFAULT", "PUBLIC", "PRIVATE"];
        }

        return this.__proto__.__proto__.getProperty.apply(this, arguments);
    },
    
    setProperty: function cTBD_setProperty(aName, aValue) {
        MyLOG(4, "TBD: setProperty: " + aName);
        
        // Limitations due to being read-only
        switch (aName) {
            case "readOnly":
            case "suppressAlarms":
                return true;
        }
        
        return this.__proto__.__proto__.setProperty.apply(this, arguments);
    },

/*
 * Implement calICalendar
 * (all versions of Lightning)
 */
    get type() {
        return "thunderbirthday";
    },
    
    get uri() {
        return this.mUri;
    },
    
    set uri(aUri) {
        MyLOG(3,"TBD: set uri: " + aUri.spec);
        
        this.mUri = aUri;
        
        // the uri of the directories changed, so we need to refresh everything
        this.refresh();
        
        return aUri;
    },
    
    get readOnly() {
        // For the moment, ThunderBirthDay is readonly
        return true;
    },
    
    set readOnly(v) {
        // For the moment, ThunderBirthDay is readonly, so don't accept
        // changes to readOnly
        return true;
    },
    
    get canRefresh() {
        // I *guess* it makes sense to refresh this calender, as its entries are
        // only modified by an external application (=the thunderbird adressbook),
        // at least until now.
        return true;
    },
    
    /*
     * The following four functions only consist of throwing CAL_IS_READONLY exceptions
     * as thunderbirthday can't write to the adressbook yet.
     */
    adoptItem: function cTBD_adoptItem(aItem, aListener) {
        MyLOG(1,"TBD: adoptItem() called");
        
        throw Components.interfaces.calIErrors.CAL_IS_READONLY;
    },
    
    addItem: function cTBD_addItem(aItem, aListener) {
        MyLOG(1,"TBD: addItem() called");
        
        throw Components.interfaces.calIErrors.CAL_IS_READONLY;
    },
    
    modifyItem: function cTBD_modifyItem(aNewItem, aOldItem, aListener) {
        MyLOG(1,"TBD: modifyItem() called: " + aNewItem.icalString + ","
              + aOldItem.icalString);
        
        throw Components.interfaces.calIErrors.CAL_IS_READONLY;
    },
    
    deleteItem: function cTBD_deleteItem(aItem, aListener) {
        MyLOG(1,"TBD: deleteItem() called: " + aItem.id);
        
        throw Components.interfaces.calIErrors.CAL_IS_READONLY;
    },
    
    /** 
     * cTBD_getItem
     * Iterates throu this.mBaseItems and returns the first item with matching id.
     */
    getItem: function cTBD_getItem(aId, aListener) {
        MyLOG(3,"TBD: getItem() called");
        
        // Iterate throu this.mBaseItems and return item with matching id
        for (var i = 0; i < this.mBaseItems.length; i++) {
            if (this.mBaseItems[i].id == aId && aListener != null) {
                // Return item
                aListener.onGetResult(this,
                                      Components.results.NS_OK,
                                      Components.interfaces.calIEvent,
                                      null,
                                      1,
                                      [this.mBaseItems[i]]);
                
                // Operation completed successfully.
                if (aListener != null) {
                    aListener.onOperationComplete(this,
                                                  Components.results.NS_OK,
                                                  Components.interfaces
                                                            .calIOperationListener.GET,
                                                  this.mBaseItems[i].id,
                                                  [this.mBaseItems[i]]);
                }
                
                // we don't expect another item with this id...
                return;
            }
        }
        
        // Nothing was found, so report it
        if (aListener != null) {
            aListener.onOperationComplete(this,
                                          Components.results.NS_OK,
                                          Components.interfaces
                                                    .calIOperationListener.GET,
                                          null,
                                          null);
        }
    },
    
    /**
     * testGetItem
     * Test the getItem method aCount times and logs the result with
     * our MyLOG function. Of course, this test doesn't make that much
     * sense because it was written after the function itself was...
     *
     * @param aCount    Number of test runs of getItem
     */
    testGetItem: function cTBD_testGetItem(aCount) {
        if (this.mBaseItems.length == 0) return;
        
        // build a listener, which will get the result of getItem 
        function getItemTester (aItem) {}
        getItemTester.prototype = {
            onGetResult: function (aCalendar, aStatus, aItemType,
                                   aDetail, aCount, aItems) {
                if (aStatus == Components.results.NS_OK &&
                                aItemType == Components.interfaces.calIEvent &&
                                aCount == 1 && aItems[0].id &&
                                aItems[0].id == aItem.id) {
                    MyLOG(3, "TBD: testGetItem: got expected result " + aItems[0].id);
                } else {
                    MyLOG(0, "TBD: testGetItem: got unexpected result ("
                                + "aCalendar: " + aCalendar
                                + ", aStatus: " + aStatus
                                + ", aItemType: " + aItemType
                                + ", aDetail: " + aDetail
                                + ", aCount: " + aCount
                                + ", aItems: " + aItems + ")");
                }
            },
            onOperationComplete: function (aCalendar, aStatus, aOperationType,
                                           aId, aDetail) {
                if (aStatus == Components.results.NS_OK &&
                            aOperationType == Components.interfaces
                                                        .calIOperationListener.GET &&
                            aDetail[0].id && aDetail[0].id == aItem.id) {
                    MyLOG(3, "TBD: testGetItem: operation completed like expected with "
                          + aDetail[0].id);
                } else {
                    MyLOG(0, "TBD: testGetItem: operation completed unsuccessfull ("
                                + "aCalendar: " + aCalendar
                                + ", aStatus: " + aStatus
                                + ", aOperationType: " + aOperationType
                                + ", aId: " + aId
                                + ", aDetail: " + aDetail + ")");
                }
            }
        }
        
        if (!aCount) aCount = 1;
        
        for (var i = 0; i < aCount; i++) {
            // get random item
            var index = Math.ceil(Math.random() * this.mBaseItems.length);
            var aItem = this.mBaseItems[index];
            MyLOG(3,"TBD: testGetItem: picking item " + index + " of "
                  + this.mBaseItems.length);
            
            this.getItem(aItem.id, new getItemTester(aItem));
        }
    },
    
    getItems: function cTBD_getItems(aItemFilter,
                                    aCount,
                                    aRangeStart,
                                    aRangeEnd,
                                    aListener) {
        var startTime = new Date();
        
        try {
            MyLOG(4,"TBD: getItems() called: " + aRangeStart.toString() + "-"
                  + aRangeEnd.toString());
        } catch(e) {
            MyLOG(4,"TBD: getItems() called");
        }
        
        var itemsSent = 0;      // count items sent to the listener,
                                // so it doesn't exceed aCount
        
        try {
            // item base type (event or todo)
            var wantEvents = ((aItemFilter &
                               Components.interfaces.calICalendar
                                         .ITEM_FILTER_TYPE_EVENT) != 0);
            var wantTodos = ((aItemFilter &
                              Components.interfaces.calICalendar
                                        .ITEM_FILTER_TYPE_TODO) != 0);
            
            // check if events are wanted
            if (!wantEvents && !wantTodos) {
                // Nothing to do. The onOperationComplete in the catch block
                // below will catch this.
                throw new Components.Exception("", Components.results.NS_OK);
            } else if (wantTodos && !wantEvents) {
                throw new Components.Exception("",
                                Components.results.NS_ERROR_NOT_IMPLEMENTED);
            }
            
            // return occurrences?
            var itemReturnOccurrences = ((aItemFilter &
                        Components.interfaces.calICalendar
                                  .ITEM_FILTER_CLASS_OCCURRENCES) != 0);
            
            
            // determine index in this.mBaseItems of first and last element to return
            var rangeIndices = {};
            this.calculateRangeIndices(aRangeStart, aRangeEnd, rangeIndices);
            
            
            // debug calculateRangeIndices():
            /* var log = "TBD: pivot: Indices " + rangeIndices.startIndex + " to "
                         + rangeIndices.endIndex + ", range " + aRangeStart.month
                         + "." + aRangeStart.day + ". to " + aRangeEnd.month + "."
                         + aRangeEnd.day + ".\n";
            
            var empty = rangeIndices.startIndex > rangeIndices.endIndex;
            var done = false;
            
            log += (empty ? "---- empty -----\n" : "");
            
            for (var i = 0; i < this.mBaseItems.length; i++) {
                if (i == rangeIndices.startIndex && !empty) {
                    log += "(" + i + ") " + "_" + aRangeStart.month + "."
                           + aRangeStart.day + "._ from here\n";
                }
                
                if (empty && !done &&
                            cTBD_compareDatesInYear(this.mBaseItems[i].startDate,
                                                    aRangeStart) > 0) {
                    done = true;
                    log += "_" + aRangeStart.month + "." + aRangeStart.day
                           + "._ from here\n" + "^" + aRangeEnd.month + "."
                           + aRangeEnd.day + ".^ to here\n";
                }
                
                log += "(" + i + ") " + this.mBaseItems[i].startDate.month
                       + "." + this.mBaseItems[i].startDate.day + ".\n";
                if (i == (rangeIndices.endIndex % this.mBaseItems.length) && !empty) {
                    log += "(" + i + ") " + "^" + aRangeEnd.month + "."
                           + aRangeEnd.day + ".^ to here\n";
                }
            }
            
            if (!done && empty) {
                done = true;
                log += "_" + aRangeStart.month + "." + aRangeStart.day
                       + "._ from here\n" + "^" + aRangeEnd.month + "."
                       + aRangeEnd.day + ".^ to here\n";
            }
            
            MyLOG(4,log); */
            
            
            // iterate through cards in this.mBaseItems
            for (var i, ii = rangeIndices.startIndex; ii <= rangeIndices.endIndex &&
                            (aCount == 0 || itemsSent < aCount); ii++) {
                
                // if there is a "carry-over", ii may be greater than
                // this.mBaseItems.length, which means that we continue at
                // the beginning of the array
                i = ii % this.mBaseItems.length;
                
                
                // collect occurrences or base item depending on the filter
                if (itemReturnOccurrences) {
                    var items = cTBD_getOccurencesFromEvent(this.mBaseItems[i],
                                                            aRangeStart, aRangeEnd);
                } else {
                    var items = [this.mBaseItems[i]];
                }
                
                
                // report occurrences of this card
                if (items.length > 0) {
                    // MyLOG(3,"TBD: getItems: returning " + items.length
                                // + " item for " + this.mBaseItems[i].title);
                    
                    itemsSent += items.length;
                    
                    aListener.onGetResult(this,
                                          Components.results.NS_OK,
                                          Components.interfaces.calIEvent,
                                          null,
                                          items.length,
                                          items);
                }
            }
            
            
            // Operation completed successfully.
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              Components.results.NS_OK,
                                              Components.interfaces
                                                        .calIOperationListener.GET,
                                              null,
                                              null);
            }
        }
        
        // Something went wrong, so notify observers
        catch (e) {
            if (e.name == "NS_OK" || e.name == "NS_ERROR_NOT_IMPLEMENTED") {
                MyLOG(4,"TBD: getItems: known exception, filter: " + aItemFilter);
            } else {
                MyLOG(0,"TBD: getItems: exception: " + e);
            }
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Components.interfaces
                                                        .calIOperationListener.GET,
                                              null, e.message);
            }
        }
        
        var endTime = new Date();
        MyLOG(3,"TBD: getItems: returned " + itemsSent + " events in "
              + (endTime - startTime) + " ms.");
    },
    
    /**
     * refresh
     * Reloads all external data, i.e. the directories and the abCards.
     */
    refresh: function cTBD_refresh() {
        MyLOG(4,"TBD: refresh() called");
        
        //reload directories and ab cards
        this.loadDirectories();
        this.loadBaseItems();
        
        // tell observers to reload everything
        this.mObservers.notify("onLoad", [this]);
    },
    
/*
 * Helpers
 */
    /**
     * loadDirectories
     * Opens the directories stored at this.mUri and stores them as 
     * nsIAbDirectory's in this.mDirectories.
     *
     * This is only one adressbook if the uri is of the form
     * "moz-abmdbdirectory://abook.mab" and all directories of the user
     * if the uri is of the form "moz-abdirectory://".
     */
    loadDirectories: function cTBD_loadDirectories () {
        var startTime = new Date();
        
        // reset mDirectories
        this.mDirectories = [];
        
        var abRdf = getRDFService();
        
        // "All adressbooks" has been chosen
        if (this.mUri.spec == "moz-abdirectory://") {
            var abRootDir = abRdf.GetResource("moz-abdirectory://")
                                 .QueryInterface(Components.interfaces.nsIAbDirectory);
            
            // todo: this command is responsible for 240ms of the 320ms loading time!
            var abDirectoryEnum = abRootDir.childNodes
                                .QueryInterface(Components.interfaces
                                                          .nsISimpleEnumerator);
            
            while (abDirectoryEnum.hasMoreElements()) {
                var abDir = abDirectoryEnum.getNext()
                                    .QueryInterface(Components.interfaces
                                                              .nsIAbDirectory);
                this.mDirectories.push(abDir);
            }
        }
        // One specific adressbook
        else {
            var abDir = abRdf.GetResource(this.mUri.spec)
                                    .QueryInterface(Components.interfaces
                                                              .nsIAbDirectory);
            this.mDirectories.push(abDir);
        }
        
        var endTime = new Date();
        
        MyLOG(2,"TBD: loaded " + this.mDirectories.length + " directories for "
              + this.mUri.spec +
                    " in " + (endTime - startTime) + " ms.");
    },
    
    /**
     * loadBaseItems
     * Iterates through the directories asscociated with this calendar and
     * stores base items for all contacts with valid birth date as calIEvent's
     * in this.mBaseItems. Storing these events in RAM prevents us from
     * reloading the directories every time this.getItems() is called.
     */
    loadBaseItems: function cTBD_loadBaseItems () {
        var startTime = new Date();
        
        var itemsLoaded = 0;
        this.mBaseItems = [];
        
        // iterate through directories
        for (var i = 0; i < this.mDirectories.length; i++) {
            // Get card iterator, fails if file doesn't exist
            try {
                var abCardsEnum = this.mDirectories[i].childCards
                                    .QueryInterface(Components.interfaces
                                                                .nsIEnumerator);
            } catch (e if e.name == "NS_ERROR_FILE_NOT_FOUND") {
                MyLOG(0, "TBD: Address book could not be loaded. File not found: " +
                      this.mUri.spec);
                
                // Remove non-existing directory
                this.mDirectories.splice(i--, 1);
                
                // Deactivate calendar if no directories left
                if (this.mDirectories.length == 0) {
                    MyLOG(1, "TBD: Deactivating calendar at " + this.mUri.spec + ".");
                    this.setProperty("disabled", true);
                }
                continue;
            }
            
            try {
                // initialize abCardsEnum (nsIEnumerator stinks)
                abCardsEnum.first();
                
                // iterate through cards
                do {
                    var abCard = abCardsEnum.currentItem()
                                            .QueryInterface(Components.interfaces
                                                                      .nsIAbCard);
                    
                    var baseItem = this.convertAbCardToEvent(abCard);
                    if (!baseItem) continue;  // card couldn't be converted to an event
                    
                    MyLOG(4,"TBD: loaded event for " + baseItem.title + " ("
                          + baseItem.id + ")");
                    
                    
                    this.mBaseItems.push(baseItem);
                    itemsLoaded++;
                    
                    // abCardsEnum.next() always evaluates as false and will
                    // throw an exception when arrived at the end of the list
                    // (nsIEnumerator stinks)
                } while(abCardsEnum.next() || true)
            }
            // these are exceptions thrown by the nsIEnumerator interface and well known.
            // apperently the interface can't be used in a clean way... :-/
            catch (e if e.name == "NS_ERROR_FAILURE" ||
                   e.name == "NS_ERROR_INVALID_POINTER") {
                MyLOG(5,"TBD: loadBaseItems: exception: nsIEnumerator stinks!!!");
            }
        }
        
        var endTime = new Date();
        MyLOG(3,"TBD: loadBaseItems: loaded " + itemsLoaded + " events in "
              + (endTime - startTime) + " ms.");
        
        
        // sort items by their occurence in a year
        startTime = new Date();
        this.mBaseItems
            .sort(function c(a,b) { return cTBD_compareDatesInYear(a.startDate,
                                                                   b.startDate); });
        endTime = new Date();
        
        MyLOG(3,"TBD: loadBaseItems: sorted in " + (endTime - startTime) + " ms.");
    },
    
    /**
     * calculateRangeIndices
     * Calculates the index in this.mBaseItems of the first element in the range
     * (startIndex) and the index of the last element in the range (endIndex). That
     * way, elements with index between these values are in the range. Note that
     * this.mBaseItems is sorted by yearday.
     *
     * Note that aResult.endIndex may be greater than this.mBaseElements.length, if
     * aRangeEnd is earlier in the year than aRangeStart. In this case,
     * aResult.endIndex % this.mBaseItems.length is the index of the first element
     * after the range.
     *
     * If there is no item in the range, aResult.endIndex will be smaller than
     * aResult.startIndex and may be negative.
     *
     * @param aRangeStart  calIDateTime for the start of the range
     * @param aRangeEnd  calIDateTime for the end of the range
     *
     * @returns  Object aResult with attributes startIndex and endIndex
     */
    calculateRangeIndices: function cTBD_calculateRangeIndices (aRangeStart,
                                                                aRangeEnd,
                                                                aResult) {
        var startTime = new Date();
        
        // check whether it makes sense to calculate the indices
        // it doesn't make sens if the range is not set or (roughly) longer than a year
        if (!aRangeStart || !aRangeEnd || aRangeEnd.year - aRangeStart.year > 1 ||
                    (aRangeEnd.year - aRangeStart.year == 1 &&
                     aRangeEnd.month >= aRangeStart.month) ) {
            
            MyLOG(4,"TBD: pivot: range is more than a year.");
            
            // if it doesn't make sense, just "mark" the whole base items array
            aResult.startIndex = 0;
            aResult.endIndex = this.mBaseItems.length - 1;
        }
        
        // No need to calculate anything either if there are no items
        else if (this.mBaseItems.length == 0) {
            MyLOG(4,"TBD: pivot: No items in calender.");
            
            // No element in range, so let startIndex be greater than endIndex
            aResult.startIndex = -1;
            aResult.endIndex = -2;
        }
        
        // range is less than a year
        else {
            
            // Binary search the first element after aRangeStart.
            var lower = 0;
            var upper = this.mBaseItems.length;
            var pivotIndex;
            
            while (upper != lower) {
                pivotIndex = Math.floor((upper + lower)/2);
                
                MyLOG(5,"TBD: pivot: (" + pivotIndex + ") "
                      + this.mBaseItems[pivotIndex].startDate);
                
                // too late
                if (cTBD_compareDatesInYear(aRangeStart,
                                this.mBaseItems[pivotIndex].startDate) <= 0) {
                    upper = pivotIndex;
                } else {    // too early
                    lower = pivotIndex + 1;
                }
            }
            
            // This is the index of the first element after aRangeStart (may be
            // this.mBaseItems.length).
            aResult.startIndex = lower;
            
            
            // Binary search the first element before aRangeEnd.
            lower = -1;
            upper = this.mBaseItems.length - 1;
            
            while (upper != lower) {
                pivotIndex = Math.ceil((upper + lower)/2);
                
                MyLOG(5,"TBD: pivot: (" + pivotIndex + ") "
                      + this.mBaseItems[pivotIndex].startDate);
                
                // too late
                if (cTBD_compareDatesInYear(aRangeEnd,
                                    this.mBaseItems[pivotIndex].startDate) < 0) {
                    upper = pivotIndex - 1;
                } else {    // too early
                    lower = pivotIndex;
                }
            }
            
            // This is the index of the first element before aRangeEnd (may be -1).
            aResult.endIndex = lower;
            
            
            // Take care of special cases
            if ((aResult.startIndex == this.mBaseItems.length &&
                         aResult.endIndex == -1) ||
                        (aResult.endIndex < aResult.startIndex &&
                         cTBD_compareDatesInYear(aRangeEnd, aRangeStart) > 0 ) ) {
                MyLOG(4,"TBD: pivot: empty range ("
                      + (aResult.startIndex == this.mBaseItems.length &&
                         aResult.endIndex == -1) + ","
                      + (aResult.endIndex < aResult.startIndex) + ","
                      + (cTBD_compareDatesInYear(aRangeEnd, aRangeStart) > 0 )
                      + "," + aResult.startIndex + "," + aResult.endIndex + ")");
                
                // No element in range, so let startIndex be greater than endIndex
                aResult.startIndex = -1;
                aResult.endIndex = -2;
            } else if (aResult.startIndex == this.mBaseItems.length) {
                // No element after the aRangeStart, so start at the next element is
                // the first in the next year
                aResult.startIndex = 0;
                
                MyLOG(4,"TBD: pivot: no element after range start");
            } else if (aResult.endIndex == -1) {
                // No Element before aRangeEnd, so end at the last element of the
                // year before
                aResult.endIndex = this.mBaseItems.length - 1;
                
                MyLOG(4,"TBD: pivot: no element before range end");
            } else if (aResult.endIndex < aResult.startIndex) {
                // Range has items in two years (and is therefore around new
                // silvester/year), so there is a "carry-over"
                aResult.endIndex += this.mBaseItems.length;
                
                MyLOG(4,"TBD: pivot: range has carry over.");
            } else {
                // Regular range, nothing to do
                MyLOG(4,"TBD: pivot: regular range");
            }
        }
        
        var endTime = new Date();
        MyLOG(4,"TBD: calculateRangeIndices run in " + (endTime - startTime) + "ms.");
    },
    
    /**
     * convertAbCardToEvent
     * Converts an nsIAbCard into an calIEvent of the birthday with infinite yearly
     * recurrence.
     *
     * @param abCard  nsIAbCard interface of an adressbook card
     *
     * @returns  calIEvent of the birthday, null if no valid birthday could be found
     */
    convertAbCardToEvent: function cTBD_convertAbCardToEvent(abCard) {
        
        var event = createEvent();
        
        
        // Search for valid date.
        var year = parseInt(abCard.birthYear,10);
        var month = parseInt(abCard.birthMonth,10) - 1;   // month is zero-based
        var day = parseInt(abCard.birthDay,10);
        
        // This is also false when year, month or day is not set or NaN.
        if (!(year >= 0 && year < 3000 && month >= 0 && month <= 11 &&
              day >= 1 && day <= 31)) {
            MyLOG(5,"TBD: convert: date " + year + "-" + month + "-" + day
                  + " not valid");
            return null;
        }
        
        
        // Set start and end date.
        event.startDate = createDateTime();
        event.startDate.year = year;
        event.startDate.month = month;
        event.startDate.day = day;
        event.startDate.isDate = true;
        
        // This is an allday event, so set its timezone to floating.
        // The floating function is new in Lighning 0.8
        if (typeof floating == "function") event.startDate.timezone = floating();
        
        // normalize is needed in lightning 0.5, but has been removed in lightning 0.7
        if (event.startDate.normalize) event.startDate.normalize();
        event.startDate.makeImmutable();
        
        MyLOG(5,"TBD: convert: date " + abCard.birthYear + "-" + abCard.birthMonth 
                    + "-" + abCard.birthDay + " has been converted to "
                    + event.startDate.toString());
        
        event.endDate = event.startDate.clone();
        event.endDate.day += 1;         // all-day events end 1 day after they began
        
        // normalize is needed in lightning 0.5, but has been removed in lightning 0.7
        if (event.endDate.normalize) event.endDate.normalize();
        event.endDate.makeImmutable();
        
        
        // remark:the base items title only consist of the name. Occurrences titles
        // make use of the base items title and append additional information like age
        // and such
        
        // choose best field of the abCard for the title (one of these fields
        // (except nickname) has to be set for every card
        with (abCard) var possibleTitles = [displayName,
                                            nickName,
                                            (firstName && lastName ? firstName
                                             + " " + lastName : null),
                                            firstName,
                                            lastName,
                                            primaryEmail,
                                            company]
        for (var i = 0; i < possibleTitles.length; i++) {
            if (possibleTitles[i]) {
                event.title = possibleTitles[i];
                break;
            }
        }
        
        
        // set recurrence information
        event.recurrenceInfo = createRecurrenceInfo();
        event.recurrenceInfo.item = event;
        
        var recRule = createRecurrenceRule();
            recRule.type = "YEARLY";
            recRule.interval = 1;
            recRule.count = -1;
            recRule.setComponent("BYMONTH", 1, [(month+1)]);
            recRule.setComponent("BYMONTHDAY", 1, [day]);
        
        event.recurrenceInfo.insertRecurrenceItemAt(recRule, 0);
        
        
        // additional info
        if(abCard.webPage2)       // webPage2 is home web page
            event.setProperty("URL", abCard.webPage2);
        
        event.privacy = "PRIVATE";
        
        // Id of the event = MD5 sum depending of the persons name, his/her birthday
        // and the calendar URI
        event.id = md5(event.title + event.startDate.year
                       + event.startDate.month + event.startDate.day
                       + this.mUri.spec) + "@ThunderBirthDay";
        
        event.calendar = this;
        
        
        // set "LAST-MODIFIED" at the end, since it get changed when s.th. else is set
        var lastMod = createDateTime();
        lastMod.nativeTime = abCard.lastModifiedDate * 1000 * 1000;
        lastMod.makeImmutable();
        event.setProperty("LAST-MODIFIED", lastMod);
        
        
        event.makeImmutable();
        
        return event;
    }
};


/*
 * Helpers for Interfaces
 */

/* Shortcut to the RDF service */
function getRDFService() {
    return Components.classes["@mozilla.org/rdf/rdf-service;1"]
           .getService(Components.interfaces.nsIRDFService);
}


/*
 * Functions for dealing with cards and events
 */

/**
 * cTBD_getOccurencesFromEvent
 * Returns all occurences of an event in a certain range as items. In fact,
 * this is an extended calIRecurrenceInfo.getOccurrences() as it appends the
 * age of the contact to its title, plus the range is a bit widened to show
 * birthdays that already started, too.
 *
 * @param aEvent        calIEvent to get the occurrences from
 * @param aRangeStart   calIDateTime indicating the start of the range for the
 *                      occurrences, "flooring" to the beginning of the day of
 *                      aRangeStart
 * @param aRangeEnd     calIDateTime indicating the end of the range for the
 *                      occurrences
 *
 * @returns calIEvent() which are occurrences of aEvent in the given range
 */
function cTBD_getOccurencesFromEvent(aEvent, aRangeStart, aRangeEnd) {
    // we probably also want birthdays "that already started"
    // that day, so we let the range start on the beginning of that day
    var allDayRangeStart = aRangeStart.clone();
    allDayRangeStart.isDate = true;
    allDayRangeStart.makeImmutable();
    
    
    // get occurences
    var occurrences = aEvent.recurrenceInfo
                            .getOccurrences(allDayRangeStart, aRangeEnd, 0, {});
    
    for (var i = 0; i < occurrences.length; i++) {
        occurrences[i] = occurrences[i].clone();
        
        with (occurrences[i]) {
            // append age to the title
            var age = startDate.year - aEvent.startDate.year;
            title += " (" + age + ")";
            
            makeImmutable();
        }
    }
    
    return occurrences;
}


/**
 * cTBD_compareDatesInYear
 * Compares two given dates and returns -1, 0, 1 to indicate which date occures
 * first in one year. If aDateTime1 occures earlier in the year than aDateTime2,
 * it returns -1, if it's vise versa, it returns 1 and if both date are equal
 * (regarding month and day), it returns 0.
 *
 * @param aDateTime1  calIDateTime
 * @param aDateTime2  calIDateTime
 *
 * @returns -1, 0 or 1 indicating which of the dates occures earlier in one year
 */
function cTBD_compareDatesInYear(aDateTime1, aDateTime2) {
    if (aDateTime1.month > aDateTime2.month) return 1;
    else if (aDateTime1.month < aDateTime2.month) return -1;
    else if (aDateTime1.day > aDateTime2.day) return 1;
    else if (aDateTime1.day < aDateTime2.day) return -1;
    else return 0;
}


/*
 * General helpers
 */

/**
 * MyLOG
 * Logs the message aMessage to the console if aPriority is lower than the preference
 * extensions.thunderbirthday.verbosity. As a convention, priority is an integer
 * from 0 (very important) to 5 (totally unimportant). Only messages with debug
 * level 0 are shown as errors, other messages as notices.
 *
 * @param aPriority     Priority of the message (small values mean high priority)
 * @param aMessage      Message to be logged
 */
function MyLOG(aPriority, aMessage) {
    if (this.mVerbosity == null) {
        // load verbosity from pref tree
        this.mVerbosity = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService)
                                .getBranch("extensions.thunderbirthday.")
                                .getIntPref("verbosity");
        
        // load console service
        this.mConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                    .getService(Components.interfaces
                                                          .nsIConsoleService);
    }
    
    if (aPriority <= this.mVerbosity) {
        if (aPriority == 0) {
            Components.utils.reportError(aMessage);
        } else {
            this.mConsoleService.logStringMessage(aMessage);
        }
    }
}
MyLOG.prototype.mVerbosity = null;
MyLOG.prototype.mConsoleService = null;


/**
 * md5
 * Computes the md5 hash of a string.
 *
 * Copied from http://developer.mozilla.org/en/docs/nsICryptoHash
 *
 * @param aString  String the md5 hash should be computed for
 * @returns  Md5 hash of aString as string in hexadecimal format
 */
function md5(aString) {
    // convert string to byte array
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    converter.charset = "UTF-8";
    
    var data = converter.convertToByteArray(aString, {});
    var ch = Components.classes["@mozilla.org/security/hash;1"]
                       .createInstance(Components.interfaces.nsICryptoHash);
    
    // calculate hash
    ch.init(ch.MD5);
    ch.update(data, data.length);
    var hash = ch.finish(false);

    // convert the binary hash data to a hex string.
    var s = "";
    for(i = 0; i < hash.length; i++) {
        s += hash.charCodeAt(i).toString(16);
    }
    
    return s; 
}