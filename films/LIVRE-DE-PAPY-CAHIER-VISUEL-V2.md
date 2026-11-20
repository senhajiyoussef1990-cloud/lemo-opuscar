# Le Livre de Papy — cahier des règles visuelles V2
*Standard pour les NOUVEAUX épisodes à partir du 20 novembre 2026. Ne pas modifier les MP4 déjà validés sans demande expresse.*

Ce document complète `films/LIVRE-DE-PAPY-DIRECTION-ARTISTIQUE.md`. Il précise les améliorations souhaitées après visionnage des épisodes du lot papier, montre, parapluie, clé et crayon. L'objectif est une animation 2D « Sci-Fi Sitcom Toon » plus naturelle, **sans changer les visages, vêtements, voix ni l'identité graphique de la série**.

## 1. Ce qu'on GARDE absolument

- **Papy** : chauve avec couronne de cheveux blancs, grosse moustache blanche expressive, blouse blanche, pull moutarde, pantalon prune ; personnage et silhouette constants.
- **Malik** : cheveux bruns bouclés, sweat bleu roi, jean et baskets blanches ; visage et proportions constants.
- Le salon, le livre magique, le vortex cyan/violet, le retour à la maison, l'humour entre Papy et Malik, les sept époques et les explications documentées.
- Les **ateliers en deux passes** de Claude dans `films/papy-batch5/workshops.js` : le corps derrière l'établi, les outils devant, puis les bras et les mains correctement superposés ; mains basées sur `chars.js`, costumes d'époque de `people.js`. Ne pas revenir aux anciens bras tracés avec de simples traits.
- La synchronisation de l'action à la réplique (pas de gestes automatiques répétitifs pendant toute l'époque), les matériaux détaillés, les ombres et reflets modérés.
- Les voix Papy/Fabrice et Malik/Éloïse, la musique et les bruitages **sans grésillements** ; un seul master vidéo **1080 × 1920, 9:16**, narré, pour TikTok / Reels / Shorts / Facebook.
- Le ZIP d'un épisode comprend la vidéo verticale avec deux voix, une Story yeux ouverts, les publications, le scénario, les sources, la timeline et les diagnostics son.

## 2. Ce qu'on CORRIGE : la nouvelle qualité des personnages

### A. Artisans et ouvriers : bras enfin proportionnés

**Défaut observé :** le corps est solide, mais les bras paraissent trop fins, parfois étirés ou déformés, comme ajoutés après coup.

**Cible :** des membres épais, souples et anatomiquement crédibles **dans le style cartoon existant**. Les mesures ci-dessous sont des repères visuels à ajuster au personnage, pas des nombres à recopier aveuglément dans `noodle()` :

- **Épaules** attachées au volume du torse, à la bonne hauteur ; manches qui naissent de l'épaule, sans espace apparent.
- **Bras supérieur** : épaisseur visible de l'ordre de **26–35 % de la largeur du torse** sur un plan d'atelier. L'avant-bras est légèrement plus fin (environ **22–30 %**), le poignet s'affine encore. Les manches amples doivent rester cohérentes avec le costume d'époque.
- **Deux segments distincts**, épaule → coude et coude → poignet ; continuité de silhouette à l'articulation, **pas de coude pointu ni d'avant-bras en ficelle**.
- **Longueur cohérente** avec le buste, le coude et l'outil. Si la cible est trop loin, rapprocher le personnage, déplacer l'outil ou incliner le buste : **ne jamais allonger le bras pour compenser**.
- **Coudes naturels** : conserver la résolution articulée (`ik()`) créée par Claude, mais contrôler la pose selon l'action (dessiner, marteler, soulever, presser, tourner). Le coude « le plus bas » est un bon départ, pas une raison de laisser une pose impossible.
- **Épaisseur constante en mouvement** et transitions propres aux articulations ; pas d'effet élastique, torsion, rupture ou changement brusque de largeur.
- Une vraie action de travail implique parfois **épaule, buste et regard** : petite inclinaison du corps ou flexion du coude, toujours compatible avec la pose.

**Approche de code :** adapter les silhouettes de `arms()` dans `films/papy-batch5/workshops.js`, en les reliant à la largeur et à l'échelle du corps calculées dans `people.js`. Préserver les deux passes `PASS='probe'` puis dessin. Utiliser `artisan(era,t,hx,hy)` pour les points de contact ; garder un seul bras par épaule.

### B. Mains et doigts de Papy, Malik et des figurants

- **Cinq doigts anatomiques par main (quatre doigts + un pouce)**, avec contour et proportions adaptés au style 2D ; tous doivent exister dans le modèle, même lorsque certains sont cachés par une prise.
- Main ouverte : doigts discernables à l'écran d'un téléphone ; main fermée : doigts enroulés autour de l'objet, avec **pouce opposé**, sans compter artificiellement cinq doigts tous visibles sous le même angle.
- Pas de mains « moufles », de doigts fusionnés, surnuméraires ou absents ; **l'index doit se distinguer nettement du majeur** lorsque le personnage pointe quelque chose.
- Taille de la main proportionnée à l'avant-bras, poignet raccordé, orientation cohérente avec l'objet. Mains symétriques lorsque les poses sont symétriques.
- Papy parle avec un geste expressif de sa main libre ; Malik fait une réaction différente et adaptée à sa réplique, sans rester figé.
- Travailler d'abord les routines communes `hand()` et la prise d'objet dans `chars.js`, sans modifier les traits identitaires des personnages.

### C. Malik doit tenir et manipuler l'objet

**Règle obligatoire pour chaque nouvel épisode :** l'objet du jour apparaît **dans la main de Malik** dans une scène du salon au début, puis au retour ; il doit aussi le manipuler à un moment utile du récit lorsqu'il est présent avec Papy.

- La main **touche et saisit réellement** l'objet ; pas d'objet flottant à côté de la paume.
- La taille et la manière de saisir suivent l'objet : crayon entre doigts, clé par l'anneau, montre dans la paume ou au poignet, feuille tenue par un coin, manche de parapluie agrippé.
- L'objet ne recouvre ni le visage, ni les yeux, ni les sous-titres. Il reste visible pendant la réaction.
- Papy tient, montre ou désigne **la version de l'époque** lorsque c'est pertinent, sans cacher le mécanisme ; éviter les apparitions simultanées incohérentes d'un même objet.
- Sur les plans d'entrée/sortie du vortex, choisir une transition volontaire et cohérente de l'accessoire plutôt que le faire apparaître/disparaître accidentellement.

## Nouvelle règle obligatoire : objet complet + mécanisme + résultat (21 novembre 2026)

**Défaut révélé par la fermeture éclair V2 :** montrer uniquement la fermeture, les dents ou le curseur alors que la narration parle d'un sac, d'une botte ou d'un vêtement. Une mécanique correcte hors contexte est **une erreur de mise en scène**.

Pour chaque époque, faire correspondre l'image aux noms concrets prononcés dans les répliques. La séquence visuelle doit comprendre :

1. **Objet entier** : sac, botte, chaussure, veste ou autre support du mécanisme, immédiatement reconnaissable.
2. **Action technique** : la main et l'outil agissent sur **cet objet**, au niveau du mécanisme intégré, avec un point de contact réel.
3. **Résultat final** : l'objet complet est fermé, cousu, réparé ou transformé ; le spectateur voit ce qui a changé.

**Cas particulier du salon :** si Malik dit « mon sac est coincé » ou « mon sac se fait aspirer », représenter **son vrai sac complet**, sa tirette et le blocage ; dans les plans finaux, Malik tient encore son sac et le referme. Une glissière toute seule dans sa main ne convient pas.

**Exemple fermeture éclair :** avant 1851 = botte à lacets ; 1851 = panneau de vêtement avec attaches expérimentales ; 1893 = chaussure ou bottine avec crochets ; 1913 = veste avec rangées de dents ; 1917 = fermeture montée sur un vêtement en atelier ; 1923 = botte en caoutchouc avec zip latéral ; époque actuelle = sac et veste avec fermeture intégrée.

**Règle de recette :** images de contrôle obligatoires en plan large, plan du geste, plan du résultat ; refuser une scène si l'objet entier n'est identifiable à aucun moment. Éviter les objets isolés flottants. Ne pas modifier les anciens épisodes sans demande.

## 3. Contact physique et mise en scène

- **Point de contact exact** : main ↔ poignée, outil ↔ matière, pointe du crayon ↔ feuille, lime ↔ métal, clé ↔ serrure, tamis ↔ cuve ; le résultat de l'action doit être visible.
- Un geste simple et lisible par réplique : **préparation → manipulation → changement de la matière → résultat**. Ne pas boucler le mouvement dans les plans où l'artisan a fini son travail.
- Établir une direction de regard vers l'ouvrage ; afficher suffisamment le buste pour comprendre qui travaille.
- Pas de bras ni de main qui traversent l'établi, le torse, l'outil ou l'objet ; des ombres de contact discrètes renforcent la profondeur.
- Respecter les métiers et outils d'époque ; un même plan doit montrer la matière première et le processus réellement raconté.
- Les gros plans montrent clairement le mécanisme, les doigts qui agissent et un début/une fin d'action ; cadrage assez large pour ne pas couper les articulations essentielles.

## 4. Bande des époques (version plus lisible)

- **Un seul ruban horizontal sur toute la largeur, collé au bord supérieur**, en remplaçant la version 100 px jugée trop fine.
- **Hauteur cible : 128 px sur une image 1080 × 1920**, avec plage acceptable 120–135 px selon la lisibilité.
- Deux lignes hiérarchisées : **ligne 1 = lieu + époque/date (gras, prioritaire)** ; **ligne 2 = courte description** ; pas de troisième ligne. Éviter les phrases longues, réduire intelligemment la police sans tomber dans l'illisible.
- Fond opaque assez contrasté (ex. brun/violet profond + texte crème et accent doré), mince filet inférieur ; pas de plaque volante ni de marge inutile.
- Apparition douce et maintien pendant l'époque, sauf transitions ; garder les têtes et les mains sous le bandeau, et les sous-titres dans leur zone habituelle.
- Un test sur vraie capture **1080 × 1920 affichée à taille de téléphone** doit confirmer que la date est lisible d'un coup d'œil.

## 5. Décors, lumière, mouvement et rythme

- Établissement de l'époque visible en plan large : architecture pertinente, costumes, outils, matières et objets secondaires historiquement cohérents.
- Les établis ont volume, pieds lisibles, surface de travail et ombre ; **ne pas les remplir d'accessoires qui masquent le geste**.
- Lumière cohérente et douce, contrastes sur les personnages, ombres au sol et ombres de contact ; éviter scintillement et changements de luminosité non narratifs.
- Panoramique léger à l'entrée de chaque époque ; coupe sur le **geste important** et retour à Papy/Malik quand ils réagissent.
- Les visages restent identiques et expressifs. Papy ne garde pas les yeux fermés sur les Stories. Malik ne reste pas inerte pendant qu'il parle.

## 6. Ce qu'on INTERDIT

- Bras maigres, coudes à l'envers, bras qui s'étirent d'une taille à l'autre, main détachée, épaule flottante, bras supplémentaire.
- Main façon moufle, doigt manquant ou en trop, majeur levé visuellement à la place de l'index.
- Artisans dessinés en surimpression devant leur propre établi lorsque le corps devrait rester derrière ; outil caché par le personnage.
- Gestes répétitifs sans cause, outils flottants, contact manqué, objets qui changent de taille ou de main entre deux plans.
- Réutilisation automatique des mêmes gestes pour des métiers ou inventions différents.
- Date illisible ou ruban trop mince, cartouche épais descendant au milieu de l'image, bande historique sur le visage.
- Décor anachronique, élément qui traverse un autre, personnage coupé inutilement au bord, Story avec yeux fermés.
- Musique/grésillements parasites, vidéo sans les deux voix, export horizontal 16:9 non demandé.

## 7. Contrôle qualité VISUEL obligatoire avant toute livraison

Pour chaque nouvel épisode, vérifier les **sept époques**, à **trois instants par époque** (début, action, fin) = **21 images de contrôle**, plus au moins :
1. scène d'ouverture au salon : objet saisi par Malik, doigts et regard ;
2. interaction historique : Papy et Malik, relation à l'objet ;
3. retour au salon : objet toujours tenu ou remis clairement ;
4. Story finale : deux personnages yeux ouverts, texte et titre lisibles.

Inspecter les images **en grand** puis à **taille smartphone**. Rejeter et corriger une époque si un seul des éléments suivants échoue : proportion bras/torse, coude et poignet, doigts, contact main/outil, visibilité de l'objet, ruban lisible, cadrage et absence de déformation. Vérifier des images consécutives lorsque l'articulation est en mouvement afin d'exclure les sauts. Les contrôles automatiques du code ou de l'audio ne prouvent pas à eux seuls que l'anatomie est correcte.

## 8. Points d'intégration du dépôt

| Élément | Fichiers de référence | Action |
| --- | --- | --- |
| Corps, bras articulés, établis | `films/papy-batch5/workshops.js`, `people.js` | Épaissir et raccorder les bras ; conserver les deux passes de Claude |
| Mains Papy/Malik | `films/papy-savon/chars.js` et bases `chars.js` des nouveaux épisodes | Doigts et prises réelles ; ne pas changer leurs visages |
| Objet de Malik | `films/papy-batch5/prepare.py`, `objects.js`, `main.js` généré | Accroche dans la main + continuité visuelle salon/retour |
| Bande supérieure | `films/papy-batch5/prepare.py` (fonction `tag(t)` générée) | Passer de 100 à environ 128 px ; renforcer typographie |
| Production | `films/papy-batch5/build-vertical.sh` | Un seul MP4 9:16 avec deux voix ; contrôles et ZIP |

**Important :** ce cahier est une **spécification de création**. Son ajout au dépôt ne signifie pas que ces corrections sont déjà appliquées dans le moteur vidéo. Pour le prochain épisode, adapter le code, capturer et inspecter les images de contrôle, puis produire le ZIP ; préserver les anciens MP4 en l'absence de demande de refonte.
