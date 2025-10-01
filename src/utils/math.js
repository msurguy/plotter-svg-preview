import { IN_PER_M, MM_PER_M } from "../constants/paper";

export function mmToMeters(mm) {
  return mm / MM_PER_M;
}

export function inchesToMeters(inches) {
  return inches / IN_PER_M;
}

export function metersToMillimeters(meters) {
  return meters * MM_PER_M;
}

export function metersToInches(meters) {
  return meters * IN_PER_M;
}
