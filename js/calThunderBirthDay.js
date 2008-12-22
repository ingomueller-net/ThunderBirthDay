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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

/**
 * calGoogleCalendar
 * This Implements a calICalendar Object adapted to the Google Calendar
 * Provider.
 *
 * @class
 * @constructor
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
    mAdressbooks: null,
	mItem: null,

/*
 * implement calICalendar
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
	
    set uri(aUri) {
		// Components.utils.reportError("tb: set uri() called: " + aUri.spec);
		
        this.mUri = aUri;
		return aUri;
    },

    get canRefresh() {
		Components.utils.reportError("tb: canRefresh() called");
        return false;
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
            var itemReturnOccurrences = ((aItemFilter &
                Ci.calICalendar.ITEM_FILTER_CLASS_OCCURRENCES) != 0);
			
            //-----
			
			var abDirectoryEnum = this.getAbDirectoryEnum();
			
			// iterate through directories
			while (abDirectoryEnum.hasMoreElements()) {
				var abDir = abDirectoryEnum.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
				
				// with (abDir.directoryProperties) Components.utils.reportError ("ab: " + dirType + fileName + URI);
				
				var abCardsEnum = abDir.childCards.QueryInterface(Components.interfaces.nsIEnumerator);
				try {
					// initialize abCardsEnum (nsIEnumerator stinks)
					abCardsEnum.first();
					
					// iterate through cards
					do {
						var abCard = abCardsEnum.currentItem().QueryInterface(Components.interfaces.nsIAbCard);
						
						var baseItem = cTBD_convertAbCardToEvent(abCard);
						baseItem.calendar = this;
						baseItem.makeImmutable();
						
						var items = cTBD_getOccurencesAsEvents(baseItem,aRangeStart,aRangeEnd);
						
						// report occurrences of this card
						if (items.length > 0) {
							Components.utils.reportError("getItems: returning items: " + items.length);
							
							aListener.onGetResult(this,
												  Cr.NS_OK,
												  Ci.calIEvent,
												  null,
												  items.length,
												  items);
						}
						
						// abCardsEnum.next() will throw an exception when arrived at the end of the list (nsIEnumerator stinks)
					} while(abCardsEnum.next() || true)
				}
				// these are exceptions thrown by the nsIEnumerator interface and well known
				// apperently the interface can't be used in a clean way... :-/
				catch (e if e.name == "NS_ERROR_FAILURE" || e.name == "NS_ERROR_INVALID_POINTER") {
					// nsIEnumerator stinks!!!
					// Components.utils.reportError("getItems: exception: nsIEnumerator stinks!!!");
				} catch (e) {
					Components.utils.reportError("getItems: exception: "
								+ ", name: " + e.name 
								+ ", message: " + e.message 
								+ ", stack: " + e.stack 
								+ ", result: " + e.result 
								+ ", data: " + e.data 
								+ ", inner: " + e.inner);
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

    refresh: function cTBD_refresh() { },

    startBatch: function cTBD_startBatch() {
		Components.utils.reportError("tb: startBatch() called");
        this.notifyObservers("onStartBatch", []);
    },

    endBatch: function cTBD_endBatch() {
		Components.utils.reportError("tb: endBatch() called");
        this.notifyObservers("onEndBatch", []);
    },

/*
* Stuff
*/
	getAbDirectoryEnum: function cTBD_getAbDirectoryEnum() {
		// Components.utils.reportError("tb: get abDirectoryEnum() called");
		
		var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
		
		// "All adressbooks" has been chosen
		if (this.mUri.spec == "moz-abdirectory://") {
			var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);
			
			return abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);
		}
		// One specific adressbook
		else {
			return abRdf.GetResource(this.mUri).QueryInterface(Components.interfaces.nsIAbDirectory);
		}
    },
	
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

/**
* cTBD_convertAbCardToEvent
* Converts an nsIAbCard into an calIEvent of the birthday with infinite yearly recurrence
*
 * @param abCard  nsIAbCard interface of an adressbook card
 *
 * @returns  calIEvent of the birhtday, not immutable and with no calender property set
 */
function cTBD_convertAbCardToEvent(abCard) {
	Components.utils.reportError("convert: called");
	
	var event = createEvent();
	
	// todo: id, title
	event.id = Math.round(Math.random() * 1000);
	event.title = abCard.displayName + "s Geburtstag";
	
	
	// set start and end date
	event.startDate = createDateTime();
	with (event.startDate) {
		year = parseInt(abCard.birthYear);
		month = parseInt(abCard.birthMonth) - 1;		// month is zero-based
		day = parseInt(abCard.birthDay);
		isDate = true;
		normalize();
	}
	
	event.endDate = event.startDate.clone();
	event.endDate.day += 1;								// all-day events end 1 day after the began
	
	
	// set recurrence information
	event.recurrenceInfo = createRecurrenceInfo();
	event.recurrenceInfo.item = event;
	
	var recRule = createRecurrenceRule();
		recRule.type = "YEARLY";
		recRule.interval = 1;
		recRule.count = -1;
	
	event.recurrenceInfo.insertRecurrenceItemAt(recRule, 0);
	
	
	Components.utils.reportError("convert: returning event");
	
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
		var newItem = aEvent.clone();
		
		// todo: id
		// todo: title (display age)
		with (newItem) {
			id = Math.round(Math.random() * 1000);
			
			startDate = occurrences[i].clone();
			endDate = occurrences[i].clone();
			endDate.day += 1;
			
			// todo: not sure what recurrenceId dose...
			recurrenceId = startDate.clone();
			
			recurrenceInfo = aEvent.recurrenceInfo;
			parentItem = aEvent;
			makeImmutable();
			
			events.push(newItem);
		}
	}
	
	return events;
}
