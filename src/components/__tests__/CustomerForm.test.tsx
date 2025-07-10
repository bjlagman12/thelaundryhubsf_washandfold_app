import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerForm from "../CustomerForm";
import { BrowserRouter } from "react-router-dom";

// Mock Firebase addDoc and db
jest.mock("../../firebase", () => ({
  db: {},
}));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  Timestamp: { now: () => new Date() },
}));

// Utility for rendering with router
const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("CustomerForm Happy Path", () => {
  it("lets a customer complete the full workflow with valid data", async () => {
    renderWithRouter(<CustomerForm />);

    // === STEP 0 ===
    // Click "Premium" service
    const premiumButton = screen.getByRole("button", { name: /premium/i });
    userEvent.click(premiumButton);

    // Select a date (simulate typing a date ISO string in the date input)
    // Adjust selector as needed for your DropOffDatePicker
    const dateInput = screen.getByLabelText(/select day/i);
    userEvent.clear(dateInput);
    userEvent.type(dateInput, "2025-07-30");

    // Select a time slot
    userEvent.selectOptions(screen.getByLabelText(/select time/i), [
      "12:00 PM - 02:00 PM",
    ]);

    // Go to next step
    const nextButtons = screen.getByLabelText("Next step");

    userEvent.click(nextButtons);

    // // === STEP 1 ===
    // userEvent.type(screen.getByLabelText(/first name/i), "brad");
    // userEvent.type(screen.getByLabelText(/last name/i), "tom");
    // userEvent.type(screen.getByLabelText(/phone/i), "5551234567");
    // userEvent.type(screen.getByLabelText(/email/i), "frank@laundry.com");
    // userEvent.selectOptions(screen.getByLabelText(/type of laundry/i), [
    //   "mixed",
    // ]);
    // userEvent.selectOptions(screen.getByLabelText(/number of bags/i), ["2"]);
    // userEvent.type(
    //   screen.getByLabelText(/special instructions/i),
    //   "Hang dry sheets"
    // );
    // userEvent.click(screen.getByRole("button", { name: /next/i }));

    // // === STEP 2 === (Review & Confirm)
    // // Agree to terms
    // const agreeCheckbox = screen.getByLabelText(/i agree to the terms/i);
    // userEvent.click(agreeCheckbox);

    // // Submit order
    // userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // // === STEP 3 === (Confirmation)
    // await waitFor(() =>
    //   expect(screen.getByText(/thank you!/i)).toBeInTheDocument()
    // );
    // expect(
    //   screen.getByText(/your order has been received/i)
    // ).toBeInTheDocument();

    // // Order ID should show
    // expect(screen.getByText(/your order number is:/i)).toBeInTheDocument();
  });
});
