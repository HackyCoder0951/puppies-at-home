import type { PuppyAdminDetail } from '@backend/modules/cms';
import { SelectField, TextField } from '../ActionForm';

const SEX = [{ value: 'male', label: 'Boy' }, { value: 'female', label: 'Girl' }, { value: 'male-female', label: 'Boy & girl' }];
const ORIGIN = [{ value: 'local', label: 'In Dubai' }, { value: 'imported', label: 'Imported for you' }];

export function PuppyFields({ puppy }: { puppy?: PuppyAdminDetail }) {
  return (
    <>
      <TextField name="name" label="Personal name (leave empty to show the breed)" defaultValue={puppy?.name} required={false} />
      <TextField name="breed" label="Breed (shown as the title)" defaultValue={puppy?.breed} />
      <TextField name="breeds" label="Breed filters" defaultValue={puppy?.breeds.join(', ')} required={false} hint="Comma separated, for example Maltipoo, Poodle." />
      <TextField name="collections" label="Collections" defaultValue={puppy?.collections.join(', ')} required={false} hint="For example Korean Teacup." />
      <SelectField name="sex" label="Sex" options={SEX} defaultValue={puppy?.sex} />
      <TextField name="ageText" label="Age" defaultValue={puppy?.ageText} hint="For example 3 months." />
      <TextField name="colour" label="Colour" defaultValue={puppy?.colour} required={false} />
      <SelectField name="origin" label="Where" options={ORIGIN} defaultValue={puppy?.origin} />
      <TextField name="priceAed" label="Internal price (AED, never shown on the site)" defaultValue={puppy?.priceAed} type="number" required={false} />
    </>
  );
}
