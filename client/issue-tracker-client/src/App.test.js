import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';
import { act } from "react-dom/test-utils";

// Mock fetch requests
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: jest.fn().mockResolvedValue([]),
    ok: true
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Issue Tracker title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Issue Tracker/i);
  expect(titleElement).toBeInTheDocument();
});

test('displays validation error for invalid ID (not a number)', async () => {
  render(<App />);
  
  // Enter invalid ID (not a number)
  fireEvent.input(screen.getByTestId('issue-id-input'), { target: { value: 'abc' } });
  fireEvent.submit(screen.getByTestId('submit-button'));
  
  // Wait for validation error message
  await waitFor(() => {
    expect(screen.getByTestId('issue-id-error')).toHaveTextContent('ID must be a number and its required');
  });
});

test('submits form successfully on valid input', async () => {
  render(<App />);
  
  // Enter valid data
  fireEvent.input(screen.getByTestId('issue-id-input'), { target: { value: '1234' } });
  fireEvent.input(screen.getByTestId('issue-title-input'), { target: { value: 'Test Issue' } });
  fireEvent.input(screen.getByTestId('issue-description-input'), { target: { value: 'Test Description' } });

  await act(async() =>{
    fireEvent.click(screen.getByText(/Create/i).closest('button'))
  })
  // Wait for API call to finish
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
  
});



