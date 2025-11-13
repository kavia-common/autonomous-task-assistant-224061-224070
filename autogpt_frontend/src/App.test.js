import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from './state/AppProviders';

// Keep this as a light smoke test to ensure App renders with providers.
test('renders Tasks page placeholder by default', async () => {
  render(
    <AppProviders>
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </AppProviders>
  );
  const heading = await screen.findByText(/Tasks/i);
  expect(heading).toBeInTheDocument();
});
