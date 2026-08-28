import {
  BookOpen,
  BriefcaseBusiness,
  Brush,
  FileText,
  Layers3,
  LayoutTemplate,
  Lightbulb,
  Sparkles,
  Video,
} from 'lucide-react';
import type { Category, CreationType, DemoProduct } from '@/types';

export const categories: Array<'Tout' | Category> = [
  'Tout',
  'Business',
  'Marketing',
  'IA',
  'Design',
  'Éducation',
  'Productivité',
  'Finance',
  'Développement',
  'Création de contenu',
];

export const demoProducts: DemoProduct[] = [
  { id: 'focus-rituel', title: 'Le rituel Focus', description: 'Un système doux pour retrouver de la clarté chaque matin.', category: 'Productivité', author: 'Atelier Nami', price: '12 €', cover: 'gold', icon: Sparkles },
  { id: 'marque-juste', title: 'Construire une marque juste', description: 'Les fondations pour raconter ton projet sans te travestir.', category: 'Marketing', author: 'Studio Sillage', price: '24 €', cover: 'wine', icon: BriefcaseBusiness },
  { id: 'notion-starter', title: 'Notion Starter Studio', description: 'Le template pour donner une maison à tes idées.', category: 'Design', author: 'Mina R.', price: '18 €', cover: 'blue', icon: LayoutTemplate },
  { id: 'newsletter-claire', title: 'Newsletter claire', description: '12 exercices pour écrire, publier et créer un rendez-vous.', category: 'Création de contenu', author: 'Maison Pollen', price: '9 €', cover: 'pink', icon: FileText },
  { id: 'cours-essentiel', title: 'Cours essentiel', description: 'Transforme ton expertise en une expérience qui se retient.', category: 'Éducation', author: 'Léa B.', price: '32 €', cover: 'green', icon: BookOpen },
  { id: 'kit-offre', title: 'Le kit de ton offre', description: 'Un cadre simple pour passer de “je pourrais” à “voici ce que je propose”.', category: 'Business', author: 'Collectif Bloom', price: '15 €', cover: 'gold', icon: Layers3 },
];

export const creationTypes: CreationType[] = [
  { id: 'ebook', title: 'Ebook', description: 'Partager une méthode, une histoire ou une expertise.', icon: BookOpen },
  { id: 'formation', title: 'Formation', description: 'Structurer ce que tu sais en parcours utile.', icon: Video },
  { id: 'pack', title: 'Pack', description: 'Réunir plusieurs ressources qui font gagner du temps.', icon: Layers3 },
  { id: 'template', title: 'Template', description: 'Offrir un point de départ clair et personnalisable.', icon: LayoutTemplate },
  { id: 'guide', title: 'Guide', description: 'Accompagner pas à pas une personne vers son objectif.', icon: Lightbulb },
  { id: 'autre', title: 'Autre', description: 'Ton projet n’entre pas dans une case ? C’est très bien.', icon: Brush },
];