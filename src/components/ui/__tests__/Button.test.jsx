import { render, screen, fireEvent } from "@testing-library/react";

describe("Button Component", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    const { container } = render(
      <button onClick={mockOnClick}>Click me</button>
    );
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    render(<button onClick={mockOnClick}>Click</button>);
    fireEvent.click(screen.getByText("Click"));
    expect(mockOnClick).toHaveBeenCalled();
  });

  test("renders disabled button", () => {
    render(<button disabled>Disabled</button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  test("does not call onClick when disabled", () => {
    render(
      <button disabled onClick={mockOnClick}>
        Disabled
      </button>
    );
    fireEvent.click(screen.getByText("Disabled"));
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
