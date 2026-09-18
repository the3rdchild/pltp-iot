/*
 * Inline icon set for the public site.
 *
 * Hand-rolled rather than pulled from @mui/icons-material: the landing page is
 * the first thing a visitor loads, and these few glyphs cost bytes instead of
 * an icon package.
 */

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const Icon = ({ size = 24, children, ...rest }) => (
  <svg {...base} width={size} height={size} aria-hidden="true" focusable="false" {...rest}>
    {children}
  </svg>
);

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h13" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

export const ChevronDownIcon = (props) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const MenuIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
);

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m4 12 5 5L20 6" />
  </Icon>
);

export const ClockIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const PulseIcon = (props) => (
  <Icon {...props}>
    <path d="M2 12h4l3 8 6-16 3 8h4" />
  </Icon>
);

export const ShieldIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3 5 6v6c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6l-7-3Z" />
  </Icon>
);

export const UsersIcon = (props) => (
  <Icon {...props}>
    <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
    <circle cx="10" cy="8" r="3.4" />
    <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
    <path d="M15.4 4.6a3.4 3.4 0 0 1 0 6.6" />
  </Icon>
);

export const LeafIcon = (props) => (
  <Icon {...props}>
    <path d="M5 19c0-7 4-11 14-11 0 8-4 12-11 12H5Z" />
    <path d="M5 19c2.5-4 5.5-6.5 9-8" />
  </Icon>
);

export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Icon>
);
