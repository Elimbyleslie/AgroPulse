-- CreateTable
CREATE TABLE `utilisateurs` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mot_de_passe` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PROPRIETAIRE', 'VETERINAIRE', 'EMPLOYE') NOT NULL DEFAULT 'EMPLOYE',
    `telephone` VARCHAR(191) NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` ENUM('ACTIF', 'INACTIF', 'SUSPENDU') NOT NULL DEFAULT 'ACTIF',

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fermes` (
    `id_ferme` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NULL,
    `proprietaire_id` INTEGER NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_ferme`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lots` (
    `id_lot` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `espece` VARCHAR(191) NULL,
    `categorie` VARCHAR(191) NULL,
    `tranche_age` VARCHAR(191) NULL,
    `quantite` INTEGER NULL,
    `date_entree` DATETIME(3) NULL,
    `statut` VARCHAR(191) NULL DEFAULT 'Actif',

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animaux` (
    `id_animal` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `lot_id` INTEGER NULL,
    `numero_identification` VARCHAR(191) NULL,
    `espece` VARCHAR(191) NOT NULL,
    `race` VARCHAR(191) NULL,
    `sexe` VARCHAR(191) NULL,
    `date_naissance` DATETIME(3) NULL,
    `poids_actuel` DOUBLE NULL,
    `statut` ENUM('ACTIF', 'VENDU', 'MORT', 'ABATTU', 'MALADE', 'EN_GESTATION') NOT NULL DEFAULT 'ACTIF',
    `mere_id` INTEGER NULL,
    `pere_id` INTEGER NULL,

    UNIQUE INDEX `animaux_numero_identification_key`(`numero_identification`),
    PRIMARY KEY (`id_animal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sante` (
    `id_sante` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `diagnostic` VARCHAR(191) NULL,
    `traitement` VARCHAR(191) NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'en_cours',
    `veterinaire_id` INTEGER NULL,
    `cout` DOUBLE NULL,

    PRIMARY KEY (`id_sante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reproduction` (
    `id_reproduction` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `male_id` INTEGER NULL,
    `type_reproduction` VARCHAR(191) NOT NULL,
    `date_saillie` DATETIME(3) NULL,
    `date_diagnostic` DATETIME(3) NULL,
    `date_velage_prevu` DATETIME(3) NULL,
    `date_velage_reel` DATETIME(3) NULL,
    `statut` ENUM('EN_CHALEUR', 'INSEMINATION', 'GESTATION', 'VELAGE', 'SEVRAGE') NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_reproduction`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `naissances` (
    `id_naissance` INTEGER NOT NULL AUTO_INCREMENT,
    `reproduction_id` INTEGER NOT NULL,
    `animal_id` INTEGER NOT NULL,
    `poids_naissance` DOUBLE NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'vivant',
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_naissance`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cycle_reproduction` (
    `id_cycle` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `date_chaleur` DATETIME(3) NULL,
    `date_insemination` DATETIME(3) NULL,
    `date_gestation` DATETIME(3) NULL,
    `date_velage_prevu` DATETIME(3) NULL,
    `statut_cycle` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_cycle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NULL,
    `animal_id` INTEGER NULL,
    `lot_id` INTEGER NULL,
    `type_production` VARCHAR(191) NULL,
    `quantite` DOUBLE NULL,
    `unite` VARCHAR(191) NULL,
    `date_collecte` DATETIME(3) NULL,
    `operateur_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `performances` (
    `id_performance` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `type_performance` VARCHAR(191) NOT NULL,
    `valeur` DOUBLE NOT NULL,
    `date_mesure` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_performance`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suivi_poids` (
    `id_suivi` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `poids` DOUBLE NOT NULL,
    `date_mesure` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_suivi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alimentation` (
    `id_aliment` INTEGER NOT NULL AUTO_INCREMENT,
    `type_aliment` VARCHAR(191) NOT NULL,
    `quantite_stock` DOUBLE NOT NULL,
    `unite` VARCHAR(191) NOT NULL DEFAULT 'kg',
    `date_entree` DATETIME(3) NOT NULL,
    `date_sortie` DATETIME(3) NULL,
    `lot_id` INTEGER NULL,

    PRIMARY KEY (`id_aliment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historiques_alimentation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alimentation_id` INTEGER NULL,
    `animal_id` INTEGER NULL,
    `lot_id` INTEGER NULL,
    `type_aliment` VARCHAR(191) NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rations` (
    `id_ration` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `nom_ration` VARCHAR(191) NOT NULL,
    `type_animal` VARCHAR(191) NOT NULL,
    `composition` JSON NOT NULL,
    `cout_kg` DOUBLE NULL,
    `est_actif` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id_ration`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planning_alimentation` (
    `id_planning` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_id` INTEGER NULL,
    `ration_id` INTEGER NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NULL,
    `quantite_jour` DOUBLE NOT NULL,
    `frequence` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_planning`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id_tx` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `reference_type` VARCHAR(191) NULL,
    `reference_id` INTEGER NULL,
    `details` JSON NULL,
    `vente_id` INTEGER NULL,

    PRIMARY KEY (`id_tx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventes` (
    `id_vente` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_vente` ENUM('ANIMAL', 'PRODUIT', 'EQUIPEMENT') NOT NULL,
    `date_vente` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `client` VARCHAR(191) NULL,
    `montant_total` DOUBLE NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'complet',
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_vente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `details_vente` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `vente_id` INTEGER NOT NULL,
    `animal_id` INTEGER NULL,
    `type_produit` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `prix_unitaire` DOUBLE NOT NULL,
    `montant_total` DOUBLE NOT NULL,

    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couts` (
    `id_cout` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_cout` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `date_cout` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `animal_id` INTEGER NULL,
    `lot_id` INTEGER NULL,

    PRIMARY KEY (`id_cout`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rentabilite` (
    `id_rentabilite` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NULL,
    `lot_id` INTEGER NULL,
    `periode_debut` DATETIME(3) NOT NULL,
    `periode_fin` DATETIME(3) NOT NULL,
    `total_ventes` DOUBLE NOT NULL,
    `total_couts` DOUBLE NOT NULL,
    `benefice` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_rentabilite`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipements` (
    `id_equipement` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `type_equipement` VARCHAR(191) NOT NULL,
    `date_acquisition` DATETIME(3) NULL,
    `prix_acquisition` DOUBLE NULL,
    `etat` VARCHAR(191) NOT NULL DEFAULT 'bon',
    `date_derniere_maintenance` DATETIME(3) NULL,
    `prochaine_maintenance` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_equipement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance` (
    `id_maintenance` INTEGER NOT NULL AUTO_INCREMENT,
    `equipement_id` INTEGER NOT NULL,
    `type_maintenance` VARCHAR(191) NOT NULL,
    `date_maintenance` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NOT NULL,
    `cout` DOUBLE NULL,
    `technicien` VARCHAR(191) NULL,
    `prochaine_maintenance` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id_maintenance`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enclos` (
    `id_enclos` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NULL,
    `superficie` DOUBLE NULL,
    `description` VARCHAR(191) NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'actif',

    PRIMARY KEY (`id_enclos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localisation_animaux` (
    `id_localisation` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `enclos_id` INTEGER NOT NULL,
    `date_entree` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_sortie` DATETIME(3) NULL,
    `raison` VARCHAR(191) NULL,

    PRIMARY KEY (`id_localisation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouvements` (
    `id_mouvement` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `type_mouvement` VARCHAR(191) NOT NULL,
    `lieu_origine` VARCHAR(191) NULL,
    `lieu_destination` VARCHAR(191) NULL,
    `date_mouvement` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `raison` VARCHAR(191) NULL,
    `documents` VARCHAR(191) NULL,

    PRIMARY KEY (`id_mouvement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_produits` (
    `id_stock` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_produit` VARCHAR(191) NOT NULL,
    `produit` VARCHAR(191) NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `unite` VARCHAR(191) NOT NULL DEFAULT 'unite',
    `date_entree` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_peremption` DATETIME(3) NULL,
    `prix_unitaire` DOUBLE NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'en_stock',

    PRIMARY KEY (`id_stock`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertes` (
    `id_alerte` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_alerte` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `priorite` VARCHAR(191) NOT NULL DEFAULT 'moyenne',
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_echeance` DATETIME(3) NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'non_lu',
    `entite_associee` VARCHAR(191) NULL,
    `id_entite_associee` INTEGER NULL,

    PRIMARY KEY (`id_alerte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modeles_alertes` (
    `id_modele` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_alerte` VARCHAR(191) NOT NULL,
    `declencheur` VARCHAR(191) NOT NULL,
    `condition` JSON NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `priorite` VARCHAR(191) NOT NULL DEFAULT 'moyenne',

    PRIMARY KEY (`id_modele`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id_notification` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type_notif` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'non_lu',
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_lu` DATETIME(3) NULL,

    PRIMARY KEY (`id_notification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id_session` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_expiration` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,

    UNIQUE INDEX `sessions_token_key`(`token`),
    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preferences` (
    `id_preference` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `langue` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `theme` VARCHAR(191) NOT NULL DEFAULT 'clair',
    `notifications` BOOLEAN NOT NULL DEFAULT true,
    `parametres` JSON NULL,

    UNIQUE INDEX `preferences_utilisateur_id_key`(`utilisateur_id`),
    PRIMARY KEY (`id_preference`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapports` (
    `id_rapport` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_rapport` VARCHAR(191) NOT NULL,
    `periode_debut` DATETIME(3) NOT NULL,
    `periode_fin` DATETIME(3) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `contenu` JSON NOT NULL,
    `date_generation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_rapport`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modeles_rapports` (
    `id_modele_rapport` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `nom_rapport` VARCHAR(191) NOT NULL,
    `type_rapport` VARCHAR(191) NOT NULL,
    `parametres` JSON NOT NULL,
    `est_actif` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id_modele_rapport`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exports` (
    `id_export` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `type_export` VARCHAR(191) NOT NULL,
    `fichier_url` VARCHAR(191) NULL,
    `parametres` JSON NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` VARCHAR(191) NOT NULL DEFAULT 'en_cours',

    PRIMARY KEY (`id_export`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametres_ferme` (
    `id_parametre` INTEGER NOT NULL AUTO_INCREMENT,
    `ferme_id` INTEGER NOT NULL,
    `type_parametre` VARCHAR(191) NOT NULL,
    `cle` VARCHAR(191) NOT NULL,
    `valeur` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `parametres_ferme_ferme_id_cle_key`(`ferme_id`, `cle`),
    PRIMARY KEY (`id_parametre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historique_actions` (
    `id_historique` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NULL,
    `ferme_id` INTEGER NULL,
    `table_cible` VARCHAR(191) NOT NULL,
    `id_cible` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `anciennes_valeurs` JSON NULL,
    `nouvelles_valeurs` JSON NULL,
    `date_action` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(191) NULL,

    PRIMARY KEY (`id_historique`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fermes` ADD CONSTRAINT `fermes_proprietaire_id_fkey` FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lots` ADD CONSTRAINT `lots_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animaux` ADD CONSTRAINT `animaux_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animaux` ADD CONSTRAINT `animaux_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sante` ADD CONSTRAINT `sante_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sante` ADD CONSTRAINT `sante_veterinaire_id_fkey` FOREIGN KEY (`veterinaire_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reproduction` ADD CONSTRAINT `reproduction_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `naissances` ADD CONSTRAINT `naissances_reproduction_id_fkey` FOREIGN KEY (`reproduction_id`) REFERENCES `reproduction`(`id_reproduction`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `naissances` ADD CONSTRAINT `naissances_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cycle_reproduction` ADD CONSTRAINT `cycle_reproduction_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_operateur_id_fkey` FOREIGN KEY (`operateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `performances` ADD CONSTRAINT `performances_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suivi_poids` ADD CONSTRAINT `suivi_poids_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alimentation` ADD CONSTRAINT `alimentation_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historiques_alimentation` ADD CONSTRAINT `historiques_alimentation_alimentation_id_fkey` FOREIGN KEY (`alimentation_id`) REFERENCES `alimentation`(`id_aliment`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historiques_alimentation` ADD CONSTRAINT `historiques_alimentation_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historiques_alimentation` ADD CONSTRAINT `historiques_alimentation_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rations` ADD CONSTRAINT `rations_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_alimentation` ADD CONSTRAINT `planning_alimentation_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_alimentation` ADD CONSTRAINT `planning_alimentation_ration_id_fkey` FOREIGN KEY (`ration_id`) REFERENCES `rations`(`id_ration`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_vente_id_fkey` FOREIGN KEY (`vente_id`) REFERENCES `ventes`(`id_vente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventes` ADD CONSTRAINT `ventes_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `details_vente` ADD CONSTRAINT `details_vente_vente_id_fkey` FOREIGN KEY (`vente_id`) REFERENCES `ventes`(`id_vente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `details_vente` ADD CONSTRAINT `details_vente_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couts` ADD CONSTRAINT `couts_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couts` ADD CONSTRAINT `couts_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couts` ADD CONSTRAINT `couts_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rentabilite` ADD CONSTRAINT `rentabilite_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rentabilite` ADD CONSTRAINT `rentabilite_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id_lot`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipements` ADD CONSTRAINT `equipements_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance` ADD CONSTRAINT `maintenance_equipement_id_fkey` FOREIGN KEY (`equipement_id`) REFERENCES `equipements`(`id_equipement`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enclos` ADD CONSTRAINT `enclos_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `localisation_animaux` ADD CONSTRAINT `localisation_animaux_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `localisation_animaux` ADD CONSTRAINT `localisation_animaux_enclos_id_fkey` FOREIGN KEY (`enclos_id`) REFERENCES `enclos`(`id_enclos`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvements` ADD CONSTRAINT `mouvements_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animaux`(`id_animal`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_produits` ADD CONSTRAINT `stock_produits_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertes` ADD CONSTRAINT `alertes_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modeles_alertes` ADD CONSTRAINT `modeles_alertes_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preferences` ADD CONSTRAINT `preferences_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapports` ADD CONSTRAINT `rapports_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modeles_rapports` ADD CONSTRAINT `modeles_rapports_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exports` ADD CONSTRAINT `exports_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parametres_ferme` ADD CONSTRAINT `parametres_ferme_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historique_actions` ADD CONSTRAINT `historique_actions_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historique_actions` ADD CONSTRAINT `historique_actions_ferme_id_fkey` FOREIGN KEY (`ferme_id`) REFERENCES `fermes`(`id_ferme`) ON DELETE SET NULL ON UPDATE CASCADE;
