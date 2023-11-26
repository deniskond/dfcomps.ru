#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

TARGET_DIR=$(realpath $1)
echo $TARGET_DIR
mkdir -p $TARGET_DIR

cd $TARGET_DIR
# cp $SCRIPT_DIR/defrag.rar ./defrag.rar
# curl  https://dfcomps.ru/uploads/files/defrag.rar -o ./defrag.rar
# unrar x defrag.rar
rm defrag.rar

cd defrag/
cp $SCRIPT_DIR/server.cfg ./defrag/
cp $SCRIPT_DIR/requirements.txt ./
cp $SCRIPT_DIR/quakerunner.py ./

# sudo apt install python3 python3-pip python3-venv ioquake3
python3 -m venv .py3
source .py3/bin/activate
python3 -m pip install -U pip
pwd
ls .

python3 -m pip install -r requirements.txt
cp /usr/lib/ioquake3/ioq3ded ./

REPORT_HOST=http://127.0.0.1:4006 \
GAME_PATH=$(pwd) \
python3 quakerunner.py