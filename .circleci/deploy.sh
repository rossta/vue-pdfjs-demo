#!/usr/bin/env bash

CWD=`pwd`
BRANCH=gh-pages

# Clone Pages repository
cd /tmp
git clone $CIRCLE_REPOSITORY_URL dist

cd dist && git checkout -b $BRANCH origin/$BRANCH

git rm -rf .

cp -r $CWD/dist/* /tmp/dist
cp -r $CWD/.circleci /tmp/dist

cd /tmp/dist

git config --global user.email "circleci@circleci.com"
git config --global user.name "CircleCI"

git add .

git commit -m "Site updated to $(git log --pretty="%h" -n1)"

git push -f origin $BRANCH
