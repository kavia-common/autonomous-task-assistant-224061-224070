import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';

test('renders Tasks page placeholder by default', () => {
  render(
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
  const heading = screen.getByText(/Tasks/i);
  expect(heading).toBeInTheDocument();
});
