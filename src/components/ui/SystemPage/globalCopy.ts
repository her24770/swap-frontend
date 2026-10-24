export const globalCopy = {
  es: {
    error: { eyebrow: "Algo salió mal", title: "Swap no está disponible en este momento", description: "Ocurrió un problema inesperado. Inténtalo de nuevo o vuelve al inicio." },
    notFound: { eyebrow: "Error 404", title: "No encontramos esta página", description: "Puede que la dirección haya cambiado o que la página ya no exista." },
    retry: "Intentar de nuevo", home: "Volver al inicio",
  },
  en: {
    error: { eyebrow: "Something went wrong", title: "Swap isn't available right now", description: "An unexpected problem occurred. Try again or return to the home page." },
    notFound: { eyebrow: "Error 404", title: "We couldn't find this page", description: "The address may have changed or the page may no longer exist." },
    retry: "Try again", home: "Back to home",
  },
  fr: {
    error: { eyebrow: "Une erreur s'est produite", title: "Swap est indisponible pour le moment", description: "Un problème inattendu s'est produit. Réessayez ou retournez à l'accueil." },
    notFound: { eyebrow: "Erreur 404", title: "Cette page est introuvable", description: "L'adresse a peut-être changé ou la page n'existe plus." },
    retry: "Réessayer", home: "Retour à l'accueil",
  },
} as const;

export type Locale = keyof typeof globalCopy;
