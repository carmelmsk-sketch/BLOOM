import type { LucideIcon } from 'lucide-react';

export type Category =
  | 'Business'
  | 'Marketing'
  | 'IA'
  | 'Design'
  | 'Éducation'
  | 'Productivité'
  | 'Finance'
  | 'Développement'
  | 'Création de contenu';

export type DemoProduct = {
  id: string;
  title: string;
  description: string;
  category: Category;
  author: string;
  price: string;
  cover: 'gold' | 'wine' | 'blue' | 'green' | 'pink';
  icon: LucideIcon;
};

export type CreationType = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};