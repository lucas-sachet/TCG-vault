import type { BinderDemoCard, ShowcasePortfolioCard } from './landingTypes';

export const showcasePortfolioCards: ShowcasePortfolioCard[] = [
    {
        name: 'Umbreon VMAX (Alt Art)',
        set: 'Evolving Skies',
        number: '215/203',
        purchasePrice: 450,
        currentValue: 980,
        image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
        rarity: 'Illustration Rare',
        condition: 'PSA 10 Gem Mint',
    },
    {
        name: 'Charizard ex (Special Illustration)',
        set: 'Obsidian Flames',
        number: '223/197',
        purchasePrice: 120,
        currentValue: 285,
        image: 'https://images.pokemontcg.io/sv3/223_hires.png',
        rarity: 'Special Illustration Rare',
        condition: 'Raw NM',
    },
    {
        name: 'Lugia V (Alt Art)',
        set: 'Silver Tempest',
        number: '186/195',
        purchasePrice: 140,
        currentValue: 220,
        image: 'https://images.pokemontcg.io/sit1/186_hires.png',
        rarity: 'Special Illustration Rare',
        condition: 'CGC 9.5 Mint',
    },
];

export const totalShowcaseValue = showcasePortfolioCards.reduce(
    (accumulator, card) => accumulator + card.currentValue,
    0,
);

export const totalShowcaseCost = showcasePortfolioCards.reduce(
    (accumulator, card) => accumulator + card.purchasePrice,
    0,
);

export const totalShowcaseRoi =
    ((totalShowcaseValue - totalShowcaseCost) / totalShowcaseCost) * 100;

export const binderDemoCards: BinderDemoCard[] = [
    {
        slot: 1,
        name: 'Charizard ex (SIR)',
        set: 'Obsidian Flames',
        number: '223/197',
        purchasePrice: 120,
        currentValue: 285,
        image: 'https://images.pokemontcg.io/sv3/223_hires.png',
        condition: 'Raw NM',
        roi: 137.5,
    },
    {
        slot: 2,
        name: 'Blastoise ex (SIR)',
        set: 'Scarlet & Violet 151',
        number: '200/165',
        purchasePrice: 65,
        currentValue: 110,
        image: 'https://images.pokemontcg.io/sv3pt5/200_hires.png',
        condition: 'PSA 9 Mint',
        roi: 69.2,
    },
    {
        slot: 3,
        name: 'Venusaur ex (SIR)',
        set: 'Scarlet & Violet 151',
        number: '198/165',
        purchasePrice: 45,
        currentValue: 75,
        image: 'https://images.pokemontcg.io/sv3pt5/198_hires.png',
        condition: 'Raw NM',
        roi: 66.7,
    },
    {
        slot: 4,
        isEmpty: true,
    },
    {
        slot: 5,
        name: 'Umbreon VMAX (Alt Art)',
        set: 'Evolving Skies',
        number: '215/203',
        purchasePrice: 450,
        currentValue: 980,
        image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
        condition: 'PSA 10 Gem Mint',
        roi: 117.8,
    },
    {
        slot: 6,
        name: 'Lugia V (Alt Art)',
        set: 'Silver Tempest',
        number: '186/195',
        purchasePrice: 140,
        currentValue: 220,
        image: 'https://images.pokemontcg.io/sit1/186_hires.png',
        condition: 'CGC 9.5 Mint',
        roi: 57.1,
    },
    {
        slot: 7,
        name: 'Giratina V (Alt Art)',
        set: 'Lost Origin',
        number: '186/196',
        purchasePrice: 180,
        currentValue: 395,
        image: 'https://images.pokemontcg.io/swsh11/186_hires.png',
        condition: 'Raw NM',
        roi: 119.4,
    },
    {
        slot: 8,
        isEmpty: true,
    },
    {
        slot: 9,
        name: 'Rayquaza VMAX (Alt Art)',
        set: 'Evolving Skies',
        number: '218/203',
        purchasePrice: 200,
        currentValue: 450,
        image: 'https://images.pokemontcg.io/swsh7/218_hires.png',
        condition: 'BGS 9.5 Gem Mint',
        roi: 125.0,
    },
];
