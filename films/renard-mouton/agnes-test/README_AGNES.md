# Agnes AI — Test de vraie animation du Renard

Ce test utilise le modèle actuel **`agnes-video-2.5-flash`**, pas l'ancien `agnes-video-v2.0`. Il est destiné à une seule scène de **6 secondes en 720P vertical 9:16**.

## Sécurité : la clé API

**Ne jamais copier la clé dans le dépôt, un script, une issue ou une commande affichée.**
Comme une clé a été partagée dans une conversation, révoquer cette ancienne clé et en créer une nouvelle avant de lancer les tests de production.

1. Dans ce dépôt GitHub, ouvrir **Settings > Secrets and variables > Actions**.
2. Cliquer sur **New repository secret**.
3. Nom du secret : `AGNES_API_KEY`. Valeur : la nouvelle clé Agnes AI.
4. Aller dans **Actions > Agnes AI - Test animation du Renard (6s)** et utiliser **Re-run all jobs** sur l'exécution initiale (ou déclencher un nouveau workflow, s'il est listé sur la branche par défaut).

Le workflow utilise `secrets.AGNES_API_KEY` uniquement en variable d'environnement; il ne l'affiche pas et ne la publie pas.

## Ce que le test doit faire

Référence : `films/renard-mouton/img/renard-2.png` dans la branche `ne-suis-pas-les-moutons`.

Actions demandées : vraie articulation de la mâchoire et des lèvres, mouvement du bras et de la main, rotation de la tête, clignements, respiration. **Aucun zoom sur une photo ne doit remplacer ces mouvements.**

Le test vérifie d'abord la *qualité du mouvement et la cohérence du personnage*. Il ne contient **pas** les nouveaux dialogues de l'épisode 02 et ne garantit **pas** de synchronisation labiale sur les voix existantes : cela nécessite de fournir un extrait vocal approprié en référence. Ne pas envoyer les MP3 personnels sur le dépôt public.

## Où retrouver le rendu

GitHub > **Actions** > exécution de ce workflow > **Artifacts** > `agnes-renard-test-6s`. L'archive contient `renard_mouvement_6s.mp4` si l'API a abouti, ainsi qu'un JSON de statut. Rien n'est ajouté aux autres séries.

## Contraintes

La promotion gratuite de Flash peut changer. Vérifier la tarification sur la plateforme Agnes avant de lancer une génération.
Le modèle peut modifier le visage et les vêtements; examiner la sortie avant de produire les 15 scènes.
