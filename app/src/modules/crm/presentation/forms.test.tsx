import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EnquiryForm } from './EnquiryForm';
import { LetterForm } from './LetterForm';

const letter = (submit = vi.fn().mockResolvedValue({ ok: true, reference: 'abc' })) => {
  render(<LetterForm puppyOptions={['any puppy (not sure yet)', 'Max (Maltipoo, boy)']} submit={submit} whatsappHref="https://wa.me/1" consentVersion="v1" />);
  return submit;
};

describe('LetterForm (contact)', () => {
  it('does not submit invalid input and links to the privacy notice', async () => {
    const submit = letter();
    await userEvent.click(screen.getByRole('button', { name: 'Post my letter' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'privacy notice' })).toHaveAttribute('href', '/privacy');
  });
  it('posts a valid letter and shows the thank-you note', async () => {
    const submit = letter();
    await userEvent.type(screen.getByLabelText('Your name (required)'), 'Sam Test');
    await userEvent.type(screen.getByLabelText(/Phone or WhatsApp/), '+971501234567');
    await userEvent.click(screen.getByRole('button', { name: 'Post my letter' }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    expect(submit.mock.calls[0]?.[0]).toMatchObject({ source: 'contact', puppy: '' });
    await waitFor(() => expect(screen.getByText('Message received!')).toBeInTheDocument(), { timeout: 4000 });
  });
});

describe('EnquiryForm (puppy page)', () => {
  const props = { puppyName: 'Max', defaultMessage: "Hi! I'd love to know more about Max (Maltipoo).", sourcePage: '/puppies/max', whatsappHref: 'https://wa.me/1', consentVersion: 'v1' };
  it('prefills the message and validates', async () => {
    render(<EnquiryForm {...props} submit={vi.fn()} />);
    expect(screen.getByLabelText(/Message/)).toHaveValue(props.defaultMessage);
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByText('Please tell us your name.')).toBeInTheDocument();
  });
  it('shows a retry message with the WhatsApp alternative on failure', async () => {
    render(<EnquiryForm {...props} submit={vi.fn().mockResolvedValue({ ok: false, code: 'unexpected' })} />);
    await userEvent.type(screen.getByLabelText(/Your name/), 'Sam Test');
    await userEvent.type(screen.getByLabelText(/Phone or WhatsApp/), '+971501234567');
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('WhatsApp');
  });
});
