"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARRIER_DELIVERY_ESTIMATES = exports.MIYAKO_CARRIERS = void 0;
/** International carriers supported by MIYAKO (fulfillment architecture). */
exports.MIYAKO_CARRIERS = [
    "ems",
    "dhl",
    "fedex",
    "ups",
];
/** Default estimated delivery windows (days) per carrier for international orders. */
exports.CARRIER_DELIVERY_ESTIMATES = {
    ems: { label: "Japan Post EMS", min: 5, max: 14 },
    dhl: { label: "DHL Express", min: 3, max: 7 },
    fedex: { label: "FedEx International", min: 3, max: 8 },
    ups: { label: "UPS Worldwide", min: 4, max: 10 },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpcHBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaGlwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2RUFBNkU7QUFDaEUsUUFBQSxlQUFlLEdBQUc7SUFDN0IsS0FBSztJQUNMLEtBQUs7SUFDTCxPQUFPO0lBQ1AsS0FBSztDQUNHLENBQUM7QUFhWCxzRkFBc0Y7QUFDekUsUUFBQSwwQkFBMEIsR0FHbkM7SUFDRixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQ2pELEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0lBQzdDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7SUFDdkQsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUU7Q0FDakQsQ0FBQyJ9