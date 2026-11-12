# Papi & Léo — série en cartoon 1930

Épisode 1 : « L'IA » (30 s, 1080×1920, style `rubber-hose`). Ce dossier garde les personnages et le décor pour les épisodes suivants.

## Pour un nouvel épisode

Copie ce dossier en `films/papi-leo-epN/`, puis réécris l'histoire. À garder tels quels pour que les personnages restent identiques :

- `people.js` : Papi Gaston (`papi(p)`) et Léo (`leo(p)`), la poêle et la crêpe. Les paramètres de pose sont décrits en tête de chaque fonction.
- `kitchen.js` : la cuisine de Papi (décor peint + objets qui respirent sur le tempo).
- `toon.js`, `parts.js`, `film.js` : encre, gants, yeux, pellicule (fenêtre 2:3 verticale).
- `model-sheet.jpg` : la planche des personnages (`index.html?mode=sheet`).

À réécrire pour chaque épisode : `lines.json` (répliques), `story.js` (temps, cartons, plans), `scenes.js` (jeu et caméras), `music/score.py`, `mix.py`, `TREATMENT.md`.

## Voix

- Papi : `fr-FR-HenriNeural`, rate −4 à −10 %, pitch −12 Hz. Léo : `fr-FR-EloiseNeural`.
- Service en ligne (edge-tts) : il faut l'hôte `speech.platform.bing.com` (environnement cloud « lemo-opuscar »), et derrière un proxy `wss_proxy=$HTTPS_PROXY`.

## Construire

`sh build.sh` refait tout (polices, voix, image, musique, mixage, MP4). Il faut ffmpeg 7 ou plus.
Les polices (`tools/fonts.sh`), les voix (`voice/`), les rendus (`out/`) et le MP4 ne sont pas dans git : ils sont régénérés.
