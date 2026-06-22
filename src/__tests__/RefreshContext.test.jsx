import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RefreshProvider, useRefresh } from "../RefreshContext";

function TestComponent() {
  const { refreshKey, refreshAppData } = useRefresh();

  return (
    <div>
      <span data-testid="refresh-key">{refreshKey}</span>

      <button onClick={refreshAppData}>
        refresh
      </button>
    </div>
  );
}

describe("RefreshContext", () => {
  test("incrémente refreshKey", async () => {
    render(
      <RefreshProvider>
        <TestComponent />
      </RefreshProvider>
    );

    expect(
      screen.getByTestId("refresh-key").textContent
    ).toBe("0");

    fireEvent.click(
      screen.getByText("refresh")
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("refresh-key").textContent
      ).toBe("1");
    });
  });
})

;
