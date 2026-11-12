# « Papi, sérieux ? » — opening de la série (1,5 s)

1080×1920, 24 images/s, 36 images. Un médaillon façon carton-titre des années 1930 : iris, Papi et Léo qui font coucou, le titre en arc, une fioriture de piano ragtime avec craquement de vinyle.

- `people.js`, `toon.js`, `parts.js`, `film.js` : copiés de `films/papi-leo-ep3/` sans modification (mêmes dessins, même pellicule).
- `main.js` : le médaillon, les rayons, l'animation, le titre (police des sous-titres, IM Fell English SC).
- `sound.py` : le piano (échantillons de piano droit) et le vinyle. Pas de voix.
- `sh build.sh` : refait `papi-serieux-opening.mp4`.

## L'ajouter au début d'un épisode, en une ligne

```sh
sh films/papi-serieux-opening/add-opening.sh films/papi-leo-ep5/papi-leo-ep5.mp4
```

Le résultat est écrit à côté, sous le nom `papi-leo-ep5-opening.mp4` (ou le nom donné en deuxième argument). Si un `.srt` du même nom existe, une copie décalée de 1,5 s est écrite aussi.
Dans le `build.sh` d'un épisode, c'est la même ligne à la fin, avec `"$HERE/../papi-serieux-opening/add-opening.sh"`.

## La carte-titre d'un épisode, en une ligne

```sh
sh films/papi-serieux-opening/make-card.sh 5 "Le titre"
```

Écrit `cards/papi-serieux-ep5.jpg` (1080×1920) : le médaillon, « Épisode 5 », « Aujourd'hui », puis le titre. Une copie nommée `carte-titre.jpg` est mise dans `films/papi-leo-ep5/` si ce dossier existe.
Un troisième argument remplace le mot « Aujourd'hui ».
