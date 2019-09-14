#!/bin/bash

#
# Packages the ThunderBirthDay add-on in a xpi-file.
# Entries from .gitignore are ignored.
#
# Usage: ./make.sh
#

ROOTDIR="$(pushd `dirname $0` > /dev/null; pwd; popd > /dev/null)"
SRCDIR="$ROOTDIR/src"

# Find version
VERSION=$(grep '"version":' src/manifest.json | sed 's/.*: "\([^"]*\)".*/\1/')
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

# Create XPI
cd "$SRCDIR"
zip -r "$XPIFILE" . -x@"$ROOTDIR/.gitignore"

cd "$ROOTDIR"
zip "$XPIFILE" README.md
