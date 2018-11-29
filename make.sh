#!/bin/bash

#
# Packages the ThunderBirthDay add-on in a xpi-file.
# Entries from .gitignore are ignored.
#
# Usage: ./make.sh
#

ROOTDIR="$(pushd `dirname $0` > /dev/null; pwd; popd > /dev/null)"

# Find install.rdf
SRCDIR="$ROOTDIR/src"
if [ ! -e "$SRCDIR/install.rdf" ]
then
    echo "install.rdf not found. Exiting..."
    exit
fi

# Find version
VERSION=$(grep em:version "$SRCDIR/install.rdf" | sed "s/.*<em:version>//" | sed "s/<\/.*//")
if [[ -z "$VERSION" ]]
then
    echo "version number not found. Exiting..."
    exit
fi

# Find output directory
GENDIR="$ROOTDIR/gen"
if [ ! -d "$GENDIR" ]
then
    echo "gen directory not found. Exiting..."
    exit
fi

# Remove old XPI
XPIFILE="$GENDIR/thunderbirthday-$VERSION.xpi"
rm -f "$XPIFILE"

# Create XPI (02/05/2016 Dirk Busse - Added support for 7-Zip if normal 'zip' application fails.)
cd "$SRCDIR"
zip -r "$XPIFILE" . -x@"$ROOTDIR/.gitignore"
if [ $? -eq 0 ]
then
    # Using zip was successful.
    cd "$ROOTDIR"
    zip "$XPIFILE" README.md
else
    # Using zip failed.
    # Now check if 7-Zip exists.
    echo "Using zip failed. Now trying 7-Zip."
    if [ -f "/c/Programme/7-Zip/7z.exe" ]
    then
        "/c/Programme/7-Zip/7z.exe" a -tzip -r "$XPIFILE" .
        cd "$ROOTDIR"
        "/c/Programme/7-Zip/7z.exe" a -tzip "$XPIFILE" README.md
    elif [ -f "/c/Programme (x86)/7-Zip/7z.exe" ]
    then
        "/c/Programme (x86)/7-Zip/7z.exe" a -tzip -r "$XPIFILE" .
        cd "$ROOTDIR"
        "/c/Programme (x86)/7-Zip/7z.exe" a -tzip "$XPIFILE" README.md
    else
        echo "No zip application found. Exiting..."
        exit
    fi
fi

