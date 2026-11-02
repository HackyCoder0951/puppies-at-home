import type { CmsError } from '../application';

const FIELD_LABEL: Record<string, string> = {
  breed: 'Breed', age: 'Age', ageText: 'Age', sex: 'Sex', origin: 'Origin', priceAed: 'Price', question: 'Question', answer: 'Answer',
  quote: 'Quote', author: 'Author', alt: 'Description of the photo', whatsapp_number: 'WhatsApp number (digits only, with country code)',
  phone_href: 'Phone link (tel:+971…)', email: 'Email', maps_href: 'Maps link', instagram: 'Instagram link', tiktok: 'TikTok link', facebook: 'Facebook link',
  address: 'Address', whatsapp_text: 'WhatsApp message',
};

export function cmsMessage(error: CmsError): string {
  switch (error.code) {
    case 'invalid':
      return error.field && FIELD_LABEL[error.field] ? `Check this field: ${FIELD_LABEL[error.field]}.` : 'Some fields are not valid.';
    case 'forbidden':
      return 'Your role is not allowed to do that.';
    case 'not-found':
      return 'That item no longer exists.';
    case 'conflict':
      return 'Another item already uses that value.';
    case 'unsupported-media':
      return 'Use a JPEG, PNG, WebP or AVIF photo, or an MP4 or WebM video.';
    case 'too-large':
      return 'That file is too large (photos up to 10 MB, videos up to 100 MB).';
    case 'unavailable':
      return 'Could not save right now. Try again shortly.';
  }
}
