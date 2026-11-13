# Papi, sérieux ? — Épisode 5 : « La batterie » — traitement

35,5 s après l'opening (37 s en tout), 1080×1920, 24 images/s, style 1930s Rubber Hose Cartoon. Mêmes personnages, même cuisine, mêmes voix que les épisodes précédents.

## Brief

- Source : le prompt de l'épisode, qui fixe les huit plans, leurs durées, les sous-titres et le son. Le découpage n'était donc pas à choisir : je l'ai suivi.
- Dessins : `people.js` de l'épisode 3 (via l'épisode 4, qui n'y ajoute que la pose assise de Léo). Ajouts de cet épisode : l'icône de pile sur l'écran, l'écran éteint, la grande pile pleine.
- Voix : gardées comme dans les épisodes 1 à 4 (Papi = `fr-FR-HenriNeural`, Léo = `fr-FR-EloiseNeural`). Le prompt ne demande que musique et bruitages : une version sans voix est exportée à côté.
- L'opening `papi-serieux-opening.mp4` est collé au début par `add-opening.sh`.

## Ce qui restait à décider

1. **Le fil visuel** : la pile. Petite et vide sur l'écran (plans 1 et 5), grande et pleine au-dessus d'eux (plan 8), comme le cœur de l'épisode 3.
2. **La chaise** : visible dès le plan 1, vide, à côté de Papi ; c'est elle qu'il tapote au plan 6, et Léo s'y retrouve au plan 7.
3. **La musique qui « ralentit »** : le rag du début se détraque comme une boîte à musique quand la pile meurt (plan 5), puis le thème revient au piano seul, à demi-tempo, de plus en plus espacé.

## Plans et temps (120 bpm, coupes sur les temps)

| # | Temps (s) | Image | Voix / carton | Musique et bruitages |
|---|---|---|---|---|
| 1 | 0,0–3,5 | Léo déboule, la pile clignote sur l'écran ; Papi touille | « Papi ! J'ai plus que 2 % de batterie ! » | rag au piano ; pas de course, freinage |
| 2 | 3,5–7,5 | Papi touille sans lever les yeux, lent clignement | « Moi aussi. Depuis vingt ans. » | main gauche seule ; cuillère, woodblock |
| 3 | 7,5–11,5 | Léo secoue son téléphone | « Papi, sérieux ? Il est où, ton chargeur ? » | rag, clarinette |
| 4 | 11,5–18,5 | doigt levé ; silence ; petit sourire fier | « Dans mon temps… » puis « On se rechargeait avec une sieste. » | arrêt, woodblock ; trompette bouchée qui rit |
| 5 | 18,5–22,5 | gros plan : la pile clignote, l'écran s'éteint, fumée ; Léo baisse la tête | « Il est mort… » | bips, « pof », le rag se détraque, trombone triste |
| 6 | 22,5–26,5 | Papi tapote la chaise | « Assieds-toi. On se recharge. » | piano doux et lent |
| 7 | 26,5–31,5 | Léo contre l'épaule de Papi, yeux mi-clos ; téléphone éteint sur la table | « Papi… t'es à combien, là ? » | piano, plus lent |
| 8 | 31,5–35,5 | sourire ; la pile pleine apparaît ; iris sur eux deux | « Cent pour cent. » | xylophone sur la pile, accord final |

Silences : le doigt levé (13,1–14,5) et l'écran qui vient de s'éteindre (19,9–20,7).
