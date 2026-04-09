export type AvatarStyle =
  | "tiger"
  | "dog"
  | "cat"
  | "cow"
  | "frog"
  | "bear"
  | "ghost"
  | "cloud"
  | "mushroom"
  | "alien"
  | "bread"
  | "star";

export const AVATAR_OPTIONS: { id: AvatarStyle; label: string }[] = [
  { id: "tiger", label: "Tiger" },
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
  { id: "cow", label: "Cow" },
  { id: "frog", label: "Frog" },
  { id: "bear", label: "Bear" },
  { id: "ghost", label: "Ghost" },
  { id: "cloud", label: "Cloud" },
  { id: "mushroom", label: "Mushroom" },
  { id: "alien", label: "Alien" },
  { id: "bread", label: "Bread" },
  { id: "star", label: "Star" },
];
