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
 *	Ingo Mueller (thunderbirthday at ingomueller dot net)
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *	Philipp Kewisch (mozilla@kewis.ch), developper of the Google
 *		Calender Provider this extension is (vaguely) based on
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
 * This Implements a calICalendar object adapted to the Thunderbirthday
 * Provider.
 *
 * Note: I copied this part from the Google Calendar Provider without
 * understanding it 100%. It just works for the moment...
 */
function calThunderBirthDay() {
	LOG(2,"TBD: calThunderBirthDay() called");
    
	this.mObservers = new Array();

    var calObject = this;

    function calAttrHelper(aAttr) {
        this.getAttr = function calAttrHelper_get() {
            // Note that you need to declare this in here, to avoid cyclic
            // getService calls.
            var calMgr = Cc["@mozilla.org/calendar/manager;1"].
                         getService(Ci.calICalendarManager);
            return calMgr.getCalendarPref(calObject, aAttr);
        };
        this.setAttr = function calAttrHelper_set(aValue) {
            var calMgr = Cc["@mozilla.org/calendar/manager;1"].
                         getService(Ci.calICalendarManager);
            calMgr.setCalendarPref(calObject, aAttr, aValue);
            return aValue;
        };
    }

    var prefAttrs = ["name", "suppressAlarms"];
    for each (var attr in prefAttrs) {
        var helper = new calAttrHelper(attr);
        this.__defineGetter__(attr, helper.getAttr);
        this.__defineSetter__(attr, helper.setAttr);
    }
}

calThunderBirthDay.prototype = {
	QueryInterface: function cTBD_QueryInterface(aIID) {
        if (!aIID.equals(Ci.nsISupports) &&
            !aIID.equals(Ci.calICalendar)) {
            throw Cr.NS_ERROR_NO_INTERFACE;
        }
        return this;
    },

/*
 * Member Variables
 */
    mID: null,
    mObservers: null,
    mUri: null,
    mDirectories: null,
	mBaseItems: null,
	
/*
 * Implement calICalendar
 */
    get id() {
        return this.mID;
    },
	
    set id(id) {
        if (this.mID) {
			LOG(3, "TBD: exception: NS_ERROR_ALREADY_INITIALIZED");
            throw Cr.NS_ERROR_ALREADY_INITIALIZED;
		}
        return (this.mID = id);
    },
	
    get readOnly() {
        return true;
    },
	
    set readOnly(v) {
		return true;
    },
	
    get type() {
        return "thunderbirthday";
    },
	
    get sendItipInvitations() {
		// We don't "handle invitations internally", so I *guess* we should return true
        return true;
    },
	
    get uri() {
        return this.mUri;
    },
	
    set uri(aUri) {
		LOG(2,"TBD: set uri() called: " + aUri.spec);
		
        this.mUri = aUri;
		
		// the uri of the directories changed, so we need refresh everything
		this.refresh();
		
		return aUri;
    },
	
    get canRefresh() {
		// I *guess* it makes sense to refresh this calender, as its entries are
		// only modified by an external application (=the thunderbird adressbook)
		// until now.
        return true;
    },
	
    addObserver: function cTBD_addObserver(aObserver) {
       if (this.mObservers.indexOf(aObserver) == -1) {
            this.mObservers.push(aObserver);
        }
    },
	
    removeObserver: function cTBD_removeObserver(aObserver) {
        function cTBD_removeObserver_remove(obj) {
            return ( obj != aObserver );
        }
        this.mObservers = this.mObservers.filter(cTBD_removeObserver_remove);
    },
	
	/*
	 * The following functions only consist of throwing CAL_IS_READONLY exceptions
	 * as thunderbirthday can't write to the adressbook yet.
	 */
    adoptItem: function cTBD_adoptItem(aItem, aListener) {
		LOG(2,"TBD: adoptItem() called");
        
		try {
			throw new Components.Exception("", Ci.calIErrors.CAL_IS_READONLY);
        } catch (e) {
            this.notifyObservers("onError", [e.result, e.message]);
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.ADD,
                                              null,
                                              e.message);
            }
        }
    },
	
    addItem: function cTBD_addItem(aItem, aListener) {
		LOG(2,"TBD: addItem() called");
        
		try {
			throw new Components.Exception("", Ci.calIErrors.CAL_IS_READONLY);
        } catch (e) {
            this.notifyObservers("onError", [e.result, e.message]);
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.ADD,
                                              null,
                                              e.message);
            }
        }
    },
	
    modifyItem: function cTBD_modifyItem(aNewItem, aOldItem, aListener) {
		LOG(2,"TBD: modifyItem() called");
        
		try {
			throw new Components.Exception("", Ci.calIErrors.CAL_IS_READONLY);
        } catch (e) {
            this.notifyObservers("onError", [e.result, e.message]);
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.MODIFY,
                                              null,
                                              e.message);
            }
        }
    },
	
    deleteItem: function cTBD_deleteItem(aItem, aListener) {
		LOG(2,"TBD: deleteItem() called");
        
		try {
			throw new Components.Exception("", Ci.calIErrors.CAL_IS_READONLY);
        } catch (e) {
            this.notifyObservers("onError", [e.result, e.message]);
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.DELETE,
                                              null,
                                              e.message);
            }
        }
    },
	
	//todo: implement
    getItem: function cTBD_getItem(aId, aListener) {
		LOG(2,"TBD: getItem() called");
        
		try {
			throw new Components.Exception("", Cr.NS_ERROR_NOT_IMPLEMENTED);
        } catch (e) {
            this.notifyObservers("onError", [e.result, e.message]);
            
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.DELETE,
                                              null,
                                              e.message);
            }
        }
    },
	
    getItems: function cTBD_getItems(aItemFilter,
                                    aCount,
                                    aRangeStart,
                                    aRangeEnd,
                                    aListener) {
		var startTime = new Date();
		
		try {
			LOG(1,"TBD: getItems() called: " + aRangeStart.toString() + "-" + aRangeEnd.toString());
		} catch(e) {
			LOG(1,"TBD: getItems() called");
		}
		var itemsSent = 0;			// count items sent to the listener, so it doesn't exceed aCount
		
        try {
            // item base type (event or todo)
            var wantEvents = ((aItemFilter &
                               Ci.calICalendar.ITEM_FILTER_TYPE_EVENT) != 0);
            var wantTodos = ((aItemFilter &
                              Ci.calICalendar.ITEM_FILTER_TYPE_TODO) != 0);
			
            // check if events are wanted
            if (!wantEvents && !wantTodos) {
                // Nothing to do. The onOperationComplete in the catch block below will catch this.
                throw new Components.Exception("", Cr.NS_OK);
            } else if (wantTodos && !wantEvents) {
                throw new Components.Exception("", Cr.NS_ERROR_NOT_IMPLEMENTED);
            }
			
            // return occurrences?
			var itemReturnOccurrences = ((aItemFilter &
						Ci.calICalendar.ITEM_FILTER_CLASS_OCCURRENCES) != 0);
			
            
			// determine index in this.mBaseItems of first and last element to return
			var rangeIndices = {};
			this.calculateRangeIndices(aRangeStart, aRangeEnd, rangeIndices);
			
			
			// iterate through cards in this.mBaseItems
			for (var i, ii = rangeIndices.startIndex; ii <= rangeIndices.endIndex
							&& (aCount == 0 || itemsSent < aCount); ii++) {
				
				// if there is a "carry-over", ii may be greater than this.mBaseItems.length,
				// which means that we continue at the beginning of the array
				i = ii % this.mBaseItems.length;
				
				
				// collect occurrences or base item depending on the filter
				if (itemReturnOccurrences) {
					var items = cTBD_getOccurencesAsEvents(this.mBaseItems[i], aRangeStart, aRangeEnd);
				} else {
					var items = [this.mBaseItems[i]];
				}
				
				
				// report occurrences of this card
				if (items.length > 0) {
					LOG(2,"TBD: getItems: returning " + items.length
								+ " item for " + this.mBaseItems[i].title);
					
					itemsSent += items.length;
					
					aListener.onGetResult(this,
										  Cr.NS_OK,
										  Ci.calIEvent,
										  null,
										  items.length,
										  items);
				}
			}
			
			
			// Operation completed successfully.
			if (aListener != null) {
				aListener.onOperationComplete(this,
											  Cr.NS_OK,
											  Ci.calIOperationListener.GET,
											  null,
											  null);
			}
        }
		
		// Something went wrong, so notify observers
		catch (e) {
			if (e.name == "NS_OK" || e.name == "NS_ERROR_NOT_IMPLEMENTED") {
				LOG(1,"TBD: getItems: known exception, filter: " + aItemFilter);
            } else {
				LOG(5,"TBD: getItems: exception: " + e);
			}
			
			if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.GET,
                                              null, e.message);
            }
        }
		
		var endTime = new Date();
		LOG(2,"TBD: getItems: returned " + itemsSent + " events in " + (endTime - startTime) + " ms.");
    },
	
	/**
	    * refresh
	    * Reloads all external data, i.e. the directories and the abCards.
	    */
    refresh: function cTBD_refresh() {
		LOG(1,"TBD: refresh() called");
		
		//reload directories and ab cards
		this.loadDirectories();
		this.loadBaseItems();
		
		// tell observers to reload everything
		this.notifyObservers("onLoad", [this]);
	},
	
	/*
	 * Batch mode is not implemented. I don't know, whether we even need this...
	 */
    startBatch: function cTBD_startBatch() {
		LOG(1,"TBD: startBatch() called");
        this.notifyObservers("onStartBatch", []);
    },
	
    endBatch: function cTBD_endBatch() {
		LOG(1,"TBD: endBatch() called");
        this.notifyObservers("onEndBatch", []);
    },

/*
* Helpers
*/
	/**
	    * notifyObservers
	    * Notify this calendar's observers that a specific event has happened
	    *
	    * @param aEvent       The Event that happened.
	    * @param aArgs        An array of arguments that is passed to the observer
	    */
    notifyObservers: function cTBD_notifyObservers(aEvent, aArgs) {
 		for each (var obs in this.mObservers) {
            try {
                obs[aEvent].apply(obs, aArgs);
            } catch (e) {
                Components.utils.reportError(e);
            }
        }
    },
	
	/**
	    * loadDirectories
	    * Opens the directories stored at this.mUri and stores them as 
	    * nsIAbDirectory's in this.mDirectories.
	    *
	    * This is only one adressbook if the uri is of the form "moz-abmdbdirectory://abook.mab"
	    * and all directories of the user if the uri is of the form "moz-abdirectory://".
	    */
	loadDirectories: function cTBD_loadDirectories () {
		var startTime = new Date();
		
		// reset mDirectories
		this.mDirectories = [];
		
		var abRdf = getRDFService();
		
		// "All adressbooks" has been chosen
		if (this.mUri.spec == "moz-abdirectory://") {
			var abRootDir = abRdf.GetResource("moz-abdirectory://")
								.QueryInterface(Ci.nsIAbDirectory);
			
			var abDirectoryEnum = abRootDir.childNodes
								.QueryInterface(Ci.nsISimpleEnumerator);
			
			while (abDirectoryEnum.hasMoreElements()) {
				var abDir = abDirectoryEnum.getNext().QueryInterface(Ci.nsIAbDirectory);
				this.mDirectories.push(abDir);
			}
		}
		// One specific adressbook
		else {
			var abDir = abRdf.GetResource(this.mUri.spec).QueryInterface(Ci.nsIAbDirectory);
			this.mDirectories.push(abDir);
		}
		
		var endTime = new Date();
		
		LOG(3,"TBD: loaded " + this.mDirectories.length + " directories for " + this.mUri.spec +
					" in " + (endTime - startTime) + " ms.");
	},
	
	/**
	    * loadBaseItems
	    * Iterates through the directories asscociated with this calendar and stores
	    * base items for all contacts with valid birth date as calIEvent's in this.mBaseItems.
	    * Storing these events in RAM prevents us from reloading the directories every time
	    * this.getItems() is called.
	    */
	loadBaseItems: function cTBD_loadBaseItems () {
		var startTime = new Date();
		
		var itemsLoaded = 0;
		this.mBaseItems = [];
		
		// iterate through directories
		for (var i = 0; i < this.mDirectories.length; i++) {
			
			var abCardsEnum = this.mDirectories[i].childCards.
						QueryInterface(Ci.nsIEnumerator);
			
			try {
				// initialize abCardsEnum (nsIEnumerator stinks)
				abCardsEnum.first();
				
				// iterate through cards
				do {
					var abCard = abCardsEnum.currentItem().
								QueryInterface(Ci.nsIAbCard);
					
					var baseItem = cTBD_convertAbCardToEvent(abCard);
					if (!baseItem) continue;	// card couldn't be converted to an event
					
					baseItem.calendar = this;
					baseItem.makeImmutable();
					
					LOG(2,"TBD: loaded event for " + baseItem.title);
					
					
					this.mBaseItems.push(baseItem);
					itemsLoaded++;
					
					// abCardsEnum.next() always evaluates as false and will throw an exception when
					// arrived at the end of the list (nsIEnumerator stinks)
				} while(abCardsEnum.next() || true)
			}
			// these are exceptions thrown by the nsIEnumerator interface and well known.
			// apperently the interface can't be used in a clean way... :-/
			catch (e if e.name == "NS_ERROR_FAILURE" || e.name == "NS_ERROR_INVALID_POINTER") {
				LOG(0,"TBD: loadBaseItems: exception: nsIEnumerator stinks!!!");
			}
		}
		
		var endTime = new Date();
		LOG(2,"TBD: loadBaseItems: loaded " + itemsLoaded + " events in " + (endTime - startTime) + " ms.");
		
		
		// sort items by their occurence in a year
		startTime = new Date();
		this.mBaseItems.sort(function c(a,b) { return cTBD_compareDatesInYear(a.startDate, b.startDate); });
		endTime = new Date();
		
		LOG(2,"TBD: loadBaseItems: sorted in " + (endTime - startTime) + " ms.");
		
		// debug:
		// for (var i = 0; i < this.mBaseItems.length; i++) {
			// LOG(2,"TBD: sort: " + this.mBaseItems[i].startDate.month + "."
					// + this.mBaseItems[i].startDate.day + ". = " + this.mBaseItems[i].startDate.yearday);
		// }
	},
	
	/**
	    * calculateRangeIndices
	    * Calculates the index in this.mBaseItems of the first element in the range (startIndex)
	    * and the index of the last element in the range (endIndex). That way, elements with index
	    * between these values are in the range. Note that this.mBaseItems is sorted by yearday.
	    *
	    * Note that aResult.endIndex may be greater than this.mBaseElements.length, if aRangeEnd
	    * is earlier in the year than aRangeStart. In this case, aResult.endIndex % this.mBaseItems.length
	    * is the index of the first element after the range.
	    *
	    * @param aRangeStart  calIDateTime for the start of the range
	    * @param aRangeEnd  calIDateTime for the end of the range
	    *
	    * @returns  Object aResult with attributes startIndex and endIndex
	    */
	calculateRangeIndices: function cTBD_calculateRangeIndices (aRangeStart, aRangeEnd, aResult) {
		var startTime = new Date();
		
		// check whether it makes sense to calculate the indices
		// it doesn't make sens if the range is not set or (roughly) longer than a year
		if (!aRangeStart || !aRangeEnd || aRangeEnd.year - aRangeStart.year >= 2 ||
					(aRangeEnd.year - aRangeStart.year == 1 && aRangeEnd.month <= aRangeStart.month) ||
					this.mBaseItems.length == 0) {
			
			LOG(1,"TBD: range is more than a year.");
			
			// if it doesn't make sense, just "mark" the whole base items array
			aResult.startIndex = 0;
			aResult.endIndex = this.mBaseItems.length - 1;
			
		} else {		// range is less than a year
			
			// binary search the first element in the range
			var lower = 0;
			var upper = this.mBaseItems.length;
			
			while (upper != lower) {
				aResult.startIndex = Math.floor((upper + lower)/2);
				
				LOG(0,"TBD: pivot: (" + aResult.startIndex + ") " + this.mBaseItems[aResult.startIndex].startDate);
				
				if (cTBD_compareDatesInYear(aRangeStart,
											this.mBaseItems[aResult.startIndex].startDate) <= 0) {	// too late
					upper = aResult.startIndex;
				} else {	// too early
					lower = aResult.startIndex + 1;
				}
			}
			
			if (lower == this.mBaseItems.length) {
				// no element found, so just take last one
				aResult.startIndex = this.mBaseItems.length - 1;
			} else {
				aResult.startIndex = lower;		// == upper
			}
			
			LOG(1,"TBD: first element in range starts " + this.mBaseItems[aResult.startIndex].startDate);
			
			
			// binary search the first element after in the range
			lower = 0;
			upper = this.mBaseItems.length;
			
			while (upper != lower) {
				aResult.endIndex = Math.floor((upper + lower)/2);
				
				LOG(0,"TBD: pivot: (" + aResult.endIndex + ") " + this.mBaseItems[aResult.endIndex].startDate);
				
				if (cTBD_compareDatesInYear(aRangeEnd,
											this.mBaseItems[aResult.endIndex].startDate) < 0) {		// too late
					upper = aResult.endIndex;
				} else {	// too early
					lower = aResult.endIndex + 1;
				}
			}
			
			if (lower == this.mBaseItems.length) {
				// no element found, so just take last one
				aResult.endIndex = this.mBaseItems.length - 1;
			} else {
				aResult.endIndex = lower;		// == upper
			}
			
			LOG(1,"TBD: last element in range starts " + this.mBaseItems[aResult.endIndex].startDate);
		}
		
		var endTime = new Date();
		LOG(1,"TBD: calculateRangeIndices run in " + (endTime - startTime) + "ms.");
		
		// debug:
		// var log = "TBD: pivot: result found in " + (endTime - startTime) + " ms: \n";
		// for (var i = 0; i < this.mBaseItems.length; i++) {
			// if (i == aResult.startIndex) log += "_" + aRangeStart.month + "." + aRangeStart.day + "._\n";
			// if (i == aResult.endIndex) log += "^" + aRangeEnd.month + "." + aRangeEnd.day + ".^\n";
			// log += this.mBaseItems[i].startDate.month + "." + this.mBaseItems[i].startDate.day + ".\n";
		// }
		// LOG(0,log);
		
		
		// take care of "carry-over"
		if (aResult.endIndex < aResult.startIndex) aResult.endIndex += this.mBaseItems.length;
	}
};


/*
 * Helpers for Interfaces
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

/* Returns a clean new calIEvent */
function createEvent() {
    return Cc["@mozilla.org/calendar/event;1"].createInstance(Ci.calIEvent);
}

/* Returns a clean new calIDateTime */
function createDateTime() {
    return Cc["@mozilla.org/calendar/datetime;1"].
           createInstance(Ci.calIDateTime);
}

/* Shortcut to the calendar-manager service */
function getCalendarManager() {
    return Cc["@mozilla.org/calendar/manager;1"].
           getService(Ci.calICalendarManager);
}

/* Returns a clean new calIRecurrenceRule */
function createRecurrenceRule() {
    return Cc["@mozilla.org/calendar/recurrence-rule;1"].
           createInstance(Ci.calIRecurrenceRule);
}

/* Returns a clean new calIRecurrenceInfo */
function createRecurrenceInfo() {
    return Cc["@mozilla.org/calendar/recurrence-info;1"].
           createInstance(Ci.calIRecurrenceInfo);
}

/* Shortcut to the RDF service */
function getRDFService() {
	return Cc["@mozilla.org/rdf/rdf-service;1"].
		   getService(Ci.nsIRDFService);
}


/*
 * Functions for dealing with cards and events
 */

/**
   * cTBD_convertAbCardToEvent
   * Converts an nsIAbCard into an calIEvent of the birthday with infinite yearly recurrence
   *
    * @param abCard  nsIAbCard interface of an adressbook card
    *
    * @returns  calIEvent of the birthday, not immutable and with no calender property set
    *			null if no valid birthday could be found
 */
function cTBD_convertAbCardToEvent(abCard) {
	
	var event = createEvent();
	
	event.id = md5(Math.random());
	
	
	// remark:the base items title only consist of the name. Occurrences titles
	// make use of the base items title and append additional information like age and such
	
	// choose best field of the abCard for the title
	with (abCard) var possibleTitles = [displayName,			// one of these fields (except nickname) has
										nickName,				// to be set for every card
										(firstName && lastName ? firstName + " " + lastName : null),
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
	
	
	//search for valid date
	var year = parseInt(abCard.birthYear,10);
	var month = parseInt(abCard.birthMonth,10) - 1;	// month is zero-based
	var day = parseInt(abCard.birthDay,10);
	
	// this is also false when year, month or day is not set or NaN
	if (!(year >= 0 && year < 3000 && month >= 0 && month <= 11 && day >= 1 && day <= 31)) {
		LOG(0,"TBD: convert: datum " + year + "-" + month + "-" + day + " nicht valide");
		return null;
	}
	
	
	// set start and end date
	event.startDate = createDateTime();
	event.startDate.year = year;
	event.startDate.month = month;
	event.startDate.day = day;
	event.startDate.isDate = true;
	event.startDate.normalize();
	
	LOG(0,"TBD: convert: datum " + abCard.birthYear + "-" + abCard.birthMonth 
				+ "-" + abCard.birthDay + " wird zu " + event.startDate.toString());
	
	event.endDate = event.startDate.clone();
	event.endDate.day += 1;							// all-day events end 1 day after they began
	
	
	// set recurrence information
	event.recurrenceInfo = createRecurrenceInfo();
	event.recurrenceInfo.item = event;
	
	var recRule = createRecurrenceRule();
		recRule.type = "YEARLY";
		recRule.interval = 1;
		recRule.count = -1;
	
	event.recurrenceInfo.insertRecurrenceItemAt(recRule, 0);
	
	// as the actual birthday, this event is the start of the recurrence
	event.recurrenceStartDate = event.startDate.clone();
	// todo: not sure what recurrenceId does...
	event.recurrenceId = event.startDate.clone();
	
	
	// additional info
	event.lastModifiedTime = createDateTime();
	event.lastModifiedTime.nativeTime = abCard.lastModifiedDate * 1000 * 1000;
	
	if(abCard.webPage2)			// webPage2 is home web page
		event.setProperty("URL", abCard.webPage2);
	
	event.privacy = "PRIVATE";
	
	
	return event;
}


/**
    * cTBD_getOccurences
    * Returns all occurences of an event in a certain range as items
    *
    * @param aEvent  calIEvent to get the occurrences from
    * @param aRangeStart  calIDateTime indicating the start of the range for the occurrences,
    *				"flooring" to the beginning of the day of aRangeStart
    * @param aRangeEnd  calIDateTime indicating the end of the range for the occurrences
    *
    * @returns calIEvent() which are occurrences of aEvent in the given range
    */
function cTBD_getOccurencesAsEvents(aEvent, aRangeStart, aRangeEnd) {
	// we probably also want birthdays "that already started"
	// that day, so we let the range start on the beginning of that day
	var allDayRangeStart = aRangeStart.clone();
	allDayRangeStart.isDate = true;
	
	
	// get occurences
	var recurrenceItems = aEvent.recurrenceInfo.getRecurrenceItems({});
	var occurrences = recurrenceItems[0].getOccurrences(aEvent.startDate,
														allDayRangeStart,
														aRangeEnd,-1,{});	// I *suppose* that -1 means no limit
	
	// create events
	var events = [];
	
	for (var i = 0; i < occurrences.length; i++) {
		// todo: use createProxy()
		var newItem = aEvent.clone();
		
		with (newItem) {
			startDate = occurrences[i].clone();
			startDate.makeImmutable();
			
			endDate = occurrences[i].clone();
			endDate.day += 1;
			endDate.normalize();
			endDate.makeImmutable();
			
			// append age to the title
			var age = startDate.year - aEvent.startDate.year;
			title += " (" + age + ")";
			
			// id is md5 hash of base item + age
			id = aEvent.id + "-" + age;
			
			recurrenceInfo = aEvent.recurrenceInfo;
			parentItem = aEvent;
			makeImmutable();
			
			events.push(newItem);
		}
		
		LOG(0,"TBD: created occurence with id " + newItem.id +
					" belonging to base event with id " + aEvent.id);
	}
	
	return events;
}


/**
    * cTBD_compareDatesInYear
    * Compares two given dates and returns -1, 0, 1 to indicate which date occures
    * first in one year. If aDateTime1 occures earlier in the year than aDateTime2,
    * it returns -1, if it's vise versa, it returns 1 and if both date are equal (regarding
    * month and day), it returns 0.
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


/**
    * LOG
    * Logs the message aMessage to the console if aDebugLevel is higher than a certain
    * number, that can be set according to ones suites. As a convention, debug levels can be
    * integers from 0 (totaly unimportant) to 5 (very important). Only messages with debug
    * level 5 are shown as errors, other messages as notices.
    *
    * @param aDebugLevel  Minimum debug level where the message should be shown.
    * @param aMessage  Message to be logged.
    */
function LOG(aDebugLevel, aMessage) {
	if (aDebugLevel >= 5) {
		if (aDebugLevel < 5) {
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
										 .getService(Components.interfaces.nsIConsoleService);
			consoleService.logStringMessage(aMessage);
		} else {
			Components.utils.reportError(aMessage);
		}
	}
}


/**
    * md5
    * Computes the md5 hash of a string.
    *
    * Copied from http://developer.mozilla.org/en/docs/nsICryptoHash
    *
    * @param aString  String the md5 hash should be computed for
    *
    * @returns  Md5 hash of aString as string in hexadecimal format
    */
function md5(aString) {
	// convert string to byte array
	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
	    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

	converter.charset = "UTF-8";
	
	var data = converter.convertToByteArray(aString, {});
	var ch = Cc["@mozilla.org/security/hash;1"]
	                   .createInstance(Components.interfaces.nsICryptoHash);
	
	// calculate hash
	ch.init(ch.MD5);
	ch.update(data, data.length);
	var hash = ch.finish(false);

	// convert the binary hash data to a hex string.
	var s = "";
	for(i=0; i<hash.length; i++)
		s += hash.charCodeAt(i).toString(16);
	
	return s; 
}