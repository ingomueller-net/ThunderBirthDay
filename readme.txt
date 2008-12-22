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
|       Important issues            |
+-----------------------------------+

* calIItemBase.id
	- At the beginning, it was random number between 0 and 1000.
	  Now, it's a random md5 hash for the base event. Is that a
	  good idea? As the hashes change after the calender is refreshed,
	  it may be not.
	- What is it for? How long is one ID assossiated with its
	  event? Does this assossiation end with the termination of
	  Thunderbird or does one event have to have the same ID every
	  time Thunderbird starts?
	- I don't have any idea how to generate a unique hash for one
	  addressbook card which doesn't change when details of the card
	  are changed.
	- I suppose that the occurrences of a recurring item have to have
	  the same id as the base item. Is that right?

* calICalendar.getItem()
	- When is function used?
	- I suppose that it should return only base items of recurring
	  items and no occurrences. Is that right?

* calICalendar.getItems()
	- Do the occurrences of a recurring item have to have the same
	  title as the base item? I guess that normaly, they have, because
	  views and other users of a calender can call item.getOccurrences()
	  which copies the title of the base item. What if I do need the
	  different occurrences to have a custom title?

* I'm sure there's a lot more. Anyway, if you read this and have any
  ideas, suggestions, critics or whatsoever, please let me know!


+-----------------------------------+
|     Possible new features         |
+-----------------------------------+

* Possibility to choose a user defined field where the birthday is
  stored instead of the mostly unaccessible fields birthday, birthmonth
  and birthyear. Maybe even possibility to choose format (dd.mm.yyyy).

* Possibility to choose between birthdays, anniversaries and both. Like
  the feature above, the coise can be stored in the calendar uri as
  paremters like this: moz-abmdbdirectory://abook.mab?type=birthday&field=user1

* Replace the modify dialog of events for TBD-calenders with the
  property dialog of the concerned addressbook card (not sure about
  that one yet).