import { usePage } from '@inertiajs/react';

export interface CurrencyConfig {
    code: string;
    symbol: string;
    name?: string;
    decimals?: number;
    symbolPosition?: 'prefix' | 'suffix';
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    decimals: 0,
    symbolPosition: 'prefix',
};

export function formatMoney(
    amount: number | string | null | undefined,
    currency?: Partial<CurrencyConfig>
): string {
    const num = Number(amount) || 0;
    const cfg: CurrencyConfig = { ...DEFAULT_CURRENCY, ...currency };

    const formattedNum = num.toLocaleString('en-US', {
        minimumFractionDigits: cfg.decimals ?? 0,
        maximumFractionDigits: cfg.decimals ?? 0,
    });

    if (cfg.symbolPosition === 'suffix') {
        return `${formattedNum} ${cfg.symbol}`;
    }

    return `${cfg.symbol} ${formattedNum}`;
}

export function useCurrency(): {
    currency: CurrencyConfig;
    format: (amount: number | string | null | undefined) => string;
} {
    const { props } = usePage<{
        tenant?: {
            id: string;
            name: string;
            currency?: CurrencyConfig;
        };
    }>();

    const currency: CurrencyConfig = props.tenant?.currency ?? DEFAULT_CURRENCY;

    return {
        currency,
        format: (amount: number | string | null | undefined) => formatMoney(amount, currency),
    };
}

/**
 * Global Rule for "Collected" Amounts:
 * - If Total Collected == Due (or >= Due & Due > 0): GREEN
 * - If Total Collected > 0 and < Due: ORANGE/AMBER
 * - If Total Collected == 0 (or <= 0): RED
 */
export function getCollectedColorClass(
    collected: number | string | null | undefined,
    due: number | string | null | undefined
): string {
    const col = Number(collected) || 0;
    const total = Number(due) || 0;

    if (col <= 0) {
        return 'text-rose-600 dark:text-rose-400';
    }
    if (total > 0 && col >= total) {
        return 'text-emerald-600 dark:text-emerald-400';
    }
    return 'text-amber-600 dark:text-amber-400';
}

/**
 * Global Rule for "Outstanding" Balance:
 * - If Outstanding == 0 (or <= 0): GREEN
 * - If Outstanding > 0: RED
 */
export function getOutstandingColorClass(
    outstanding: number | string | null | undefined
): string {
    const out = Number(outstanding) || 0;

    if (out <= 0) {
        return 'text-emerald-600 dark:text-emerald-400';
    }
    return 'text-rose-600 dark:text-rose-400';
}

/**
 * Background / Pill Badges for Collected and Outstanding Status
 */
export function getCollectedBadgeVariant(
    collected: number | string | null | undefined,
    due: number | string | null | undefined
): 'success' | 'warning' | 'destructive' | 'secondary' {
    const col = Number(collected) || 0;
    const total = Number(due) || 0;

    if (col <= 0) return 'destructive';
    if (total > 0 && col >= total) return 'success';
    return 'warning';
}

export function getOutstandingBadgeVariant(
    outstanding: number | string | null | undefined
): 'success' | 'destructive' | 'secondary' {
    const out = Number(outstanding) || 0;
    if (out <= 0) return 'success';
    return 'destructive';
}

