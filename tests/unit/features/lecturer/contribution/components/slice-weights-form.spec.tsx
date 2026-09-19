import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { SliceWeightsForm } from "@/features/lecturer/contribution/components/slice-weights-form";

vi.mock("@/components/ui/slider", () => ({
  Slider: () => <div aria-hidden />,
}));

describe("SliceWeightsForm", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "B",
      executedDate: "18/09/2026",
      description: "Trong so 0 phan tram khong tao mau tren donut va thanh ty trong",
    },
    () => {
      render(
        <SliceWeightsForm
          initialWeights={{
            codeWeight: 60,
            testWeight: 20,
            documentWeight: 20,
            researchWeight: 0,
          }}
          hideSave
          onSave={vi.fn()}
        />
      );

      expect(screen.getAllByTestId(/^slice-donut-segment-/)).toHaveLength(3);
      expect(screen.getAllByTestId(/^slice-bar-segment-/)).toHaveLength(3);
      expect(screen.queryByTestId("slice-donut-segment-researchWeight")).toBeNull();
      expect(screen.queryByTestId("slice-bar-segment-researchWeight")).toBeNull();
      expect(screen.getByTestId("slice-legend-researchWeight").textContent).toContain("Research");
      expect(screen.getByTestId("slice-legend-researchWeight").textContent).toContain("0%");
    }
  );
});
