# Le Livre de Papy — note de passation (ChatGPT, Codex ou une nouvelle session Claude)

À lire **avant** de toucher à un épisode. Branche de travail : `le-livre-de-papy`. Règles de style : `films/LIVRE-DE-PAPY-DIRECTION-ARTISTIQUE.md`. Guide pas à pas : `films/LIVRE-DE-PAPY-NOUVEL-EPISODE.md`.

## Ce qui est en place (validé par l'auteur) — à garder, ne pas réécrire

### 1. Les artisans des scènes d'atelier — `films/papy-batch5/workshops.js`
Commun aux épisodes du lot (papier, montre, parapluie, clé, crayon). `prepare.py <slug>` le copie dans `films/papy-<slug>/`.
- `renderWorkshop()` fait **deux passes** : une passe invisible (`PASS='probe'`, dessinée dans un canevas caché via `setCtx`) trouve où vont les mains ; puis le **corps** de l'artisan est dessiné **derrière** l'établi (`body()`, tablier compris), la scène par-dessus, et les **bras + mains** (`arms()`) par-dessus l'outil.
- Dans une scène, appeler simplement `artisan(era, t, hx, hy)` avec la position de la main sur l'outil. **Ne pas** redessiner un bras avec des traits `L(...)` : c'est ce qui donnait des bras raides au bord de l'image.
- Bras : `ik()` choisit **toujours le coude le plus bas** (pose naturelle). Ne pas remettre de `bendDir`.
- Montre et clé (`TYPE==='watch'||'key'`) : une main tient une **pince d'horloger** qui va jusqu'à la pièce, l'autre bras reste **derrière** le mécanisme (sur l'établi). Les rouages doivent rester visibles.
- `B()` et `C()` dessinent avec reflet et ombre ; `vat()` et `sieve()` sont détaillés (douelles, cercles en fer, fibres, fils du tamis, gouttes).
- Dépend de : `people.js` (exporte `LOOK`, option `hideBackArm`), `toon.js` (exporte `setCtx`) — dans `films/papy-savon/` et `films/papy-batch5/`.

### 2. Plus de grésillements — `tools/foley.py`, `tools/mix.py`, `tools/score.py` (tous les dossiers `films/papy-*`)
- `bpsweep()` : bandes fixes fondues entre elles (plus de filtre recalculé par blocs, qui craquait).
- `portal_open()` : pas d'étincelles aléatoires.
- `page()` / `pagef()` / `zip_()` / `crackle()` : froissements doux, **aucun bruit haché au hasard**.
- `score.py` : bloc « no fizz » — percussions bruitées adoucies et filtrées (≈ 4,2 kHz), le reste filtré à 7 kHz, niveau final ×0,67 pour garder le même volume.
- **Interdit** : réintroduire du bruit blanc découpé aléatoirement (`rng.random(...) > x`), des charlestons/shakers non filtrés, ou un filtrage par blocs.
- Contrôle : au-dessus de 6 kHz la musique doit rester vers −70 dB (médiane) ; vidéo finale à −14 LUFS.

### 3. Personnages principaux (lunettes et suivants) — `chars.js`
Mains à vrais doigts, moustache de Papy qui bouge quand il parle, rides, cils et joues, ombres au sol, gestes en parlant, chapeau d'époque pour Papy, Malik qui essaie l'objet. Voir la direction artistique.

## Fabriquer un épisode du lot (vertical 9:16, deux voix)
```sh
bash films/papy-batch5/build-vertical.sh <slug>     # papier | montre | parapluie | cle | crayon
```
Ou à la main : `python films/papy-batch5/prepare.py <slug>` puis les étapes du guide (voix → events → score → mix → video → mux).
Les polices `.woff2` ne sont pas dans Git : `tools/fonts.sh` les télécharge.

## Règles de collaboration
- Travailler sur `le-livre-de-papy`, faire `git pull --rebase` avant de pousser ; ne jamais forcer (`--force`).
- Ne pas mettre de MP4 ni d'audio dans Git (trop lourds) ; seulement le code, les textes, les sources.
- Une modification commune (workshops.js, people.js, outils audio) touche **tous** les épisodes : vérifier au moins une image par époque et une mesure audio avant de pousser.
