# Papi, sérieux ? — règles de la série

Valent pour tous les épisodes, à partir de la version 2 (épisodes 4 à 10 réexportés en `papi-serieux-epN-v2.mp4`).

## Format

- 1080 × 1920, 24 images par seconde, noir et blanc sépia du style `rubber-hose` (grain, rayures, vignette, coins arrondis).
- Personnages, cuisine et voix de l'épisode 3 (`people.js`, `kitchen.js`), jamais redessinés.

## Déroulé d'un épisode

1. **L'accroche** (le plan 1, avec sa réplique) à 0 seconde, avant l'opening.
2. **L'opening** `papi-serieux-opening.mp4` (1,5 s).
3. **Le reste de l'épisode**, dans l'ordre des plans. Pas de carton de titre.
4. **L'outro** (3 s), collée juste après la fermeture en iris de l'épisode, sans écran noir entre les deux.

Un seul outil fait tout : `sh films/papi-serieux-opening/assemble-v2.sh <dossier de l'épisode> <fin de l'accroche, s> "<question de demain>" <sortie.mp4>`.

## Sous-titres

- Cartouches d'époque (plaque noire, double filet, police IM Fell English SC), plus hauts et plus grands qu'en version 1 : centre à 1340 px, corps 64 px, réduit seulement si une ligne dépasse le cadre. Deux lignes au plus.
- « Dans mon temps… » : toujours deux cartouches à la suite, avec une pause entre les deux, Papi doigt levé.

## L'outro (3 s)

Composant `make-outro.sh "<question>" <sortie.mp4> "<question au spectateur>" "<texte d'abonnement>"`, exporté seul en `papi-serieux-outro.mp4`.

| Temps | Ce qu'on voit |
|---|---|
| 0,0–1,2 s | Le médaillon (Papi et Léo qui font coucou), la question de l'épisode, puis « Et ton papi, il dit quoi, lui ? » |
| 1,2–2,5 s | Papi sort le bras du cercle et pointe du doigt vers le bouton S'abonner de TikTok (à droite, à hauteur de la photo de profil, vers 55 % de la hauteur). Une flèche dessinée à la main part de son doigt vers ce point. Le cartouche remplace le titre au-dessus du cercle : « Abonne-toi, petit. Dans mon temps, on disait : reviens demain. » |
| 2,5–3,0 s | Léo fait un clin d'œil à la caméra, puis fermeture en iris sur lui. |

- La question, la question au spectateur et le texte d'abonnement sont des paramètres.
- Zone réservée aux boutons TikTok : x ≥ 940 px entre 820 et 1600 px de haut. Rien n'y entre : la flèche s'arrête à x = 905 px, le cartouche est en haut du cadre.

## Son

Ragtime léger jusqu'au tournant, puis piano doux et lent jusqu'à la fin. Bruitages de matière (bois, porcelaine, papier, caoutchouc). Voix Henri (Papi) et Éloïse (Léo).

## Export

Un MP4 par épisode, `papi-serieux-epN.mp4` (version 2 : `papi-serieux-epN-v2.mp4`, sans écraser l'original), avec son fichier `.srt`.
Avant de finir un épisode : quatre images au moins (l'accroche, l'opening, un sous-titre, l'outro) pour vérifier que les personnages sont ceux de l'épisode 3 et que chaque sous-titre est lisible et sans faute.
