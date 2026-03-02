export const categories = [
    { title: 'PVC Pipes', img: './pipes.jpg' },
    { title: 'Plumbing Tools', img: './pipes.jpg' },
    { title: 'Bathwares', img: './pipes.jpg' },
    { title: 'Tapes', img: './pipes.jpg' }
];

export const brands = [
    { name: 'SKIPPER', logo: 'https://placehold.co/150x50/2563eb/white?text=SKIPPER' },
    { name: 'ASTRAL', logo: 'https://placehold.co/150x50/1e3a8a/white?text=ASTRAL' },
    { name: 'APL APOLLO', logo: 'https://placehold.co/150x50/f59e0b/white?text=APL+APOLLO' },
    { name: 'FINOLEX', logo: 'https://placehold.co/150x50/475569/white?text=FINOLEX' }
];

export const heroData = {
    title: 'Your One-Stop Destination\nfor Hardware Solutions',
    subtitle: 'Premium Adhesives, Plumbing Solutions &\nIndustrial Supplies',
    stats: 'Multiple Brands • Wholesale Pricing • Reliable Supply'
};

export const products = Array(12).fill({
    name: 'UPVC Solvent - 250ml',
    brand: 'Astral',
    price: '99.00',
    oldPrice: '129.00',
    discount: '5%',
    image: '/pipes.jpg'
});

export const productDetails = {
    name: 'CPVC Pipes - 1.5"',
    description: 'Product description',
    currentPrice: '99.00',
    oldPrice: '129.00',
    discount: '5%',
    image: '/pipes.jpg',
    weights: ['100g', '250g', '500g', '1kg'],
    specifications: [
        { key: 'Product Type', val: 'CPVC Pipe' },
        { key: 'Size', val: '1.5 Inch x 6 feet' },
        { key: 'Application', val: 'Hot & Cold Water Plumbing' },
        { key: 'Material', val: 'Chlorinated Polyvinyl Chloride' },
        { key: 'Pressure Rating', val: 'Suitable for high-pressure plumbing systems' }
    ]
};
