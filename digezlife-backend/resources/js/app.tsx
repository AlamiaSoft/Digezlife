import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Alamia SaaS';

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob<any>([
            './Pages/**/*.tsx',
            '../../modules/**/resources/js/Pages/**/*.tsx',
        ], { eager: true });

        // 1. Direct match in core
        if (pages[`./Pages/${name}.tsx`]) {
            const page = pages[`./Pages/${name}.tsx`];
            return page.default ?? page;
        }

        // 2. Module match (e.g. TravelOS::Customers/Index or TravelOS/Customers/Index)
        const cleanName = name.replace('::', '/');
        const parts = cleanName.split('/');
        const moduleName = parts[0];
        const subPath = parts.slice(1).join('/');

        if (moduleName && subPath) {
            const moduleKey = `../../modules/${moduleName}/resources/js/Pages/${subPath}.tsx`;
            if (pages[moduleKey]) {
                const page = pages[moduleKey];
                return page.default ?? page;
            }
        }

        // 3. Fallback fuzzy search
        for (const [path, page] of Object.entries(pages)) {
            if (
                path.endsWith(`/${cleanName}.tsx`) ||
                (subPath && path.toLowerCase().includes(moduleName.toLowerCase()) && path.endsWith(`/${subPath}.tsx`)) ||
                path.endsWith(`/${name}.tsx`)
            ) {
                return page.default ?? page;
            }
        }

        throw new Error(`Page component [${name}] not found. Available paths:\n${Object.keys(pages).join('\n')}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4F46E5',
        showSpinner: true,
    },
});
