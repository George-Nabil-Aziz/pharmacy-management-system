import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';
import { usePreferences } from './stores/preferences';

afterEach(() => {
  act(() => {
    usePreferences.setState({ language: 'ar', theme: 'system' });
  });
});

describe('App shell', () => {
  it('renders Arabic RTL by default and switches to English LTR', async () => {
    render(<App />);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(screen.getByRole('heading', { name: 'نظام إدارة الصيدلية' })).toBeInTheDocument();

    await act(async () => {
      usePreferences.getState().setLanguage('en');
    });

    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { name: 'Pharmacy Management System' })).toBeInTheDocument();
  });

  it('applies the dark class for the dark theme and removes it for light', async () => {
    render(<App />);

    await act(async () => {
      usePreferences.getState().setTheme('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await act(async () => {
      usePreferences.getState().setTheme('light');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
