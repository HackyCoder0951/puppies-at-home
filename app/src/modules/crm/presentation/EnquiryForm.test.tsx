import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EnquiryForm } from './EnquiryForm';

const props = { source: 'contact' as const, submitLabel: 'Post my letter', consentVersion: 'v1', sourcePage: '/contact', whatsappUrl: 'https://wa.me/1' };

describe('EnquiryForm', () => {
  it('shows inline errors and does not submit invalid input', async () => {
    const submit = vi.fn();
    render(<EnquiryForm {...props} submit={submit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Post my letter' }));
    expect(await screen.findByText('Please tell us your name.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
  it('keeps optional consent boxes unticked and links to the privacy notice', () => {
    render(<EnquiryForm {...props} submit={vi.fn()} />);
    for (const box of screen.getAllByRole('checkbox')) expect(box).not.toBeChecked();
    expect(screen.getByRole('link', { name: 'privacy notice' })).toHaveAttribute('href', '/privacy');
  });
  it('shows success after a valid submission', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true, reference: 'abcdef123456' });
    render(<EnquiryForm {...props} submit={submit} />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Sam Test');
    await userEvent.type(screen.getByLabelText(/Phone/), '+971501234567');
    await userEvent.click(screen.getByRole('button', { name: 'Post my letter' }));
    await waitFor(() => expect(screen.getByText(/Your letter is posted/)).toBeInTheDocument());
    expect(submit).toHaveBeenCalledOnce();
  });
  it('shows a retry message with the WhatsApp alternative on failure', async () => {
    render(<EnquiryForm {...props} submit={vi.fn().mockResolvedValue({ ok: false, code: 'unexpected' })} />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Sam Test');
    await userEvent.type(screen.getByLabelText(/Phone/), '+971501234567');
    await userEvent.click(screen.getByRole('button', { name: 'Post my letter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Chat on WhatsApp');
  });
});
