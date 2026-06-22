import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../ToastContext";

function TestComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast("Message test", "success")}>
      show toast
    </button>
  );
}

describe("ToastContext", () => {
  test("affiche un toast", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText("show toast").click();
    });

    expect(screen.getByText("Message test")).toBeInTheDocument();
  });
});
