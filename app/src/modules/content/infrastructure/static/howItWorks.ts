import type { HowItWorksCopy } from '../../domain';

/** Page copy as shown on the reference site (public marketing text). */
export const howItWorksCopy: HowItWorksCopy = {
  intro:
    'Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make the experience unforgettable.',
  ways: {
    dubai: {
      label: 'In Dubai',
      sub: 'meet in person',
      heading: 'Meet your puppy in person',
      paragraphs: [
        "Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face. We source healthy, well-socialized puppies from trusted local breeders, ensuring they're raised with care, proper nutrition, and veterinary checks.",
      ],
      place: 'Downtown Dubai',
      steps: [
        { title: 'Explore our puppies', text: 'Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.' },
        { title: 'Choose your puppy', text: 'Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.' },
        { title: 'Meet before you choose', text: 'Spend time bonding before making your decision.' },
        { title: 'Pick-up or delivery', text: 'Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.' },
      ],
    },
    imported: {
      label: 'Imported',
      sub: 'order upon request',
      heading: 'Order upon request',
      paragraphs: [
        "Looking for a truly exceptional companion? Our Order Upon Request service gives you access to some of the world's most sought-after teacup breeds — ethically sourced from the most reputable, certified breeders across Europe, Korea, and beyond.",
        "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world's finest puppies to Dubai, just for you.",
      ],
      place: 'Europe · Korea → Dubai',
      steps: [
        { title: 'Reserve your puppy', text: 'Browse our selection of available breeds and place a reservation for the teacup puppy that captures your heart. Our reservation-only model ensures that each puppy is specifically sourced to meet your preferences.' },
        { title: 'Personalized consultation', text: "Once your reservation is confirmed, we will work closely with you to finalize details and provide updates on your puppy's journey." },
        { title: 'Import and arrival', text: 'We manage all aspects of the import process, including health checks, travel arrangements, and necessary documentation. Your puppy will be carefully transported and will arrive ready to join your family.' },
        { title: 'Welcome home', text: 'Upon arrival, we provide support to help your new puppy acclimate to their new environment. Our team is available for any additional assistance and to ensure a smooth transition into your home.' },
      ],
    },
  },
  promise: [
    { title: 'Hand-selected breeders', text: 'We work only with breeders who uphold the highest ethical and health standards.' },
    { title: 'Full transparency', text: 'Photos, videos, and health certificates are shared before your puppy travels.' },
    { title: 'Safe, stress-free delivery', text: 'We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.' },
  ],
  deliveryIntro: 'From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and arrives safely.',
  delivery: [
    { title: 'Take your puppy home the same day', text: 'Local puppies are available immediately — visit, fall in love, and go home together.' },
    { title: 'Delivery within Dubai', text: 'Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably.' },
    { title: 'Safe international cargo', text: 'We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free.' },
    { title: 'Worldwide delivery', text: 'We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.' },
  ],
  whyIntro:
    "We're here to help you find a new family member. From the moment you visit our site to the joyful day your puppy arrives at your door, we're with you every step of the way. Our mission is to make the entire adoption process smooth, transparent, and full of love.",
  whyUs: [
    { title: 'International cargo', text: 'We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.' },
    { title: 'Support 24/7', text: "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away." },
    { title: 'Health guarantee', text: 'All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.' },
  ],
  closing: {
    title: 'Unique and high quality puppies',
    text: "When you choose TeddyPups, you can trust that you're getting a puppy of the highest quality. We also provide guidance and support to new pet owners, offering advice on training, nutrition, and general care to ensure a smooth transition for you and your new furry friend.",
  },
};
