CWD=`pwd`
BRANCH=gh-pages

# Clone Pages repository
cd /tmp
git clone $CIRCLE_REPOSITORY_URL dist

cd dist && git checkout -b $BRANCH origin/$BRANCH

cp -r $CWD/dist/* /tmp/dist

cd /tmp/dist

git config --global user.email "ross@rossta.net"
git config --global user.name "Ross Kaffenberger"

git add .

$HEAD = `git log --pretty="%h" -n1`
git commit -m "Site updated to $HEAD"

git push -f origin $BRANCH
