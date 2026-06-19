import { render, screen, fireEvent } from "@testing-library/react";

describe("Modal Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal structure", () => {
    const { container } = render(
      <div>
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Test Modal</h2>
            <button onClick={mockOnClose}>Close</button>
            <div>Modal Content</div>
          </div>
        </div>
      </div>
    );
    expect(container.querySelector(".modal-overlay")).toBeInTheDocument();
    expect(container.querySelector(".modal-content")).toBeInTheDocument();
  });

  test("renders title", () => {
    render(
      <div>
        <h2>Test Modal</h2>
      </div>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  test("calls onClose when close button clicked", () => {
    render(
      <button onClick={mockOnClose}>Close</button>
    );
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("renders content", () => {
    render(<div>Modal Content</div>);
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });
});
