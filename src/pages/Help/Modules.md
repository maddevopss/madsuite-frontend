# Modules & Abonnements – Guide d'utilisation

## Vue d'ensemble
Cette page explique comment **gérer les modules payants** de MADSuite depuis l'interface *Modules & Abonnement*.

### Types de modules
| Catégorie | Description | Inclus dans quel plan | Prix (CAD) |
|-----------|-------------|----------------------|-----------|
| **Gratuit** | Tableau de bord, feuilles de temps, clients, projets | Toujours actif | 0 |
| **Pro** | Factures, rapports, kiosque punch | Plan **Pro** (20 $/mois) | 0 |
| **Add‑on** | Calcul KM/GPS, kiosque KM, soumissions, Activity Intelligence, Billing Assistant | Achat à la carte | Variable (voir colonne *Prix*) |

## Activation / désactivation
- **Activer / désactiver** un module → cochez la case **Activé** dans la liste.
- Pour un add‑on, cliquez sur **Acheter**. Cela crée une *Stripe Checkout Session* et, après paiement, le module devient actif.
- La désactivation ne supprime pas les données existantes ; elles restent en lecture‑seule.

## Prix dynamiques
Les prix sont stockés dans la table **`module_pricing`** et récupérés via l’API **`GET /api/organisation/modules`**. Ainsi, les modifications de tarif ne nécessitent aucun déploiement.

## Processus de paiement (Stripe Checkout)
1. Le front‑end envoie `POST /api/organisation/modules/:key/checkout`.
2. Le backend crée une session Stripe avec le `module_key` et l’`organisation_id`.
3. Le client est redirigé vers la page de paiement Stripe.
4. Après succès, le backend active le module et stocke `stripe_subscription_item_id`.

## FAQ rapide
- **Que se passe‑t‑il si le paiement échoue ?** Le webhook Stripe désactive le module et la page indique l’erreur.
- **Puis‑je changer de plan ?** Oui, le bouton *Changer de plan* dans les paramètres d’organisation met à jour `plan_type` et active/désactive automatiquement les modules associés.
- **Pourquoi voir des prix en $/mois alors que mon plan est gratuit ?** Les add‑ons affichent leurs tarifs même si l’organisation n’a pas encore acheté le module.

---
*Ce guide est destiné aux administrateurs d’organisation et aux utilisateurs qui souhaitent comprendre le modèle de tarification et la gestion des modules.*
