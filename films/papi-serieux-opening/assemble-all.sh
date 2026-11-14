#!/bin/sh
# Every episode so far, assembled as opening + title card + episode + outro. Add a line to title() and q() for each new episode.
set -e
cd "$(dirname "$0")/../.."; O=films/papi-serieux-opening
title() { case $1 in 1) echo "L’IA";; 2) echo "Le GPS";; 3) echo "Les likes";; 4) echo "Le Wi-Fi";; 5) echo "La batterie";; 6) echo "Les émojis";; 7) echo "Le mot de passe";; 8) echo "Les vocaux";; esac; }
q() { case $1 in 1) echo "Demain : Papi contre le GPS";; 2) echo "Demain : Papi contre les likes";; 3) echo "Demain : Papi contre le Wi-Fi";; 4) echo "Demain : Papi contre la batterie";; 5) echo "Demain : Papi contre les émojis";; 6) echo "Demain : Papi contre le mot de passe";; 7) echo "Demain : Papi contre les vocaux";; 8) echo "Demain : Papi contre le selfie";; esac; }
for n in ${*:-1 2 3 4 5 6 7 8}; do
  if [ "$n" -le 4 ]; then
    sh $O/assemble.sh films/papi-leo-ep$n/papi-leo-ep$n.mp4 "$(q $n)" films/papi-leo-ep$n/papi-serieux-ep$n.mp4 $n "$(title $n)"
  else
    E=films/papi-serieux-ep$n
    sh $O/assemble.sh $E/out/episode.mp4 "$(q $n)" $E/papi-serieux-ep$n.mp4 $n "$(title $n)"
    sh $O/assemble.sh $E/out/episode-sans-voix.mp4 "$(q $n)" $E/papi-serieux-ep$n-sans-voix.mp4 $n "$(title $n)"
    rm -f $E/papi-serieux-ep$n-sans-voix.srt
  fi
done
echo FINISHED
