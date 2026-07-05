/**
 * Shipping carrier architecture for MIYAKO.
 *
 * Each carrier will become a Medusa fulfillment provider module.
 * Phase 1: architecture + estimated delivery metadata only.
 * Phase 2: live rate quotes via carrier APIs.
 *
 * @see shared/src/shipping.ts for carrier definitions
 */

export const SHIPPING_MODULE_README = `
MIYAKO international shipping carriers:

- EMS (Japan Post) — default for domestic + many international routes
- DHL Express
- FedEx International
- UPS Worldwide

Implement as Medusa fulfillment providers under:
  backend/src/modules/fulfillment/{ems,dhl,fedex,ups}/

Each provider should:
1. Register with Medusa Fulfillment Module
2. Return rate quotes with estimated delivery windows
3. Support multi-currency amounts (JPY base)
4. Handle international customs metadata on line items (Work metadata)
`;
