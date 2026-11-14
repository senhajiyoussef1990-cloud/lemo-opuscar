# Outros of episodes 1 to 6 (each announces the next episode), then episodes 1 to 5 assembled with opening and outro.
set -e
cd "$(dirname "$0")/../.."; O=films/papi-serieux-opening; mkdir -p $O/outros
q() { case $1 in 1) echo "Demain : Papi contre le GPS";; 2) echo "Demain : Papi contre les likes";; 3) echo "Demain : Papi contre le Wi-Fi";; 4) echo "Demain : Papi contre la batterie";; 5) echo "Demain : Papi contre les émojis";; 6) echo "Demain : Papi contre le mot de passe";; esac; }
for n in 1 2 3 4 5 6; do sh $O/make-outro.sh "$(q $n)" $O/outros/outro-ep$n.mp4; done
for n in 1 2 3 4; do sh $O/assemble.sh films/papi-leo-ep$n/papi-leo-ep$n.mp4 "$(q $n)" films/papi-leo-ep$n/papi-serieux-ep$n.mp4; done
sh $O/assemble.sh films/papi-serieux-ep5/out/episode.mp4 "$(q 5)" films/papi-serieux-ep5/papi-serieux-ep5.mp4
sh $O/assemble.sh films/papi-serieux-ep5/out/episode-sans-voix.mp4 "$(q 5)" films/papi-serieux-ep5/papi-serieux-ep5-sans-voix.mp4
echo FINISHED
