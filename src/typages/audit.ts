// pour les types d'audit
export interface AuditWhere {
  utilisateur_id?: number;
  ferme_id?: number;
  table_cible?: string;
  action?: string;
  date_action?: {
    gte?: Date;
    lte?: Date;
  };
}
