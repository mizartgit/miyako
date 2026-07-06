"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORK_METADATA_KEYS = exports.workMetadataSchema = void 0;
exports.parseWorkMetadata = parseWorkMetadata;
const zod_1 = require("zod");
/**
 * MIYAKO "Work" metadata stored on Medusa Product.metadata.
 * Admin enters these fields when creating a product in Medusa Admin.
 * The frontend gallery still uses content/works.json for storytelling;
 * commerce fields (price, inventory) come from Medusa.
 */
exports.workMetadataSchema = zod_1.z.object({
    /** English title (mirrors product.title; kept for bilingual display) */
    titleEn: zod_1.z.string(),
    /** Japanese title — always shown alongside English on the site */
    titleJa: zod_1.z.string(),
    /** Slug reference to content/artists.json */
    artistSlug: zod_1.z.string(),
    artistName: zod_1.z.string(),
    artistNameJa: zod_1.z.string().optional(),
    region: zod_1.z.string(),
    country: zod_1.z.string(),
    technique: zod_1.z.string(),
    materials: zod_1.z.string(),
    dimensions: zod_1.z.string(),
    weight: zod_1.z.string().optional(),
    storyEn: zod_1.z.string(),
    storyJa: zod_1.z.string().optional(),
    oneOfAKind: zod_1.z.boolean().default(false),
    madeToOrder: zod_1.z.boolean().default(false),
    estimatedProductionDays: zod_1.z.number().int().positive().optional(),
    collectionHandle: zod_1.z.string().optional(),
    categoryHandle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    careInstructions: zod_1.z.string().optional(),
    /** Future fields — optional until needed */
    exhibitionHistory: zod_1.z.string().optional(),
    provenance: zod_1.z.string().optional(),
    authenticityCertificate: zod_1.z.string().optional(),
    videoUrl: zod_1.z.string().url().optional(),
});
/** Keys used in Medusa product.metadata (flat JSON). */
exports.WORK_METADATA_KEYS = [
    "titleEn",
    "titleJa",
    "artistSlug",
    "artistName",
    "artistNameJa",
    "region",
    "country",
    "technique",
    "materials",
    "dimensions",
    "weight",
    "storyEn",
    "storyJa",
    "oneOfAKind",
    "madeToOrder",
    "estimatedProductionDays",
    "collectionHandle",
    "categoryHandle",
    "metaDescription",
    "careInstructions",
];
function parseWorkMetadata(metadata) {
    if (!metadata)
        return null;
    const parsed = exports.workMetadataSchema.safeParse(metadata);
    return parsed.success ? parsed.data : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yay1tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndvcmstbWV0YWRhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBaUVBLDhDQU1DO0FBdkVELDZCQUF3QjtBQUV4Qjs7Ozs7R0FLRztBQUNVLFFBQUEsa0JBQWtCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6Qyx3RUFBd0U7SUFDeEUsT0FBTyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbkIsa0VBQWtFO0lBQ2xFLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQ25CLDZDQUE2QztJQUM3QyxVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUN0QixVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUN0QixZQUFZLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNuQyxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixPQUFPLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNuQixTQUFTLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNyQixTQUFTLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNyQixVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUN0QixNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QixPQUFPLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNuQixPQUFPLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM5QixVQUFVLEVBQUUsT0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDdEMsV0FBVyxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLHVCQUF1QixFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDL0QsZ0JBQWdCLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN2QyxjQUFjLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNyQyxlQUFlLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN0QyxnQkFBZ0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3ZDLDRDQUE0QztJQUM1QyxpQkFBaUIsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3hDLFVBQVUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pDLHVCQUF1QixFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDOUMsUUFBUSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDdEMsQ0FBQyxDQUFDO0FBSUgsd0RBQXdEO0FBQzNDLFFBQUEsa0JBQWtCLEdBQUc7SUFDaEMsU0FBUztJQUNULFNBQVM7SUFDVCxZQUFZO0lBQ1osWUFBWTtJQUNaLGNBQWM7SUFDZCxRQUFRO0lBQ1IsU0FBUztJQUNULFdBQVc7SUFDWCxXQUFXO0lBQ1gsWUFBWTtJQUNaLFFBQVE7SUFDUixTQUFTO0lBQ1QsU0FBUztJQUNULFlBQVk7SUFDWixhQUFhO0lBQ2IseUJBQXlCO0lBQ3pCLGtCQUFrQjtJQUNsQixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLGtCQUFrQjtDQUNWLENBQUM7QUFFWCxTQUFnQixpQkFBaUIsQ0FDL0IsUUFBb0Q7SUFFcEQsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPLElBQUksQ0FBQztJQUMzQixNQUFNLE1BQU0sR0FBRywwQkFBa0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDN0MsQ0FBQyJ9