/**
 * Pricing Configuration for CellShop
 * 
 * These are the global pricing rules used to automatically calculate
 * sale prices when products are added via purchase entry or direct registration.
 * 
 * Values are loaded from localStorage if available, otherwise defaults are used.
 * Users can update these settings via the Settings page (/settings).
 */

// LocalStorage Key (must match settings page)
const PRICING_STORAGE_KEY = "cellshop_pricing_config"

// Default configuration values
export const DEFAULT_PRICING_CONFIG = {
    /**
     * Target Profit Margin (as a decimal).
     * Example: 0.50 = 50% margin on sale price (which equals 100% markup on cost)
     */
    TARGET_MARGIN: 0.50, // 50% margin = 100% markup

    /**
     * Sales Tax / Payment Fees (as a decimal).
     * Includes things like credit card fees, marketplace commissions, ICMS, etc.
     */
    SALES_TAX_RATE: 0.05, // 5%

    /**
     * Labor / Commission Rate (as a decimal).
     * The percentage of the sale price for salesperson or operational labor costs.
     */
    LABOR_COMMISSION_RATE: 0.10, // 10%
}

/**
 * Load pricing config from localStorage or return defaults.
 * This function is safe to call on both server and client.
 */
export function getPricingConfig() {
    if (typeof window === "undefined") {
        // Server-side: return defaults
        return DEFAULT_PRICING_CONFIG
    }

    try {
        const saved = localStorage.getItem(PRICING_STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            return {
                TARGET_MARGIN: parsed.TARGET_MARGIN ?? DEFAULT_PRICING_CONFIG.TARGET_MARGIN,
                SALES_TAX_RATE: parsed.SALES_TAX_RATE ?? DEFAULT_PRICING_CONFIG.SALES_TAX_RATE,
                LABOR_COMMISSION_RATE: parsed.LABOR_COMMISSION_RATE ?? DEFAULT_PRICING_CONFIG.LABOR_COMMISSION_RATE,
            }
        }
    } catch (e) {
        console.warn("Failed to load pricing config from localStorage:", e)
    }

    return DEFAULT_PRICING_CONFIG
}

// For backwards compatibility
export const PRICING_CONFIG = DEFAULT_PRICING_CONFIG

/**
 * Calculate the suggested sale price based on the effective cost and configured rates.
 * 
 * Formula: Price = Cost / (1 - Margin - Tax - Labor)
 * 
 * This ensures that after deducting all percentages from the sale price,
 * the remaining profit margin is achieved.
 * 
 * @param effectiveCost The true cost of the product (including freight, taxes on purchase, etc.)
 * @returns The suggested sale price.
 */
export function calculateSuggestedPrice(effectiveCost: number): number {
    const config = getPricingConfig()
    const { TARGET_MARGIN, SALES_TAX_RATE, LABOR_COMMISSION_RATE } = config

    const totalDeductionRate = TARGET_MARGIN + SALES_TAX_RATE + LABOR_COMMISSION_RATE

    // Prevent division by zero or negative prices if rates exceed 100%
    if (totalDeductionRate >= 1) {
        console.warn("Pricing config rates exceed 100%. Falling back to simple 2x markup.")
        return effectiveCost * 2
    }

    const suggestedPrice = effectiveCost / (1 - totalDeductionRate)

    // Round to 2 decimal places
    return Math.round(suggestedPrice * 100) / 100
}

/**
 * Get a breakdown of the price composition for display purposes.
 */
export function getPriceBreakdown(effectiveCost: number, salePrice: number) {
    const config = getPricingConfig()
    const { SALES_TAX_RATE, LABOR_COMMISSION_RATE } = config

    const taxAmount = salePrice * SALES_TAX_RATE
    const laborAmount = salePrice * LABOR_COMMISSION_RATE
    const profit = salePrice - effectiveCost - taxAmount - laborAmount
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0

    return {
        cost: effectiveCost,
        salePrice,
        taxAmount,
        laborAmount,
        profit,
        profitMargin: Math.round(profitMargin * 10) / 10 // one decimal
    }
}
