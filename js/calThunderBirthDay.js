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
 * The Original Code is Google Calendar Provider code.
 *
 * The Initial Developer of the Original Code is
 *   Philipp Kewisch (mozilla@kewis.ch)
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Joey Minta <jminta@gmail.com>
 *   Ingo Mueller
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
	Components.utils.reportError("tb: calThunderBirthDay() called");
    
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
		// Components.utils.reportError("tb: calThunderBirthDay.prototype.QueryInterface() called");
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
	
/*
 * Implement calICalendar
 */
    get id() {
		// Components.utils.reportError("tb: get id() called: " + this.mID);
        return this.mID;
    },
	
    set id(id) {
		// Components.utils.reportError("tb: set id() called: " + id);
        if (this.mID)
            throw Cr.NS_ERROR_ALREADY_INITIALIZED;
        return (this.mID = id);
    },
	
    get readOnly() {
		// Components.utils.reportError("tb: get readOnly() called");
        return true;
    },
	
    set readOnly(v) {
		Components.utils.reportError("tb: set readOnly() called : " + v);
        // todo: return this.mReadOnly = v;
		return true;
    },
	
    get type() {
		Components.utils.reportError("tb: get type() called");
        return "thunderbirthday";
    },
	
    get sendItipInvitations() {
		Components.utils.reportError("tb: sendItipInvitations() called");
        return false;
    },
	
    get uri() {
		// Components.utils.reportError("tb: get uri() called: " + this.mUri.spec);
        return this.mUri;
    },
	
	/**
	 * When (re)setting the adressbooks uri, we collect all the directories
	 * stored at that uri. This is only one adressbook if the uri is of the form
	 * "moz-abmdbdirectory://abook.mab" and all directories of the if the
	 * uri is of the form "moz-abdirectory://".
	 */
    set uri(aUri) {
		// Components.utils.reportError("tb: set uri() called: " + aUri.spec);
		
        this.mUri = aUri;
		
		// reset mDirectories
		this.mDirectories = [];
		
		var abRdf = getRDFService();
		
		// "All adressbooks" has been chosen
		if (this.mUri.spec == "moz-abdirectory://") {
			var abRootDir = abRdf.GetResource("moz-abdirectory://")
								.QueryInterface(Components.interfaces.nsIAbDirectory);
			
			var abDirectoryEnum = abRootDir.childNodes
								.QueryInterface(Components.interfaces.nsISimpleEnumerator);
			
			while (abDirectoryEnum.hasMoreElements()) {
				var abDir = abDirectoryEnum.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
				this.mDirectories.push(abDir);
			}
		}
		// One specific adressbook
		else {
			var abDir = abRdf.GetResource(this.mUri.spec).QueryInterface(Components.interfaces.nsIAbDirectory);
			this.mDirectories.push(abDir);
		}
		
		Components.utils.reportError("uri: stored " + this.mDirectories.length 
					+ " directories for " + aUri.spec);
		
		return aUri;
    },
	
    get canRefresh() {
		Components.utils.reportError("tb: canRefresh() called");
		// I *guess* it makes sense to refresh this calender, as its entries are
		// only modified by an external application (=the thunderbird adressbook)
		// until now.
        return true;
    },
	
    addObserver: function cTBD_addObserver(aObserver) {
 		Components.utils.reportError("tb: addObserver() called");
       if (this.mObservers.indexOf(aObserver) == -1) {
            this.mObservers.push(aObserver);
        }
    },
	
    removeObserver: function cTBD_removeObserver(aObserver) {
		Components.utils.reportError("tb: removeObserver() called");
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
		Components.utils.reportError("tb: adoptItem() called");
        
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
		Components.utils.reportError("tb: addItem() called");
        
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
		Components.utils.reportError("tb: modifyItem() called");
        
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
		Components.utils.reportError("tb: deleteItem() called");
        
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
		Components.utils.reportError("tb: getItem() called");
        
		// This function needs a test case using mechanisms in bug 365212
        LOG("Getting item with id " + aId);
        try {
            this.mSession.getItem(this, aId, this.getItem_response, aListener);
        } catch (e) {
            if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.GET,
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
		try {
			Components.utils.reportError("tb: getItems() called: " + aRangeStart.toString() + "-" + aRangeEnd.toString());
		} catch(e) {
			Components.utils.reportError("tb: getItems() called");
		}	
		
        try {
            // item base type
            var wantEvents = ((aItemFilter &
                               Ci.calICalendar.ITEM_FILTER_TYPE_EVENT) != 0);
            var wantTodos = ((aItemFilter &
                              Ci.calICalendar.ITEM_FILTER_TYPE_TODO) != 0);
			
            // check if events are wanted
            if (!wantEvents && !wantTodos) {
                // Nothing to do. The onOperationComplete in the catch block
                // below will catch this.
                throw new Components.Exception("", Cr.NS_OK);
            } else if (wantTodos && !wantEvents) {
                throw new Components.Exception("", Cr.NS_ERROR_NOT_IMPLEMENTED);
            }
			
            // return occurrences?
			// todo: so only return occurrences
            var itemReturnOccurrences = ((aItemFilter &
                Ci.calICalendar.ITEM_FILTER_CLASS_OCCURRENCES) != 0);
			
            //-----
			
			// iterate through directories
			for (var i = 0; i < this.mDirectories.length; i++) {
				var abDir = this.mDirectories[i];
				
				// with (abDir.directoryProperties) Components.utils.reportError ("ab: " + dirType + fileName + URI);
				
				var abCardsEnum = abDir.childCards.QueryInterface(Components.interfaces.nsIEnumerator);
				try {
					// initialize abCardsEnum (nsIEnumerator stinks)
					abCardsEnum.first();
					
					// iterate through cards
					do {
						var abCard = abCardsEnum.currentItem().QueryInterface(Components.interfaces.nsIAbCard);
						
						var baseItem = cTBD_convertAbCardToEvent(abCard);
						
						if (!baseItem) continue;	// card couldn't be converted to an event
						
						baseItem.calendar = this;
						baseItem.makeImmutable();
						
						var items = cTBD_getOccurencesAsEvents(baseItem,aRangeStart,aRangeEnd);
						
						// report occurrences of this card
						if (items.length > 0) {
							Components.utils.reportError("getItems: returning " + items.length
										+ " item for " + abCard.displayName);
							
							aListener.onGetResult(this,
												  Cr.NS_OK,
												  Ci.calIEvent,
												  null,
												  items.length,
												  items);
						}
						
						// abCardsEnum.next() will (hopefully) throw an exception when
						// arrived at the end of the list (nsIEnumerator stinks)
					} while(abCardsEnum.next() || true)
				}
				// these are exceptions thrown by the nsIEnumerator interface and well known
				// apperently the interface can't be used in a clean way... :-/
				catch (e if e.name == "NS_ERROR_FAILURE" || e.name == "NS_ERROR_INVALID_POINTER") {
					// nsIEnumerator stinks!!!
					// Components.utils.reportError("getItems: exception: nsIEnumerator stinks!!!");
				} catch (e) {
					Components.utils.reportError("getItems: exception: " + e);
				}
			}
			
			Components.utils.reportError("getItems: sending done message");
			
			// Operation completed successfully.
			if (aListener != null) {
				aListener.onOperationComplete(this,
											  Cr.NS_OK,
											  Ci.calIOperationListener.GET,
											  null,
											  null);
			}
        } catch (e) {
			Components.utils.reportError("getItems: exception: " + e.message + ", filter: " + aItemFilter);
            
			if (aListener != null) {
                aListener.onOperationComplete(this,
                                              e.result,
                                              Ci.calIOperationListener.GET,
                                              null, e.message);
            }
        }
    },
	
    refresh: function cTBD_refresh() {
		Components.utils.reportError("tb: refresh() called");
		this.notifyObservers("onLoad", [this]);
	},
	
	/*
	 * Todo: Don't know what that's for...
	 */
    startBatch: function cTBD_startBatch() {
		Components.utils.reportError("tb: startBatch() called");
        this.notifyObservers("onStartBatch", []);
    },
	
    endBatch: function cTBD_endBatch() {
		Components.utils.reportError("tb: endBatch() called");
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
 		Components.utils.reportError("tb: notifyObservers() called");
        for each (var obs in this.mObservers) {
            try {
                obs[aEvent].apply(obs, aArgs);
            } catch (e) {
                Components.utils.reportError(e);
            }
        }
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
		   getService(Components.interfaces.nsIRDFService);
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
			null if no valid birthday could be found
 */
function cTBD_convertAbCardToEvent(abCard) {
	
	var event = createEvent();
	
	// todo: id
	event.id = Math.round(Math.random() * 1000);
	
	
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
	var year = parseInt(abCard.birthYear);
	var month = parseInt(abCard.birthMonth) - 1;	// month is zero-based
	var day = parseInt(abCard.birthDay);
	
	// this is also false when year, month or day is not set or NaN
	if (!(year >= 0 && year < 3000 && month >= 0 && month <= 11 && day >= 1 && day <= 31)) {
		Components.utils.reportError("convert: datum " + year + "-" + month + "-" + day + " nicht valide");
		return null;
	}
	
	
	// set start and end date
	event.startDate = createDateTime();
	event.startDate.year = year;
	event.startDate.month = month;
	event.startDate.day = day;
	event.startDate.isDate = true;
	event.startDate.normalize();
	// Components.utils.reportError("convert: datum " + abCard.birthYear + "-" + abCard.birthMonth 
				// + "-" + abCard.birthDay + " wird zu " + event.startDate.toString());
	
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
function cTBD_getOccurencesAsEvents(aEvent,aRangeStart,aRangeEnd) {
	// we probably also want birthdays "that already started"
	// that day, so we let the range start on the beginning of that day
	var allDayRangeStart = aRangeStart.clone();
	allDayRangeStart.isDate = true;
	
	
	// get occurences
	var recurrenceItems = aEvent.recurrenceInfo.getRecurrenceItems({});
	var occurrences = recurrenceItems[0].getOccurrences(aEvent.startDate,allDayRangeStart,aRangeEnd,-1,{});
															// I *suppose* that -1 means no limit   ^^
	
	// create events
	var events = [];
	
	for (var i = 0; i < occurrences.length; i++) {
		// todo: use createProxy()
		var newItem = aEvent.clone();
		
		// todo: id
		// todo: title (display age)
		with (newItem) {
			id = Math.round(Math.random() * 1000);
			
			startDate = occurrences[i].clone();
			endDate = occurrences[i].clone();
			endDate.day += 1;
			
			// todo: not sure what recurrenceId does...
			recurrenceId = aEvent.startDate.clone();
			
			recurrenceInfo = aEvent.recurrenceInfo;
			parentItem = aEvent;
			makeImmutable();
			
			events.push(newItem);
		}
	}
	
	return events;
}
