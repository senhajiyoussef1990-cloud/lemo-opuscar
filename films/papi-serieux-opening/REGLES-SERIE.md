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

## Mains et doigts — règle de production obligatoire dès l'épisode 8 corrigé

- Les gants de Gaston et Léo montrent **quatre doigts (index, majeur, annulaire, auriculaire) et un pouce distinct**. Les phalanges repliées doivent rester lisibles.
- Quand un personnage lève l'index, le doigt levé se situe **du côté du pouce** ; les trois autres doigts sont repliés, séparés par des traits de contour. Le résultat ne doit jamais donner l'impression d'un majeur levé.
- Les gestes « open », « point », « grab », « thumb » et « fist » utilisent la fonction `glove()` corrigée du fichier `parts.js`. Pour de nouveaux épisodes, recopier ce fichier depuis l'épisode 11 (ou une version ultérieure corrigée), jamais depuis un épisode ancien non corrigé.
- Vérifier visuellement les mains au moins une fois dans **chaque posture** utilisée (doigt levé, salut, objet tenu, main ouverte), particulièrement en gros plan, et conserver le même style noir et blanc.
- Ne pas modifier les voix Henri/Éloïse, le visage des personnages, la cuisine, l'accroche, le générique ou l'outro lorsque seules les mains sont en correction.

## Story d'annonce — modèle obligatoire pour tous les prochains épisodes

Chaque épisode est livré avec **une affiche Story 9:16 unique** fondée sur le visuel de référence fourni pour l'épisode 7 et les affiches approuvées des épisodes 8, 9 et 10. La Story est un **visuel illustré**, pas une simple carte-titre, et son intrigue doit correspondre au sujet de l'épisode.

- Univers : dessin animé « Papi, sérieux ? », Gaston et Léo reconnaissables, animation rétro américaine des années 1930, noir et blanc avec dominante sépia/crème, bordure ornementale noire/crème et cuisine cohérente.
- Texte clairement lisible, en français : « ÉPISODE N », « Papi découvre [sujet] », puis « Disponible aujourd’hui à 18h ». Respecter la vraie numérotation de l'épisode.
- Illustration principale : Gaston et Léo dans une situation liée exactement à l'épisode (téléphone, pizza, selfie, notifications, etc.). Les mains ont cinq doigts lisibles, avec index correctement identifié.
- Numéro N également visible dans un médaillon ou sur un emblème en bas ; composition verticale 1080 × 1920 et typographie avec forte lisibilité mobile.
- Exporter **STORY_EPN.jpg** (JPEG haute qualité) et **STORY_EPN.png** dans le ZIP final, à côté du MP4, du SRT et de PUBLICATIONS-RESEAUX.md. Vérifier l'image réelle avant publication ; une carte générique provisoire ne satisfait pas cette règle.
- Générer la Story adaptée au scénario de chaque nouvel épisode et enregistrer une copie dans le dossier de l'épisode avant de créer le ZIP.

## Opening de chaque vidéo — règle obligatoire

Conserver l'accroche initiale puis le générique original ; **l'opening doit afficher explicitement « ÉPISODE N — [titre réel de l'épisode] »**, lisible à l'écran. Ne pas se contenter du nom de la série. Ensuite viennent le corps de l'épisode, la conclusion, l'annonce « Demain — Épisode N+1 : [titre] », et la formule « À demain ». Toujours contrôler la version exportée après le montage.

## Dates de publication dans les noms de dossiers — calendrier quotidien

- **Épisode 12 : dimanche 22 novembre 2026 à 18 h (Europe/Brussels)**. Un épisode supplémentaire chaque jour. Épisode 50 : mercredi 30 décembre 2026 à 18 h.
- Tous les nouveaux dossiers et ZIP des épisodes 12 à 50 sont nommés selon **`AAAA-MM-JJ_EPnn_Sujet-court`**. Exemple : `2026-11-22_EP12_QR-codes`, puis `2026-11-23_EP13_Cloud`.
- Inscrire aussi la date de publication dans `PUBLICATIONS-RESEAUX.md`, `LISEZ-MOI.txt` et le calendrier de publication.
- Le calendrier complet, avec la date et le nom exact de **chaque** dossier, se trouve dans `films/papi-serieux-planning/CALENDRIER-EP12-50.md`.
- Pour produire automatiquement un nom cohérent, utiliser `python films/papi-serieux-opening/tools/nom-date-publication.py 12 QR-codes --zip`.
- Ne pas rétro-dater les épisodes 1–11. Ne pas annoncer une vidéo comme prête ni programmée simplement parce qu'un dossier daté existe.
