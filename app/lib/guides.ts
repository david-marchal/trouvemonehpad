export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  verifiedOn: string;
  sections: GuideSection[];
  limits: string;
  sources: { label: string; url: string }[];
};

export const GUIDES_VERIFIED_ON = "12 novembre 2026";

export const GUIDES: Guide[] = [
  {
    slug: "lire-une-evaluation-has",
    title: "Lire une évaluation de la HAS",
    summary:
      "Ce que mesurent la lettre et le score d'un EHPAD, et ce qu'ils ne disent pas.",
    verifiedOn: GUIDES_VERIFIED_ON,
    sections: [
      {
        heading: "Qui évalue, et selon quelles règles",
        paragraphs: [
          "Depuis mars 2022, tous les établissements sociaux et médico-sociaux, EHPAD compris, sont évalués avec le même référentiel national, publié par la Haute Autorité de santé (HAS). L'évaluation est menée par un organisme évaluateur extérieur à l'établissement.",
          "Le référentiel compte 3 chapitres (la personne accompagnée, les professionnels, l'établissement et sa gouvernance) et 157 critères, dont 18 critères dits impératifs : ceux que la HAS considère comme indispensables.",
          "Chaque établissement est évalué tous les 5 ans. Avant ce référentiel, le rythme était de 7 ans.",
        ],
      },
      {
        heading: "Ce que vous voyez sur une fiche",
        items: [
          "La lettre, de A à D, est une synthèse. A est la meilleure.",
          "Le score sur 100 est la moyenne des résultats par objectif. Il départage deux établissements de même lettre.",
          "La date d'évaluation. Une évaluation qui approche 5 ans ne reflète peut-être plus l'établissement : changement de direction, d'équipe, de bâtiment.",
          "Le statut juridique (public, privé non lucratif, privé commercial), donné par la HAS avec l'évaluation.",
        ],
      },
      {
        heading: "Ce qu'une note ne dit pas",
        paragraphs: [
          "Une note résume une évaluation faite à un moment donné. Elle ne dit rien de l'ambiance un dimanche après-midi, de la façon dont on répond à une sonnette la nuit, ni de la place qu'on laisse aux habitudes de votre proche.",
          "Le rapport complet, lui, détaille les résultats par chapitre et par critère. Il est transmis au conseil de la vie sociale de l'établissement. Demandez-le lors de la visite : un établissement à l'aise avec son évaluation vous le montre.",
        ],
      },
    ],
    limits:
      "La HAS ne conçoit pas ses évaluations comme un classement : deux établissements ne sont pas toujours comparables, parce que le public accueilli, la taille ou l'organisation diffèrent. Utilisez la note pour poser de meilleures questions, pas pour trancher.",
    sources: [
      {
        label:
          "HAS, évaluation des établissements et services sociaux et médico-sociaux",
        url: "https://www.has-sante.fr/jcms/p_3323113/fr/evaluation-des-etablissements-et-services-sociaux-et-medico-sociaux",
      },
    ],
  },
  {
    slug: "combien-coute-un-ehpad",
    title: "Combien coûte un EHPAD, et quelles aides existent",
    summary:
      "Les trois lignes de la facture, et les aides qui en réduisent le reste à charge.",
    verifiedOn: GUIDES_VERIFIED_ON,
    sections: [
      {
        heading: "Une facture en trois parties",
        items: [
          "L'hébergement : la chambre, les repas, l'entretien, l'animation. C'est le tarif journalier que vous voyez sur chaque fiche, payé par le résident.",
          "La dépendance : le coût de l'aide aux gestes du quotidien. Le tarif dépend du GIR du résident. Pour les GIR 5 et 6, il reste entièrement à sa charge. Pour les GIR 1 à 4, l'APA en couvre une partie.",
          "Les soins : financés par l'Assurance maladie, ils n'apparaissent pas sur la facture du résident.",
        ],
        paragraphs: [
          "Les tarifs d'hébergement et de dépendance varient beaucoup d'un établissement à l'autre. Sur chaque fiche, le calculateur transforme ces tarifs journaliers en montant mensuel (mois de 30 jours) selon le GIR.",
        ],
      },
      {
        heading: "Les aides principales",
        items: [
          "L'APA (allocation personnalisée d'autonomie), pour les personnes de 60 ans et plus classées en GIR 1 à 4. Elle couvre une partie du tarif dépendance. Voir le guide GIR et APA.",
          "L'aide au logement de la CAF ou de la MSA (APL ou ALS), selon les revenus et le prix de la chambre. Elle est en général versée à l'établissement et déduite de la facture.",
          "La réduction d'impôt : 25 % des frais de dépendance et d'hébergement, dans la limite de 10 000 € de dépenses par personne, soit 2 500 € par an au maximum. Elle ne profite qu'aux foyers imposables.",
          "L'aide sociale à l'hébergement (ASH), pour les personnes aux revenus modestes, dans un établissement habilité. Les proches peuvent être sollicités pour contribuer, et une récupération sur la succession est possible après le décès.",
        ],
      },
      {
        heading: "Ce qu'il faut demander avant de signer",
        items: [
          "La liste des prestations comprises dans le tarif et de celles facturées en plus (coiffeur, pédicure, blanchisserie, téléphone).",
          "Le montant du dépôt de garantie, s'il y en a un, et les conditions de restitution.",
          "Si l'établissement est habilité à l'aide sociale, pour le cas où les ressources viendraient à manquer.",
        ],
      },
    ],
    limits:
      "Nos montants se basent sur les tarifs publiés par la CNSA, qui peuvent être en retard sur les tarifs réellement appliqués. Les aides varient selon le département et la situation. Confirmez toujours auprès du conseil départemental, de la CAF ou du CCAS.",
    sources: [
      {
        label: "Aide-sociale.fr, aides financières pour l'EHPAD (mise à jour octobre 2026)",
        url: "https://www.aide-sociale.fr/aides-financieres-ehpad",
      },
      {
        label: "Département de la Manche, fiche APA en établissement",
        url: "https://www.manche.fr/wp-content/uploads/2023/03/manche-Fiche-9-APA-en-ETABLISSEMENT.pdf",
      },
    ],
  },
  {
    slug: "gir-et-apa",
    title: "La dépendance (GIR) et l'APA en établissement",
    summary:
      "Comment le niveau de dépendance fixe votre tarif et ce que l'APA prend en charge.",
    verifiedOn: GUIDES_VERIFIED_ON,
    sections: [
      {
        heading: "Le niveau de dépendance, en une phrase",
        paragraphs: [
          "Le niveau de dépendance d'une personne est mesuré par son GIR (groupe iso-ressources), de 1 à 6, selon sa perte d'autonomie, mesuré avec la grille AGGIR. GIR 1 : la dépendance la plus lourde. GIR 6 : la personne est autonome pour les gestes de la vie courante.",
          "Les tarifs de dépendance d'un EHPAD sont fixés par groupe : GIR 1-2, GIR 3-4, GIR 5-6.",
        ],
      },
      {
        heading: "Ce que couvre l'APA",
        items: [
          "Elle est ouverte aux personnes de 60 ans et plus, classées en GIR 1 à 4, résidant en France de façon stable et régulière.",
          "Elle prend en charge le tarif dépendance de l'établissement pour le GIR de la personne, moins le tarif GIR 5-6, qui reste à la charge du résident (le ticket modérateur).",
          "Selon le département, une participation liée aux revenus peut s'ajouter. Elle augmente avec les revenus.",
          "Selon les établissements, l'APA est versée à l'établissement ou à la personne.",
        ],
      },
      {
        heading: "Comment lire le calculateur du site",
        paragraphs: [
          "Pour un GIR 1 à 4, nous affichons une fourchette. Le bas de la fourchette suppose que l'APA couvre tout sauf le ticket modérateur. Le haut ne compte aucune aide sur la dépendance. Votre vrai montant se situe entre les deux, selon vos revenus et votre département.",
        ],
      },
      {
        heading: "Démarches",
        items: [
          "Demandez à l'équipe de l'établissement une estimation du GIR de votre proche : il conditionne l'APA.",
          "La demande d'APA se fait auprès du conseil départemental. Comptez environ 2 à 3 mois de délai.",
        ],
      },
    ],
    limits:
      "Les règles de calcul de la participation diffèrent d'un département à l'autre. Notre calculateur ne la prend pas en compte.",
    sources: [
      {
        label: "Département de la Manche, fiche APA en établissement",
        url: "https://www.manche.fr/wp-content/uploads/2023/03/manche-Fiche-9-APA-en-ETABLISSEMENT.pdf",
      },
      {
        label: "Aide-sociale.fr, aides financières pour l'EHPAD (mise à jour octobre 2026)",
        url: "https://www.aide-sociale.fr/aides-financieres-ehpad",
      },
    ],
  },
  {
    slug: "questions-a-poser-lors-d-une-visite",
    title: "Les questions à poser lors d'une visite",
    summary:
      "Une liste à imprimer ou à garder sur votre téléphone, pour ne rien oublier sur place.",
    verifiedOn: GUIDES_VERIFIED_ON,
    sections: [
      {
        heading: "Les documents à demander",
        items: [
          "Le contrat de séjour et le règlement de fonctionnement, à lire chez vous avant de signer.",
          "Le rapport d'évaluation HAS complet, pas seulement la lettre.",
          "La liste des prestations comprises dans le tarif et celles facturées en plus.",
          "Le dernier rapport d'inspection de l'agence régionale de santé (ARS), s'il y en a eu un, et les suites données à ses recommandations.",
        ],
      },
      {
        heading: "La vie de tous les jours",
        items: [
          "À quelle heure se lèvent et se couchent les résidents ? Est-ce un horaire imposé ?",
          "Peut-on choisir sa douche, son heure de repas, apporter son mobilier ?",
          "Les repas sont-ils préparés sur place ? Peut-on goûter ?",
          "Que se passe-t-il le week-end et la nuit ? Combien de personnes sont présentes ?",
        ],
      },
      {
        heading: "Les soins",
        items: [
          "Un médecin coordonnateur est-il présent ? Combien de jours par semaine ?",
          "Comment sont gérées les urgences, les hospitalisations et les chutes ?",
          "Que se passe-t-il si l'état de santé de votre proche s'aggrave ? Jusqu'où l'établissement l'accompagne-t-il, y compris en fin de vie ?",
        ],
      },
      {
        heading: "Les chambres et les espaces",
        items: [
          "Quelle est la surface de la chambre ? A-t-elle une salle de bain avec douche accessible ?",
          "La chambre est-elle lumineuse ? Peut-on la personnaliser : meubles, photos, décoration ?",
          "Existe-t-il un jardin ou une terrasse accessibles en sécurité, y compris pour une personne qui se déplace en fauteuil ou qui déambule ?",
          "Comment accéder à l'établissement : transports en commun, parking, accès pour les personnes à mobilité réduite ?",
        ],
      },
      {
        heading: "Si la maladie évolue",
        items: [
          "Existe-t-il une unité adaptée aux troubles cognitifs (unité protégée, pôle d'activités et de soins adaptés) ? Combien de places, et comment y accède-t-on ?",
          "Si l'état de votre proche s'aggrave, peut-il rester dans l'établissement, ou faudra-t-il déménager ?",
        ],
      },
      {
        heading: "La chaleur",
        items: [
          "Comment l'établissement protège-t-il les résidents pendant une canicule ? Existe-t-il un plan prévu pour cela, et le personnel est-il formé ?",
          "Y a-t-il au moins une pièce commune rafraîchie où les résidents peuvent se retrouver ?",
        ],
      },
      {
        heading: "Les visites et la vie sociale",
        items: [
          "Quels sont les horaires de visite ? Peut-on partager un repas avec son proche ?",
          "Un proche peut-il rester la nuit en fin de vie ? Les animaux de compagnie sont-ils acceptés en visite ?",
          "Quelles animations sont proposées, par qui, et à quelle fréquence ? Demandez le programme de la semaine.",
        ],
      },
      {
        heading: "L'équipe",
        items: [
          "Quelle est la rotation du personnel ? Combien de postes sont vacants ?",
          "Y a-t-il des remplacements par de l'intérim ?",
          "Quelle est la place du conseil de la vie sociale ? Quand s'est-il réuni pour la dernière fois ?",
        ],
      },
      {
        heading: "Ce que vous observez",
        items: [
          "Comment le personnel parle-t-il aux résidents ? Frappe-t-il avant d'entrer dans une chambre ?",
          "Les résidents sont-ils habillés, propres, occupés ? Y en a-t-il qui attendent seuls dans les couloirs ?",
          "Les odeurs, le bruit, la lumière. Revenez à un autre moment de la journée si vous le pouvez.",
        ],
      },
    ],
    limits:
      "Ces questions sont des suggestions de bon sens, pas un barème officiel. Une mauvaise réponse n'est pas forcément éliminatoire, mais une absence de réponse mérite attention.",
    sources: [
      {
        label:
          "HAS, évaluation des établissements et services sociaux et médico-sociaux (rapport transmis au conseil de la vie sociale)",
        url: "https://www.has-sante.fr/jcms/p_3323113/fr/evaluation-des-etablissements-et-services-sociaux-et-medico-sociaux",
      },
      {
        label:
          "CapRetraite, grille de notation d'un EHPAD en 15 points (liste des points à observer, reprise sous forme de questions)",
        url: "https://www.capretraite.fr/blog/maisons-de-retraite/comment-choisir-un-ehpad-quand-on-ny-connait-rien-la-grille-de-notation-en-15-points/",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
