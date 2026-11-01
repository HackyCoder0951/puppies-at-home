import type { HowItWorksCopy } from '../../domain';

/** Authored page copy (original wording; structure follows the reference). */
const ways: HowItWorksCopy['ways'] = {
  dubai: {
    label: 'In Dubai (meet in person)',
    heading: 'Meet your puppy in our Downtown Dubai showroom',
    intro: 'Come and spend time with the puppies before you decide.',
    steps: [
      { title: 'Book a visit', text: 'Message us on WhatsApp and pick a time that suits you.' },
      { title: 'Meet the pups', text: 'Spend time with the puppies and ask us anything.' },
      { title: 'Choose together', text: 'We help you find the right match for your home.' },
      { title: 'Take them home', text: 'Collect your puppy with their health certificate and care guide.' },
    ],
  },
  imported: {
    label: 'Imported (order upon request)',
    heading: 'Have a rare breed imported just for you',
    intro: 'We work with trusted breeders abroad and look after the whole journey.',
    steps: [
      { title: 'Tell us your wish', text: 'Share the breed, size and temperament you are looking for.' },
      { title: 'We find your puppy', text: 'We match you with a healthy puppy from a trusted breeder.' },
      { title: 'Photos and papers', text: 'You see photos, video and health details before anything is final.' },
      { title: 'Safe travel home', text: 'Your puppy flies to Dubai with full paperwork and our support.' },
    ],
  },
};

const promise = ['Verified health certificate for every puppy', 'Vaccinated, dewormed and thoroughly checked', 'Real photos and video before you decide'];
const delivery = [
  ['Delivery in the U.A.E.', 'We can bring your puppy to your door.'],
  ['Collection', 'Collect from our Downtown Dubai showroom.'],
  ['Airport pick-up', 'Meet your imported puppy at arrivals.'],
  ['After-care', 'Our team stays in touch after your puppy is home.'],
] as const;
const whyUs = ['Healthy, well-socialised puppies', 'Honest, friendly guidance', '24/7 support through the journey', 'Rare and premium breeds'];

export const howItWorksCopy: HowItWorksCopy = { ways, promise, delivery, whyUs };
