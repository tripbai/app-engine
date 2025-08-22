import { FeaturesList } from "./features.list";

export function assertIsFeatureKey(
  value: unknown
): asserts value is keyof FeaturesList {
  if (typeof value !== "string") {
    throw new Error("feature key must be typeof string");
  }
  if (!/^[a-z]+(_[a-z]+)*$/.test(value)) {
    throw new Error("invalid feature key format");
  }
  const FeatMap = new FeaturesList();
  if (!(value in FeatMap)) {
    throw new Error("feature key must be existing");
  }
}

export function assertIsFeatureCategory(
  value: unknown
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("feature category must be typeof string");
  }
}

export function assertIsFeatureDescription(
  value: unknown
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("feature description must be typeof string");
  }
  if (value.length === 0 || value.length > 256) {
    throw new Error(
      "feature description value must be within 0 - 256 characters"
    );
  }
}
