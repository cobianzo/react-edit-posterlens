if [ -z "$1" ]
  then
    echo "No commit id supplied\nUse sh revertto \"0d1d7fc32\" "
    exit 1
fi

# This will detach your HEAD, that is, leave you with no branch checked out:
echo "Make sure you don't have changes in your db that want to keep. Comming back to $1..."
git checkout $1
