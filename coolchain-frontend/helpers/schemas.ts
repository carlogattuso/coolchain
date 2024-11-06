import { object, ref, string } from 'yup';

export const RegisterSchema = object().shape({
  name: string().required('Name is required'),
  email: string()
    .email('This field must be an email')
    .required('Email is required'),
  password: string().required('Password is required'),
  confirmPassword: string()
    .required('Confirm password is required')
    .oneOf([ref('password')], 'Passwords must match'),
});

export const AddDeviceSchema = object().shape({
  name: string().required('Name is required'),
  address: string().required('Address is required').test(
      'is-ethereum-address',
      'Invalid address',
      (value) => {
        if (!value) return true;
        return /^0x[a-fA-F0-9]{40}$/.test(value);
      }
  ),
});
