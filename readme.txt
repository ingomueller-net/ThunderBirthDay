+-----------------------------------+
|            Credits                |
+-----------------------------------+

A huge thanks to all contributors of this extensions!

Philipp Kewisch -- The author of the google calendar provider, which
				   served as skeleton for ThunderBirthDay
Michael Kurz -- For the active testing and the support in bug smashing!
Babelzilla and the translators there -- See datails in install.rdf

And many other testers...


+-----------------------------------+
|         Known issues              |
+-----------------------------------+

* calIItemBase.id
	- The ID is not unique yet. Until now, it is an MD5 hash of the Name,
	  the birthday and the calendar's URI. This makes it pretty unique, but
	  not entirely unique. One idea is to generate a random MD5 hash and
	  save it in a new field with the nsIAddrDatabase interface.

* calICalendar.getItem()
	- Not sure how to test this...

* calICalendar.getItems()
	- Until now, the occurrences of a recurring item as returned by the
	  TBD data provider do not have the same title as the base item. Users
	  retrieving occurences with the calIItemBase.getOccurrencesBetween()
	  will get occurrences with the same title as the base item (no age in
	  parenthesis). Maybe implementing the calIItemBase interface is a
	  solution...

* Anyway, if you read this and have any ideas, suggestions, critics or
  whatsoever, please let me know!


+-----------------------------------+
|     Possible new features         |
+-----------------------------------+

* Maybe we can use nsIAddrDBListener to track changes to the address
  book, so there is no need to refresh anymore, or at least, changes
  will be tracked immediately.

* Possibility to choose a user defined field where the birthday is
  stored instead of the mostly unaccessible fields birthday, birthmonth
  and birthyear. Maybe even possibility to choose format (dd.mm.yyyy).

* Possibility to choose between birthdays, anniversaries and both. Like
  the feature above, the coise can be stored in the calendar uri as
  paremters like this: moz-abmdbdirectory://abook.mab?type=birthday&field=user1

* Replace the modify dialog of events for TBD-calenders with the
  property dialog of the concerned addressbook card (not sure about
  that one yet).
  
+-----------------------------------+
|    Resources for developers       |
+-----------------------------------+

* http://rfc.net/rfc2445.html -- RFC2445 - Internet Calendaring and
  Scheduling Core Object Specification (iCalendar)
* http://lxr.mozilla.org/ -- Source code of Thunderbird and Lighting
* http://lxr.mozilla.org/mozilla/source/calendar/base/public/calICalendar.idl --
  Specification of the calICalendar interface - the main interface TBD is
  implementing.